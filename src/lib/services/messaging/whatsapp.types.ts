// WhatsApp integration type definitions

export interface WhatsAppConfig {
  apiToken: string
  apiUrl: string
  phoneNumberId: string
  recipients: {
    accounts: string
    logistics: string
    boss1: string
    bossog: string
  }
  features: {
    messagingEnabled: boolean
    rateLimitEnabled: boolean
    retryEnabled: boolean
  }
  settings: {
    maxRetries: number
    retryDelays: number[]
    circuitBreakerThreshold: number
  }
}

export interface WhatsAppMessage {
  messaging_product: 'whatsapp'
  to: string
  type: 'text'
  text: {
    body: string
  }
}

export interface WhatsAppResponse {
  messaging_product: 'whatsapp'
  contacts: Array<{
    input: string
    wa_id: string
  }>
  messages: Array<{
    id: string
    message_status?: 'accepted' | 'delivered' | 'read' | 'failed'
  }>
}

export interface WhatsAppError extends Error {
  type: WhatsAppErrorType
  retryAfter?: number
  httpStatus?: number
  dealId?: string
  recipient?: string
}

export type WhatsAppErrorType =
  | 'AUTH_ERROR'
  | 'RATE_LIMIT'
  | 'INVALID_RECIPIENT'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'UNKNOWN_ERROR'

export type RecipientRole = 'accounts' | 'logistics' | 'boss1' | 'bossog'

export interface MessageTemplate {
  role: RecipientRole
  generateMessage: (deal: DealData) => string
}

export interface DealData {
  id: string
  date: Date
  saleParty: string
  quantitySold: number
  saleRate: number
  deliveryTerms: 'delivered' | 'ex-warehouse'
  saleComments?: string
  productCode: string
  product?: string
  grade?: string
  company?: string
  specificGrade?: string
  materialSource: 'new-material' | 'from-inventory'
  purchaseParty?: string
  quantityPurchased?: number
  purchaseRate?: number
  warehouseLocation?: string
  purchaseComments?: string
  finalComments?: string
}

export interface MessageOutbox {
  id: string
  dealId: string
  platform: 'whatsapp'
  recipientPhone: string
  recipientRole: RecipientRole
  messageText: string
  status: MessageStatus
  attempts: number
  maxAttempts: number
  errorType?: WhatsAppErrorType
  errorMessage?: string
  errorDetails?: Record<string, unknown>
  createdAt: Date
  sentAt?: Date
  deliveredAt?: Date
  nextRetryAt?: Date
  externalMessageId?: string
  apiResponse?: Record<string, unknown>
}

export type MessageStatus =
  | 'pending'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'dead_letter'

export interface SendMessageResult {
  success: boolean
  messageId?: string
  externalMessageId?: string
  error?: WhatsAppError
  recipient: string
  role: RecipientRole
}

export interface BulkSendResult {
  dealId: string
  results: SendMessageResult[]
  successCount: number
  failureCount: number
  errors: WhatsAppError[]
}

export interface WhatsAppHealthStatus {
  service: 'whatsapp'
  status: 'healthy' | 'degraded' | 'down'
  lastSuccessfulMessage?: Date
  metrics: {
    messagesLast24h: number
    failuresLast24h: number
    successRate: number
    avgResponseTime: number
  }
  rateLimitStatus: {
    current: 'ok' | 'warning' | 'limited'
    remaining?: number
    resetTime?: Date
  }
  errorBreakdown: Partial<Record<WhatsAppErrorType, number>>
  retryQueue: {
    pending: number
    nextRetry?: Date
  }
}

export interface RetryConfiguration {
  maxAttempts: number
  delays: number[]
  backoffMultiplier: number
  jitter: boolean
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failures: number
  lastFailureTime: number
  threshold: number
  timeout: number
}

export interface RateLimitInfo {
  requests: Date[]
  maxRequestsPerMinute: number
  currentCount: number
  resetTime: Date
}

export interface ValidationResult {
  tokenValid: boolean
  phoneNumberIdValid: boolean
  recipients: Record<RecipientRole, {
    valid: boolean
    formatted?: string
    error?: string
  }>
  suggestions: string[]
}

export interface TestMessageRequest {
  recipient: string
  message: string
  dealId?: string
}

export interface TestMessageResponse {
  success: boolean
  messageId?: string
  externalMessageId?: string
  status: string
  timestamp: Date
  error?: string
}

// Error classes
export class WhatsAppServiceError extends Error {
  constructor(
    message: string,
    public type: WhatsAppErrorType,
    public retryAfter?: number,
    public httpStatus?: number,
    public dealId?: string,
    public recipient?: string
  ) {
    super(message)
    this.name = 'WhatsAppServiceError'
  }
}

export class WhatsAppAuthError extends WhatsAppServiceError {
  constructor(message: string = 'Authentication failed', dealId?: string) {
    super(message, 'AUTH_ERROR', undefined, 401, dealId)
    this.name = 'WhatsAppAuthError'
  }
}

export class WhatsAppRateLimitError extends WhatsAppServiceError {
  constructor(retryAfter: number = 60, dealId?: string, recipient?: string) {
    super(`Rate limit exceeded, retry after ${retryAfter}s`, 'RATE_LIMIT', retryAfter, 429, dealId, recipient)
    this.name = 'WhatsAppRateLimitError'
  }
}

export class WhatsAppNetworkError extends WhatsAppServiceError {
  constructor(message: string = 'Network error', dealId?: string) {
    super(message, 'NETWORK_ERROR', undefined, undefined, dealId)
    this.name = 'WhatsAppNetworkError'
  }
}

export class WhatsAppValidationError extends WhatsAppServiceError {
  constructor(message: string, dealId?: string, recipient?: string) {
    super(message, 'VALIDATION_ERROR', undefined, 400, dealId, recipient)
    this.name = 'WhatsAppValidationError'
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface WhatsAppLogger {
  error: (message: string, meta?: Record<string, unknown>) => void
  warn: (message: string, meta?: Record<string, unknown>) => void
  info: (message: string, meta?: Record<string, unknown>) => void
  debug: (message: string, meta?: Record<string, unknown>) => void
}