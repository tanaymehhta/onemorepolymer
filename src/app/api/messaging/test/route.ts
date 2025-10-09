/**
 * WhatsApp Test Message Endpoint
 * For development testing and validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { getGlobalWhatsAppService } from '@/lib/services/messaging/whatsapp.service'
import { isWhatsAppEnabled } from '@/lib/services/messaging/whatsapp.config'

export async function POST(request: NextRequest) {
  try {
    // Check if WhatsApp is enabled
    if (!isWhatsAppEnabled()) {
      return NextResponse.json(
        { error: 'WhatsApp messaging is disabled' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { recipient, message, dealId } = body

    // Validate input
    if (!recipient || !message) {
      return NextResponse.json(
        { error: 'Recipient and message are required' },
        { status: 400 }
      )
    }

    // Get WhatsApp service
    const whatsAppService = getGlobalWhatsAppService()

    // Send test message
    const result = await whatsAppService.sendMessage(
      recipient,
      message,
      dealId || 'test',
      'accounts'
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        externalMessageId: result.externalMessageId,
        recipient: result.recipient,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || 'Unknown error',
          errorType: result.error?.type,
          recipient: result.recipient
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('WhatsApp test endpoint error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/messaging/test',
    method: 'POST',
    description: 'Send test WhatsApp message',
    parameters: {
      recipient: 'Phone number with country code (e.g., +1234567890)',
      message: 'Text message to send',
      dealId: 'Optional deal ID for tracking'
    },
    example: {
      recipient: '+1234567890',
      message: 'Test message from development',
      dealId: 'test-deal-123'
    }
  })
}