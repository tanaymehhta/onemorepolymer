/**
 * WhatsApp Circuit Breaker
 * Protects against cascading failures by stopping requests when error threshold is reached
 * Three states: CLOSED (normal), OPEN (blocking), HALF_OPEN (testing recovery)
 */

import { WhatsAppLogger, CircuitBreakerState } from './whatsapp.types'

export interface CircuitBreakerConfig {
  failureThreshold: number
  timeoutMs: number
  monitoringWindowMs: number
  minimumRequestThreshold: number
}

export interface CircuitBreakerMetrics {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failures: number
  successes: number
  requests: number
  failureRate: number
  nextAttemptTime?: Date
  stateChangedAt: Date
  timeInCurrentState: number
}

export class WhatsAppCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  private failures = 0
  private successes = 0
  private requests = 0
  private lastFailureTime = 0
  private stateChangedAt = Date.now()
  private readonly config: CircuitBreakerConfig
  private readonly logger: WhatsAppLogger

  constructor(
    config: Partial<CircuitBreakerConfig> = {},
    logger: WhatsAppLogger
  ) {
    this.config = {
      failureThreshold: 10, // Number of failures before opening
      timeoutMs: 300000, // 5 minutes before attempting recovery
      monitoringWindowMs: 60000, // 1 minute monitoring window
      minimumRequestThreshold: 5, // Minimum requests before failure rate calculation
      ...config
    }
    this.logger = logger
  }

  /**
   * Execute an operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('HALF_OPEN')
      } else {
        throw new CircuitBreakerOpenError(
          'Circuit breaker is OPEN - WhatsApp service unavailable',
          this.getNextAttemptTime()
        )
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    const now = Date.now()
    const failureRate = this.requests >= this.config.minimumRequestThreshold
      ? (this.failures / this.requests) * 100
      : 0

    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      requests: this.requests,
      failureRate: Math.round(failureRate * 100) / 100,
      nextAttemptTime: this.state === 'OPEN' ? this.getNextAttemptTime() : undefined,
      stateChangedAt: new Date(this.stateChangedAt),
      timeInCurrentState: now - this.stateChangedAt
    }
  }

  /**
   * Force reset the circuit breaker (for testing/manual intervention)
   */
  reset(): void {
    this.logger.info('Circuit breaker manually reset')
    this.transitionTo('CLOSED')
    this.resetCounters()
  }

  /**
   * Force open the circuit breaker (for maintenance)
   */
  forceOpen(): void {
    this.logger.warn('Circuit breaker manually opened')
    this.transitionTo('OPEN')
  }

  private onSuccess(): void {
    this.successes++
    this.requests++

    if (this.state === 'HALF_OPEN') {
      this.logger.info('Circuit breaker test request succeeded, closing circuit')
      this.transitionTo('CLOSED')
      this.resetCounters()
    }

    this.cleanOldMetrics()
  }

  private onFailure(): void {
    this.failures++
    this.requests++
    this.lastFailureTime = Date.now()

    const failureRate = this.failures / this.requests

    this.logger.warn('Circuit breaker recorded failure', {
      failures: this.failures,
      requests: this.requests,
      failureRate: Math.round(failureRate * 100) / 100
    })

    if (this.state === 'HALF_OPEN') {
      this.logger.error('Circuit breaker test request failed, reopening circuit')
      this.transitionTo('OPEN')
    } else if (
      this.state === 'CLOSED' &&
      this.failures >= this.config.failureThreshold
    ) {
      this.logger.error('Circuit breaker failure threshold reached, opening circuit', {
        threshold: this.config.failureThreshold,
        failures: this.failures,
        timeoutMinutes: this.config.timeoutMs / 60000
      })
      this.transitionTo('OPEN')
    }

    this.cleanOldMetrics()
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.timeoutMs
  }

  private getNextAttemptTime(): Date {
    return new Date(this.lastFailureTime + this.config.timeoutMs)
  }

  private transitionTo(newState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'): void {
    const oldState = this.state
    this.state = newState
    this.stateChangedAt = Date.now()

    this.logger.info('Circuit breaker state transition', {
      from: oldState,
      to: newState,
      timestamp: new Date(this.stateChangedAt).toISOString()
    })
  }

  private resetCounters(): void {
    this.failures = 0
    this.successes = 0
    this.requests = 0
  }

  private cleanOldMetrics(): void {
    // In a production environment, you might want to maintain a sliding window
    // For now, we reset counters periodically to prevent overflow
    if (this.requests > 1000) {
      this.logger.debug('Resetting circuit breaker counters to prevent overflow')
      this.resetCounters()
    }
  }
}

/**
 * Circuit Breaker Open Error
 */
export class CircuitBreakerOpenError extends Error {
  constructor(
    message: string = 'Circuit breaker is open',
    public nextAttemptTime?: Date
  ) {
    super(message)
    this.name = 'CircuitBreakerOpenError'
  }
}

/**
 * Singleton circuit breaker instance
 */
let globalCircuitBreaker: WhatsAppCircuitBreaker | null = null

export const createCircuitBreaker = (
  config?: Partial<CircuitBreakerConfig>,
  logger?: WhatsAppLogger
): WhatsAppCircuitBreaker => {
  if (!logger) {
    // Default logger implementation
    logger = {
      error: (msg, meta) => console.error(`[WhatsApp CircuitBreaker] ${msg}`, meta),
      warn: (msg, meta) => console.warn(`[WhatsApp CircuitBreaker] ${msg}`, meta),
      info: (msg, meta) => console.info(`[WhatsApp CircuitBreaker] ${msg}`, meta),
      debug: (msg, meta) => console.debug(`[WhatsApp CircuitBreaker] ${msg}`, meta)
    }
  }

  return new WhatsAppCircuitBreaker(config, logger)
}

export const getGlobalCircuitBreaker = (
  config?: Partial<CircuitBreakerConfig>,
  logger?: WhatsAppLogger
): WhatsAppCircuitBreaker => {
  if (!globalCircuitBreaker) {
    globalCircuitBreaker = createCircuitBreaker(config, logger)
  }
  return globalCircuitBreaker
}

export const resetGlobalCircuitBreaker = (): void => {
  globalCircuitBreaker = null
}