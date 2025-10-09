/**
 * Deal Registration API Route
 * Handles deal creation with integrated WhatsApp notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDealService, CreateDealRequest } from '@/lib/services/deal.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Parse deal data
    const dealData: CreateDealRequest = {
      date: body.date ? new Date(body.date) : new Date(),
      saleParty: body.saleParty,
      quantitySold: parseFloat(body.quantitySold) || 0,
      saleRate: parseFloat(body.saleRate) || 0,
      deliveryTerms: body.deliveryTerms,
      saleComments: body.saleComments || '',
      productCode: body.productCode,
      selectedProduct: body.selectedProduct,
      materialSource: body.materialSource,
      purchaseParty: body.purchaseParty || '',
      quantityPurchased: parseFloat(body.quantityPurchased) || 0,
      purchaseRate: parseFloat(body.purchaseRate) || 0,
      warehouseLocation: body.warehouseLocation || '',
      purchaseComments: body.purchaseComments || '',
      finalComments: body.finalComments || ''
    }

    // Get deal service
    const dealService = getDealService()

    // Validate deal data
    const validationErrors = dealService.validateDealData(dealData)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          validationErrors
        },
        { status: 400 }
      )
    }

    // Create deal
    const result = await dealService.createDeal(dealData)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to create deal'
        },
        { status: 500 }
      )
    }

    // Calculate metrics for response
    const metrics = dealService.calculateDealMetrics(dealData)

    return NextResponse.json({
      success: true,
      data: {
        dealId: result.dealId,
        deal: result.deal,
        metrics,
        whatsapp: result.whatsappResults
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Deal creation API error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/deals',
    method: 'POST',
    description: 'Create a new deal with integrated WhatsApp notifications',
    requiredFields: [
      'saleParty',
      'quantitySold',
      'saleRate',
      'deliveryTerms',
      'productCode',
      'materialSource'
    ],
    conditionalFields: {
      'materialSource === "new-material"': [
        'purchaseParty',
        'quantityPurchased',
        'purchaseRate'
      ]
    },
    optionalFields: [
      'date',
      'saleComments',
      'warehouseLocation',
      'purchaseComments',
      'finalComments'
    ],
    example: {
      saleParty: 'Customer Company Ltd',
      quantitySold: 1000,
      saleRate: 85,
      deliveryTerms: 'delivered',
      productCode: 'PP-001',
      materialSource: 'new-material',
      purchaseParty: 'Supplier Industries',
      quantityPurchased: 1000,
      purchaseRate: 80,
      saleComments: 'Urgent delivery required',
      finalComments: 'First time customer'
    }
  })
}