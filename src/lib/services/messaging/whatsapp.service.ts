/**
 * WhatsApp Service - Core Meta Business API Integration
 * Handles direct communication with Meta's WhatsApp Business API
 */

import {
  WhatsAppConfig,
  WhatsAppMessage,
  WhatsAppResponse,
  WhatsAppError,
  WhatsAppErrorType,
  DealData,
  SendMessageResult,
  BulkSendResult,
  RecipientRole,
  WhatsAppLogger,
  WhatsAppServiceError,
  WhatsAppAuthError,
  WhatsAppRateLimitError,
  WhatsAppNetworkError,
  WhatsAppValidationError
} from './whatsapp.types'
import { getWhatsAppConfig } from './whatsapp.config'
import { generateMessage } from './message-templates'
import { WhatsAppRateLimiter } from './rate-limiter'
import { WhatsAppCircuitBreaker, CircuitBreakerOpenError } from './circuit-breaker'

export class WhatsAppService {
  private readonly config: WhatsAppConfig
  private readonly logger: WhatsAppLogger
  private readonly rateLimiter: WhatsAppRateLimiter
  private readonly circuitBreaker: WhatsAppCircuitBreaker

  constructor(
    config?: WhatsAppConfig,
    logger?: WhatsAppLogger,
    rateLimiter?: WhatsAppRateLimiter,
    circuitBreaker?: WhatsAppCircuitBreaker
  ) {
    this.config = config || getWhatsAppConfig()

    // Default logger if not provided
    this.logger = logger || {
      error: (msg, meta) => console.error(`[WhatsApp] ${msg}`, meta),
      warn: (msg, meta) => console.warn(`[WhatsApp] ${msg}`, meta),
      info: (msg, meta) => console.info(`[WhatsApp] ${msg}`, meta),
      debug: (msg, meta) => console.debug(`[WhatsApp] ${msg}`, meta)
    }

    this.rateLimiter = rateLimiter || new WhatsAppRateLimiter({}, this.logger)
    this.circuitBreaker = circuitBreaker || new WhatsAppCircuitBreaker({}, this.logger)
  }

  /**
   * Send a single WhatsApp message
   */
  async sendMessage(
    phoneNumber: string,
    message: string,
    dealId?: string,
    role?: RecipientRole
  ): Promise<SendMessageResult> {
    const startTime = Date.now()

    try {
      // Check if feature is enabled
      if (!this.config.features.messagingEnabled) {
        throw new WhatsAppValidationError('WhatsApp messaging is disabled', dealId, phoneNumber)
      }

      // Validate inputs
      this.validateInputs(phoneNumber, message)

      // Rate limiting protection
      const waitTime = await this.rateLimiter.waitIfNeeded()

      // Circuit breaker protection
      const response = await this.circuitBreaker.execute(async () => {
        return await this.makeApiCall(phoneNumber, message)
      })

      const responseTime = Date.now() - startTime

      this.logger.info('WhatsApp message sent successfully', {
        dealId,
        recipient: phoneNumber,
        role,
        messageId: response.messages[0]?.id,
        responseTime,
        waitTime
      })

      return {
        success: true,
        messageId: `whatsapp-${Date.now()}`, // Internal ID
        externalMessageId: response.messages[0]?.id,
        recipient: phoneNumber,
        role: role || 'accounts'
      }

    } catch (error) {
      const responseTime = Date.now() - startTime
      const whatsappError = this.handleError(error, dealId, phoneNumber)

      this.logger.error('WhatsApp message failed', {
        dealId,
        recipient: phoneNumber,
        role,
        error: whatsappError.message,
        errorType: whatsappError.type,
        responseTime
      })

      return {
        success: false,
        error: whatsappError,
        recipient: phoneNumber,
        role: role || 'accounts'
      }
    }
  }

  /**
   * Send messages to all recipients for a deal
   */
  async sendDealNotifications(deal: DealData): Promise<BulkSendResult> {
    const results: SendMessageResult[] = []
    const errors: WhatsAppError[] = []

    this.logger.info('Starting deal notifications', {
      dealId: deal.id,
      customer: deal.saleParty,
      recipients: Object.keys(this.config.recipients)
    })

    // Send to all recipients in parallel
    const sendPromises = Object.entries(this.config.recipients).map(
      async ([role, phoneNumber]) => {
        try {
          const message = generateMessage(role as RecipientRole, deal)
          const result = await this.sendMessage(
            phoneNumber,
            message,
            deal.id,
            role as RecipientRole
          )
          results.push(result)

          if (!result.success && result.error) {
            errors.push(result.error)
          }
        } catch (error) {
          const whatsappError = this.handleError(error, deal.id, phoneNumber)
          errors.push(whatsappError)
          results.push({
            success: false,
            error: whatsappError,
            recipient: phoneNumber,
            role: role as RecipientRole
          })
        }
      }
    )

    // Wait for all messages (use allSettled to ensure all complete)
    await Promise.allSettled(sendPromises)

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    this.logger.info('Deal notifications completed', {
      dealId: deal.id,
      total: results.length,
      success: successCount,
      failed: failureCount,
      successRate: Math.round((successCount / results.length) * 100)
    })

    return {
      dealId: deal.id,
      results,
      successCount,
      failureCount,
      errors
    }
  }

  /**
   * Test connectivity to WhatsApp API
   */
  async testConnection(): Promise<{ success: boolean; error?: string; responseTime: number }> {
    const startTime = Date.now()

    try {
      // Simple API call to verify connectivity
      const response = await fetch(`${this.config.apiUrl}/${this.config.phoneNumberId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        }
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return { success: true, responseTime }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      }
    }
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      rateLimiter: this.rateLimiter.getMetrics(),
      circuitBreaker: this.circuitBreaker.getMetrics(),
      config: {
        messagingEnabled: this.config.features.messagingEnabled,
        rateLimitEnabled: this.config.features.rateLimitEnabled,
        retryEnabled: this.config.features.retryEnabled
      }
    }
  }

  private async makeApiCall(phoneNumber: string, message: string): Promise<WhatsAppResponse> {
    // Simulate errors in development if enabled
    if (process.env.WHATSAPP_SIMULATE_ERRORS === 'true') {
      this.simulateRandomError()
    }

    const whatsappMessage: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message
      }
    }

    const response = await fetch(
      `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whatsappMessage)
      }
    )

    if (!response.ok) {
      await this.handleApiError(response)
    }

    return await response.json() as WhatsAppResponse
  }

  private async handleApiError(response: Response): Promise<never> {
    const statusCode = response.status
    const errorText = await response.text()

    switch (statusCode) {
      case 401:
        throw new WhatsAppAuthError('Invalid or expired access token')
      case 429:
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
        throw new WhatsAppRateLimitError(retryAfter)
      case 400:
        throw new WhatsAppValidationError(`Bad request: ${errorText}`)
      case 500:
      case 502:
      case 503:
      case 504:
        throw new WhatsAppNetworkError(`Server error: ${statusCode} ${errorText}`)
      default:
        throw new WhatsAppServiceError(`API error: ${statusCode} ${errorText}`, 'UNKNOWN_ERROR', undefined, statusCode)
    }
  }

  private handleError(error: unknown, dealId?: string, recipient?: string): WhatsAppError {
    if (error instanceof WhatsAppServiceError) {
      return error
    }

    if (error instanceof CircuitBreakerOpenError) {
      return new WhatsAppServiceError(
        'Service temporarily unavailable (circuit breaker open)',
        'NETWORK_ERROR',
        undefined,
        503,
        dealId,
        recipient
      )
    }

    if ((error as { code?: string }).code === 'ECONNREFUSED' || (error as { code?: string }).code === 'ETIMEDOUT') {
      return new WhatsAppNetworkError('Cannot reach WhatsApp API', dealId)
    }

    return new WhatsAppServiceError(
      (error as Error).message || 'Unknown WhatsApp error',
      'UNKNOWN_ERROR',
      undefined,
      undefined,
      dealId,
      recipient
    )
  }

  private validateInputs(phoneNumber: string, message: string): void {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new WhatsAppValidationError('Phone number is required')
    }

    if (!phoneNumber.startsWith('+')) {
      throw new WhatsAppValidationError('Phone number must start with country code (+)')
    }

    if (phoneNumber.length < 10 || phoneNumber.length > 16) {
      throw new WhatsAppValidationError('Invalid phone number length')
    }

    if (!message || typeof message !== 'string') {
      throw new WhatsAppValidationError('Message text is required')
    }

    if (message.length > 4096) {
      throw new WhatsAppValidationError('Message text too long (max 4096 characters)')
    }
  }

  private simulateRandomError(): void {
    const random = Math.random()

    if (random < 0.1) { // 10% chance
      const errorTypes = [
        () => { throw new WhatsAppRateLimitError(60) },
        () => { throw new WhatsAppNetworkError('Simulated network error') },
        () => { throw new WhatsAppAuthError('Simulated auth error') },
        () => { throw new WhatsAppValidationError('Simulated validation error') }
      ]

      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
      randomError()
    }
  }
}

/**
 * Singleton WhatsApp service instance
 */
let globalWhatsAppService: WhatsAppService | null = null

export const createWhatsAppService = (
  config?: WhatsAppConfig,
  logger?: WhatsAppLogger
): WhatsAppService => {
  return new WhatsAppService(config, logger)
}

export const getGlobalWhatsAppService = (
  config?: WhatsAppConfig,
  logger?: WhatsAppLogger
): WhatsAppService => {
  if (!globalWhatsAppService) {
    globalWhatsAppService = createWhatsAppService(config, logger)
  }
  return globalWhatsAppService
}

export const resetGlobalWhatsAppService = (): void => {
  globalWhatsAppService = null
}