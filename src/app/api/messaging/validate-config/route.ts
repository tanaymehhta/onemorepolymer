/**
 * WhatsApp Configuration Validation Endpoint
 * Validates environment configuration and API connectivity
 */

import { NextResponse } from 'next/server'
import { validateWhatsAppConfig } from '@/lib/services/messaging/whatsapp.config'
import { getGlobalWhatsAppService } from '@/lib/services/messaging/whatsapp.service'

export async function GET() {
  try {
    // Validate configuration
    const configValidation = validateWhatsAppConfig()

    // Test API connectivity if config is valid
    let connectivityTest = null
    if (configValidation.tokenValid && configValidation.phoneNumberIdValid) {
      try {
        const whatsAppService = getGlobalWhatsAppService()
        connectivityTest = await whatsAppService.testConnection()
      } catch (connectivityError) {
        connectivityTest = {
          success: false,
          error: connectivityError instanceof Error ? connectivityError.message : 'Unknown connectivity error',
          responseTime: 0
        }
      }
    }

    // Get service metrics
    let serviceMetrics = null
    try {
      const whatsAppService = getGlobalWhatsAppService()
      serviceMetrics = whatsAppService.getMetrics()
    } catch (error) {
      // Service metrics not available if config is invalid
    }

    // Determine overall health
    const isHealthy = configValidation.tokenValid &&
                     configValidation.phoneNumberIdValid &&
                     Object.values(configValidation.recipients).every(r => r.valid) &&
                     connectivityTest?.success === true

    const response = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      configuration: {
        tokenValid: configValidation.tokenValid,
        phoneNumberIdValid: configValidation.phoneNumberIdValid,
        recipients: configValidation.recipients,
        suggestions: configValidation.suggestions
      },
      connectivity: connectivityTest,
      metrics: serviceMetrics,
      features: {
        messagingEnabled: process.env.FEATURE_WHATSAPP_MESSAGING === 'true',
        rateLimitEnabled: process.env.WHATSAPP_RATE_LIMIT_ENABLED !== 'false',
        retryEnabled: process.env.WHATSAPP_RETRY_ENABLED !== 'false'
      },
      environment: {
        hasApiToken: !!process.env.WHATSAPP_API_TOKEN,
        hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
        hasRecipients: {
          accounts: !!process.env.WHATSAPP_PHONE_ACCOUNTS,
          logistics: !!process.env.WHATSAPP_PHONE_LOGISTICS,
          boss1: !!process.env.WHATSAPP_PHONE_BOSS1,
          bossog: !!process.env.WHATSAPP_PHONE_BOSSOG
        },
        simulateErrors: process.env.WHATSAPP_SIMULATE_ERRORS === 'true'
      }
    }

    const statusCode = isHealthy ? 200 : 422

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('Configuration validation error:', error)

    return NextResponse.json(
      {
        healthy: false,
        error: error instanceof Error ? error.message : 'Configuration validation failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}