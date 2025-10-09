/**
 * WhatsApp Service Status Endpoint
 * Real-time health monitoring and metrics
 */

import { NextResponse } from 'next/server'
import { getGlobalWhatsAppService } from '@/lib/services/messaging/whatsapp.service'
import { isWhatsAppEnabled } from '@/lib/services/messaging/whatsapp.config'

export async function GET() {
  try {
    const timestamp = new Date()

    // Check if service is enabled
    if (!isWhatsAppEnabled()) {
      return NextResponse.json({
        service: 'whatsapp',
        status: 'disabled',
        timestamp: timestamp.toISOString(),
        message: 'WhatsApp messaging is disabled (FEATURE_WHATSAPP_MESSAGING=false)'
      })
    }

    // Get service instance and metrics
    const whatsAppService = getGlobalWhatsAppService()
    const metrics = whatsAppService.getMetrics()

    // Test connectivity
    const connectivityTest = await whatsAppService.testConnection()

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'down' = 'healthy'
    const issues: string[] = []

    if (!connectivityTest.success) {
      status = 'down'
      issues.push('API connectivity failed')
    }

    if (metrics.rateLimiter.utilization > 90) {
      status = status === 'healthy' ? 'degraded' : status
      issues.push('High rate limit utilization')
    }

    if (metrics.circuitBreaker.state !== 'CLOSED') {
      status = 'degraded'
      issues.push(`Circuit breaker is ${metrics.circuitBreaker.state}`)
    }

    const response = {
      service: 'whatsapp' as const,
      status,
      timestamp: timestamp.toISOString(),
      lastSuccessfulMessage: null, // TODO: Get from database
      issues,
      connectivity: {
        success: connectivityTest.success,
        responseTime: connectivityTest.responseTime,
        error: connectivityTest.error
      },
      rateLimiting: {
        status: metrics.rateLimiter.utilization > 90 ? 'limited' :
                metrics.rateLimiter.utilization > 70 ? 'warning' : 'ok',
        utilization: metrics.rateLimiter.utilization,
        requestsInWindow: metrics.rateLimiter.requestsInWindow,
        maxRequests: metrics.rateLimiter.maxRequests
      },
      circuitBreaker: {
        state: metrics.circuitBreaker.state,
        failures: metrics.circuitBreaker.failures,
        threshold: 10 // Default threshold
      },
      features: {
        messagingEnabled: metrics.config.messagingEnabled,
        rateLimitEnabled: metrics.config.rateLimitEnabled,
        retryEnabled: metrics.config.retryEnabled
      },
      uptime: {
        // Service start time would be tracked in a real implementation
        startedAt: null,
        uptimeSeconds: null
      }
    }

    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503

    return NextResponse.json(response, { status: statusCode })

  } catch (error) {
    console.error('WhatsApp status check failed:', error)

    return NextResponse.json(
      {
        service: 'whatsapp',
        status: 'down',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        issues: ['Service status check failed']
      },
      { status: 503 }
    )
  }
}