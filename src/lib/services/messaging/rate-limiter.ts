/**
 * WhatsApp Rate Limiter
 * Protects against Meta API rate limits (100 requests/minute, we use 80 for safety)
 */

import { WhatsAppLogger } from './whatsapp.types'

export interface RateLimiterConfig {
  maxRequestsPerMinute: number
  windowMs: number
  jitter: boolean
}

export interface RateLimitStatus {
  current: 'ok' | 'warning' | 'limited'
  remaining: number
  resetTime: Date
  waitTime?: number
}

export class WhatsAppRateLimiter {
  private requests: Date[] = []
  private readonly config: RateLimiterConfig
  private readonly logger: WhatsAppLogger

  constructor(
    config: Partial<RateLimiterConfig> = {},
    logger: WhatsAppLogger
  ) {
    this.config = {
      maxRequestsPerMinute: 80, // Conservative limit (Meta allows 100)
      windowMs: 60000, // 1 minute window
      jitter: true, // Add randomness to prevent thundering herd
      ...config
    }
    this.logger = logger
  }

  /**
   * Check if a request can be made and wait if necessary
   * Returns the time waited (for metrics)
   */
  async waitIfNeeded(): Promise<number> {
    const status = this.getStatus()

    if (status.current === 'limited') {
      const waitTime = status.waitTime || 0

      this.logger.warn('Rate limit protection activated', {
        waitTime,
        requestsInWindow: this.requests.length,
        maxRequests: this.config.maxRequestsPerMinute,
        resetTime: status.resetTime
      })

      await this.wait(waitTime)
      return waitTime
    }

    if (status.current === 'warning') {
      this.logger.debug('Rate limit warning', {
        remaining: status.remaining,
        requestsInWindow: this.requests.length
      })
    }

    // Record this request
    this.recordRequest()
    return 0
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitStatus {
    this.cleanOldRequests()

    const now = new Date()
    const remaining = this.config.maxRequestsPerMinute - this.requests.length
    const resetTime = new Date(now.getTime() + this.config.windowMs)

    if (remaining <= 0) {
      // Rate limited - calculate wait time
      const oldestRequest = this.requests[0]
      const waitTime = oldestRequest
        ? this.config.windowMs - (now.getTime() - oldestRequest.getTime())
        : this.config.windowMs

      return {
        current: 'limited',
        remaining: 0,
        resetTime,
        waitTime: Math.max(0, waitTime)
      }
    }

    if (remaining <= 5) {
      // Warning threshold
      return {
        current: 'warning',
        remaining,
        resetTime
      }
    }

    return {
      current: 'ok',
      remaining,
      resetTime
    }
  }

  /**
   * Get metrics for monitoring
   */
  getMetrics() {
    this.cleanOldRequests()

    return {
      requestsInWindow: this.requests.length,
      maxRequests: this.config.maxRequestsPerMinute,
      utilization: (this.requests.length / this.config.maxRequestsPerMinute) * 100,
      oldestRequest: this.requests[0]?.toISOString(),
      newestRequest: this.requests[this.requests.length - 1]?.toISOString()
    }
  }

  /**
   * Reset rate limiter (for testing)
   */
  reset(): void {
    this.requests = []
    this.logger.debug('Rate limiter reset')
  }

  /**
   * Force add requests (for testing)
   */
  simulateRequests(count: number): void {
    const now = new Date()
    for (let i = 0; i < count; i++) {
      this.requests.push(new Date(now.getTime() - (i * 1000)))
    }
    this.logger.debug('Simulated requests added', { count })
  }

  private recordRequest(): void {
    const now = new Date()
    this.requests.push(now)

    // Keep array size reasonable
    if (this.requests.length > this.config.maxRequestsPerMinute * 2) {
      this.requests = this.requests.slice(-this.config.maxRequestsPerMinute)
    }
  }

  private cleanOldRequests(): void {
    const cutoff = new Date(Date.now() - this.config.windowMs)
    this.requests = this.requests.filter(req => req > cutoff)
  }

  private async wait(ms: number): Promise<void> {
    let waitTime = ms

    // Add jitter to prevent thundering herd
    if (this.config.jitter && waitTime > 1000) {
      const jitterMs = Math.random() * Math.min(waitTime * 0.1, 5000)
      waitTime += jitterMs
    }

    return new Promise(resolve => {
      setTimeout(resolve, Math.max(0, waitTime))
    })
  }
}

/**
 * Singleton rate limiter instance
 */
let globalRateLimiter: WhatsAppRateLimiter | null = null

export const createRateLimiter = (
  config?: Partial<RateLimiterConfig>,
  logger?: WhatsAppLogger
): WhatsAppRateLimiter => {
  if (!logger) {
    // Default logger implementation
    logger = {
      error: (msg, meta) => console.error(`[WhatsApp RateLimit] ${msg}`, meta),
      warn: (msg, meta) => console.warn(`[WhatsApp RateLimit] ${msg}`, meta),
      info: (msg, meta) => console.info(`[WhatsApp RateLimit] ${msg}`, meta),
      debug: (msg, meta) => console.debug(`[WhatsApp RateLimit] ${msg}`, meta)
    }
  }

  return new WhatsAppRateLimiter(config, logger)
}

export const getGlobalRateLimiter = (
  config?: Partial<RateLimiterConfig>,
  logger?: WhatsAppLogger
): WhatsAppRateLimiter => {
  if (!globalRateLimiter) {
    globalRateLimiter = createRateLimiter(config, logger)
  }
  return globalRateLimiter
}

export const resetGlobalRateLimiter = (): void => {
  globalRateLimiter = null
}