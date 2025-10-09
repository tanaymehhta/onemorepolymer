/**
 * WhatsApp Messaging Services - Main Export
 * Centralized exports for WhatsApp Business API integration
 */

// Core service
export { WhatsAppService, getGlobalWhatsAppService, createWhatsAppService } from './whatsapp.service'

// Configuration
export { whatsAppConfig, validateWhatsAppConfig, isWhatsAppEnabled } from './whatsapp.config'

// Message templates
export { generateMessage, generateAllMessages, messageTemplates } from './message-templates'

// Rate limiting
export { WhatsAppRateLimiter, getGlobalRateLimiter } from './rate-limiter'

// Circuit breaker
export { WhatsAppCircuitBreaker, getGlobalCircuitBreaker } from './circuit-breaker'

// Types
export type {
  WhatsAppConfig,
  DealData,
  RecipientRole,
  SendMessageResult,
  BulkSendResult,
  WhatsAppMessage,
  WhatsAppResponse,
  WhatsAppError,
  WhatsAppLogger,
  MessageTemplate,
  ValidationResult,
  TestMessageRequest,
  TestMessageResponse
} from './whatsapp.types'

// Error classes
export {
  WhatsAppServiceError,
  WhatsAppAuthError,
  WhatsAppRateLimitError,
  WhatsAppNetworkError,
  WhatsAppValidationError
} from './whatsapp.types'