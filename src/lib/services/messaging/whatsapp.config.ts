import { WhatsAppConfig, ValidationResult, WhatsAppValidationError } from './whatsapp.types'

class WhatsAppConfigManager {
  private config: WhatsAppConfig | null = null

  /**
   * Get validated WhatsApp configuration
   * Throws error if configuration is invalid
   */
  getConfig(): WhatsAppConfig {
    if (!this.config) {
      this.config = this.loadAndValidateConfig()
    }
    return this.config
  }

  /**
   * Validate configuration without throwing
   * Returns validation results for debugging
   */
  validateConfig(): ValidationResult {
    try {
      const config = this.loadConfigFromEnv()
      return {
        tokenValid: this.validateToken(config.apiToken),
        phoneNumberIdValid: this.validatePhoneNumberId(config.phoneNumberId),
        recipients: this.validateRecipients(config.recipients),
        suggestions: this.generateSuggestions(config)
      }
    } catch (error) {
      return {
        tokenValid: false,
        phoneNumberIdValid: false,
        recipients: {
          accounts: { valid: false, error: 'Configuration error' },
          logistics: { valid: false, error: 'Configuration error' },
          boss1: { valid: false, error: 'Configuration error' },
          bossog: { valid: false, error: 'Configuration error' }
        },
        suggestions: [error instanceof Error ? error.message : 'Unknown configuration error']
      }
    }
  }

  /**
   * Reload configuration from environment
   * Useful for configuration updates without restart
   */
  reloadConfig(): WhatsAppConfig {
    this.config = null
    return this.getConfig()
  }

  /**
   * Check if WhatsApp messaging is enabled
   */
  isEnabled(): boolean {
    return process.env.FEATURE_WHATSAPP_MESSAGING === 'true'
  }

  private loadAndValidateConfig(): WhatsAppConfig {
    const config = this.loadConfigFromEnv()
    this.validateConfigOrThrow(config)
    return config
  }

  private loadConfigFromEnv(): WhatsAppConfig {
    return {
      apiToken: process.env.WHATSAPP_API_TOKEN || '',
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      recipients: {
        accounts: process.env.WHATSAPP_PHONE_ACCOUNTS || '',
        logistics: process.env.WHATSAPP_PHONE_LOGISTICS || '',
        boss1: process.env.WHATSAPP_PHONE_BOSS1 || '',
        bossog: process.env.WHATSAPP_PHONE_BOSSOG || ''
      },
      features: {
        messagingEnabled: process.env.FEATURE_WHATSAPP_MESSAGING === 'true',
        rateLimitEnabled: process.env.WHATSAPP_RATE_LIMIT_ENABLED !== 'false',
        retryEnabled: process.env.WHATSAPP_RETRY_ENABLED !== 'false'
      },
      settings: {
        maxRetries: parseInt(process.env.WHATSAPP_MAX_RETRIES || '3'),
        retryDelays: this.parseRetryDelays(process.env.WHATSAPP_RETRY_DELAYS),
        circuitBreakerThreshold: parseInt(process.env.WHATSAPP_CIRCUIT_BREAKER_THRESHOLD || '10')
      }
    }
  }

  private validateConfigOrThrow(config: WhatsAppConfig): void {
    const errors: string[] = []

    // Check if messaging is enabled
    if (!config.features.messagingEnabled) {
      throw new WhatsAppValidationError('WhatsApp messaging is disabled (FEATURE_WHATSAPP_MESSAGING=false)')
    }

    // Validate API token
    if (!config.apiToken) {
      errors.push('WHATSAPP_API_TOKEN is required')
    } else if (!this.validateToken(config.apiToken)) {
      errors.push('WHATSAPP_API_TOKEN format is invalid (should start with EAA)')
    }

    // Validate phone number ID
    if (!config.phoneNumberId) {
      errors.push('WHATSAPP_PHONE_NUMBER_ID is required')
    } else if (!this.validatePhoneNumberId(config.phoneNumberId)) {
      errors.push('WHATSAPP_PHONE_NUMBER_ID format is invalid (should be numeric)')
    }

    // Validate API URL
    if (!this.isValidUrl(config.apiUrl)) {
      errors.push('WHATSAPP_API_URL is invalid')
    }

    // Validate recipients (allow empty values for disabled roles)
    const recipientValidation = this.validateRecipients(config.recipients)
    Object.entries(recipientValidation).forEach(([role, result]) => {
      if (!result.valid && config.recipients[role as keyof typeof config.recipients] !== '') {
        errors.push(`WHATSAPP_PHONE_${role.toUpperCase()}: ${result.error}`)
      }
    })

    // Validate settings
    if (config.settings.maxRetries < 0 || config.settings.maxRetries > 10) {
      errors.push('WHATSAPP_MAX_RETRIES must be between 0 and 10')
    }

    if (config.settings.circuitBreakerThreshold < 1) {
      errors.push('WHATSAPP_CIRCUIT_BREAKER_THRESHOLD must be at least 1')
    }

    if (errors.length > 0) {
      throw new WhatsAppValidationError(`Configuration errors: ${errors.join(', ')}`)
    }
  }

  private validateToken(token: string): boolean {
    // Meta Business API tokens start with 'EAA' or 'EAC'
    return token.length > 10 && (token.startsWith('EAA') || token.startsWith('EAC'))
  }

  private validatePhoneNumberId(phoneNumberId: string): boolean {
    // Phone number IDs are numeric strings
    return /^\d{10,20}$/.test(phoneNumberId)
  }

  private validateRecipients(recipients: WhatsAppConfig['recipients']) {
    const results: ValidationResult['recipients'] = {} as ValidationResult['recipients']

    Object.entries(recipients).forEach(([role, phoneNumber]) => {
      const validation = this.validatePhoneNumber(phoneNumber)
      results[role as keyof typeof recipients] = validation
    })

    return results
  }

  private validatePhoneNumber(phoneNumber: string): { valid: boolean; formatted?: string; error?: string } {
    if (!phoneNumber) {
      return { valid: false, error: 'Phone number is required' }
    }

    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')

    // Check basic format
    if (!cleaned.startsWith('+')) {
      return { valid: false, error: 'Phone number must start with country code (+)' }
    }

    // Check length (minimum 10 digits after +, maximum 15)
    const digits = cleaned.slice(1)
    if (digits.length < 10 || digits.length > 15) {
      return { valid: false, error: 'Phone number must be 10-15 digits after country code' }
    }

    // Check if all characters after + are digits
    if (!/^\d+$/.test(digits)) {
      return { valid: false, error: 'Phone number can only contain digits after +' }
    }

    return { valid: true, formatted: cleaned }
  }

  private parseRetryDelays(delaysString?: string): number[] {
    if (!delaysString) {
      return [1000, 5000, 15000] // Default: 1s, 5s, 15s
    }

    try {
      const delays = delaysString.split(',').map(d => parseInt(d.trim()))

      // Validate delays
      if (delays.some(d => isNaN(d) || d < 0)) {
        console.warn('Invalid retry delays, using defaults')
        return [1000, 5000, 15000]
      }

      return delays
    } catch {
      console.warn('Failed to parse retry delays, using defaults')
      return [1000, 5000, 15000]
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  private generateSuggestions(config: WhatsAppConfig): string[] {
    const suggestions: string[] = []

    // Token suggestions
    if (!config.apiToken) {
      suggestions.push('Get your API token from Meta Business Manager > WhatsApp > Configuration')
    } else if (!this.validateToken(config.apiToken)) {
      suggestions.push('Verify your API token is a valid Meta Business API token (starts with EAA)')
    }

    // Phone number ID suggestions
    if (!config.phoneNumberId) {
      suggestions.push('Get your phone number ID from Meta Business Manager > WhatsApp > Phone Numbers')
    }

    // Recipient suggestions (only for non-empty invalid numbers)
    const recipientValidation = this.validateRecipients(config.recipients)
    Object.entries(recipientValidation).forEach(([role, result]) => {
      if (!result.valid && config.recipients[role as keyof typeof config.recipients] !== '') {
        suggestions.push(`Fix WHATSAPP_PHONE_${role.toUpperCase()} format: ${result.error}`)
      }
    })

    // Feature suggestions
    if (!config.features.messagingEnabled) {
      suggestions.push('Set FEATURE_WHATSAPP_MESSAGING=true to enable WhatsApp notifications')
    }

    return suggestions
  }
}

// Export singleton instance
export const whatsAppConfig = new WhatsAppConfigManager()

// Export helper functions
export const getWhatsAppConfig = () => whatsAppConfig.getConfig()
export const validateWhatsAppConfig = () => whatsAppConfig.validateConfig()
export const isWhatsAppEnabled = () => whatsAppConfig.isEnabled()
export const reloadWhatsAppConfig = () => whatsAppConfig.reloadConfig()

// Export for testing
export { WhatsAppConfigManager }