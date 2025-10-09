/**
 * WhatsApp Message Preview Endpoint
 * Generate message previews for different recipient roles
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateMessage, validateDealForMessaging } from '@/lib/services/messaging/message-templates'
import { DealData, RecipientRole } from '@/lib/services/messaging/whatsapp.types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealData, role } = body

    // Validate required fields
    if (!dealData) {
      return NextResponse.json(
        { error: 'Deal data is required' },
        { status: 400 }
      )
    }

    // Create sample deal if minimal data provided
    const sampleDeal: DealData = {
      id: dealData.id || 'PREVIEW-001',
      date: dealData.date ? new Date(dealData.date) : new Date(),
      saleParty: dealData.saleParty || 'Sample Customer Ltd',
      quantitySold: dealData.quantitySold || 1000,
      saleRate: dealData.saleRate || 85,
      deliveryTerms: dealData.deliveryTerms || 'delivered',
      productCode: dealData.productCode || 'PP-001',
      product: dealData.product || 'Polypropylene',
      grade: dealData.grade || 'H110MA',
      company: dealData.company || 'Sample Industries',
      materialSource: dealData.materialSource || 'new-material',
      purchaseParty: dealData.purchaseParty || 'Sample Supplier',
      quantityPurchased: dealData.quantityPurchased || 1000,
      purchaseRate: dealData.purchaseRate || 80,
      warehouseLocation: dealData.warehouseLocation,
      saleComments: dealData.saleComments,
      purchaseComments: dealData.purchaseComments,
      finalComments: dealData.finalComments,
      specificGrade: dealData.specificGrade
    }

    // If specific role requested, generate for that role only
    if (role && typeof role === 'string') {
      const validRoles: RecipientRole[] = ['accounts', 'logistics', 'boss1', 'bossog']

      if (!validRoles.includes(role as RecipientRole)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
          { status: 400 }
        )
      }

      try {
        const message = generateMessage(role as RecipientRole, sampleDeal)

        return NextResponse.json({
          role,
          message,
          messageLength: message.length,
          dealData: sampleDeal,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: `Failed to generate message for role ${role}: ${error instanceof Error ? error.message : 'Unknown error'}`
          },
          { status: 500 }
        )
      }
    }

    // Generate messages for all roles
    const roles: RecipientRole[] = ['accounts', 'logistics', 'boss1', 'bossog']
    const messages: Record<string, { message: string; messageLength: number; preview: string }> = {}
    const errors: string[] = []

    for (const currentRole of roles) {
      try {
        const message = generateMessage(currentRole, sampleDeal)
        messages[currentRole] = {
          message,
          messageLength: message.length,
          preview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
        }
      } catch (error) {
        errors.push(`${currentRole}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Validate deal data
    const validationErrors = validateDealForMessaging(sampleDeal)

    return NextResponse.json({
      dealData: sampleDeal,
      messages,
      validation: {
        valid: validationErrors.length === 0,
        errors: validationErrors
      },
      errors,
      statistics: {
        totalRoles: roles.length,
        successfulMessages: Object.keys(messages).length,
        failedMessages: errors.length,
        averageMessageLength: Object.values(messages).reduce((sum: number, msg: { messageLength: number }) => sum + msg.messageLength, 0) / Object.keys(messages).length || 0
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Message preview error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate message preview',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/messaging/preview',
    method: 'POST',
    description: 'Generate WhatsApp message previews for different recipient roles',
    parameters: {
      dealData: 'Deal object with required fields',
      role: 'Optional specific role (accounts, logistics, boss1, bossog)'
    },
    sampleRequest: {
      dealData: {
        id: 'DEAL-001',
        saleParty: 'Customer Company Ltd',
        quantitySold: 1000,
        saleRate: 85,
        deliveryTerms: 'delivered',
        productCode: 'PP-001',
        materialSource: 'new-material',
        purchaseParty: 'Supplier Industries',
        quantityPurchased: 1000,
        purchaseRate: 80
      },
      role: 'accounts' // Optional
    },
    availableRoles: ['accounts', 'logistics', 'boss1', 'bossog']
  })
}