/**
 * Deal Service
 * Handles deal creation with integrated WhatsApp notifications
 */

import { DealFormState } from '@/types/deal-form'
import { DealData } from '@/lib/services/messaging/whatsapp.types'
import { getGlobalWhatsAppService } from '@/lib/services/messaging/whatsapp.service'
import { isWhatsAppEnabled } from '@/lib/services/messaging/whatsapp.config'

export interface CreateDealRequest extends DealFormState {
  // Additional fields that might be needed
  id?: string
}

export interface CreateDealResult {
  success: boolean
  dealId: string
  deal: DealData
  whatsappResults?: {
    enabled: boolean
    success: boolean
    successCount: number
    failureCount: number
    errors: Array<{
      recipient: string
      role: string
      error: string
    }>
  }
  error?: string
}

export class DealService {
  /**
   * Create a new deal with integrated WhatsApp notifications
   */
  async createDeal(dealRequest: CreateDealRequest): Promise<CreateDealResult> {
    try {
      // Generate deal ID
      const dealId = `DEAL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

      // Convert form data to DealData format
      const dealData: DealData = this.convertFormDataToDealData(dealRequest, dealId)

      // TODO: Save deal to database
      // In a real implementation, you would save to Supabase here
      console.log('Saving deal to database:', dealData)

      // Send WhatsApp notifications if enabled
      let whatsappResults = undefined

      if (isWhatsAppEnabled()) {
        try {
          const whatsAppService = getGlobalWhatsAppService()
          const results = await whatsAppService.sendDealNotifications(dealData)

          whatsappResults = {
            enabled: true,
            success: results.successCount > 0,
            successCount: results.successCount,
            failureCount: results.failureCount,
            errors: results.errors.map(error => ({
              recipient: error.recipient || 'unknown',
              role: 'unknown', // Would need to extract from error
              error: error.message
            }))
          }

          console.log('WhatsApp notifications sent:', whatsappResults)
        } catch (whatsappError) {
          console.error('WhatsApp notification failed:', whatsappError)

          whatsappResults = {
            enabled: true,
            success: false,
            successCount: 0,
            failureCount: 4, // Assuming 4 recipients
            errors: [{
              recipient: 'all',
              role: 'all',
              error: whatsappError instanceof Error ? whatsappError.message : 'Unknown WhatsApp error'
            }]
          }
        }
      } else {
        whatsappResults = {
          enabled: false,
          success: false,
          successCount: 0,
          failureCount: 0,
          errors: []
        }
      }

      return {
        success: true,
        dealId,
        deal: dealData,
        whatsappResults
      }

    } catch (error) {
      console.error('Deal creation failed:', error)

      return {
        success: false,
        dealId: '',
        deal: {} as DealData,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Convert form data to WhatsApp DealData format
   */
  private convertFormDataToDealData(formData: CreateDealRequest, dealId: string): DealData {
    return {
      id: dealId,
      date: formData.date,
      saleParty: formData.saleParty,
      quantitySold: formData.quantitySold,
      saleRate: formData.saleRate,
      deliveryTerms: formData.deliveryTerms,
      saleComments: formData.saleComments || undefined,
      productCode: formData.productCode,
      product: formData.selectedProduct?.Product,
      grade: formData.selectedProduct?.grade,
      company: formData.selectedProduct?.company,
      specificGrade: formData.selectedProduct?.specific_grade,
      materialSource: formData.materialSource,
      purchaseParty: formData.materialSource === 'new-material' ? formData.purchaseParty : undefined,
      quantityPurchased: formData.materialSource === 'new-material' ? formData.quantityPurchased : undefined,
      purchaseRate: formData.materialSource === 'new-material' ? formData.purchaseRate : undefined,
      warehouseLocation: formData.warehouseLocation || undefined,
      purchaseComments: formData.purchaseComments || undefined,
      finalComments: formData.finalComments || undefined
    }
  }

  /**
   * Validate deal data before creation
   */
  validateDealData(dealData: CreateDealRequest): string[] {
    const errors: string[] = []

    // Required fields
    if (!dealData.saleParty) errors.push('Sale party is required')
    if (!dealData.quantitySold || dealData.quantitySold <= 0) errors.push('Valid quantity sold is required')
    if (!dealData.saleRate || dealData.saleRate <= 0) errors.push('Valid sale rate is required')
    if (!dealData.deliveryTerms) errors.push('Delivery terms are required')
    if (!dealData.productCode) errors.push('Product code is required')
    if (!dealData.materialSource) errors.push('Material source is required')

    // Conditional validation for new material
    if (dealData.materialSource === 'new-material') {
      if (!dealData.purchaseParty) errors.push('Purchase party is required for new material')
      if (!dealData.quantityPurchased || dealData.quantityPurchased <= 0) {
        errors.push('Valid purchase quantity is required for new material')
      }
      if (!dealData.purchaseRate || dealData.purchaseRate <= 0) {
        errors.push('Valid purchase rate is required for new material')
      }
    }

    return errors
  }

  /**
   * Calculate deal metrics
   */
  calculateDealMetrics(dealData: CreateDealRequest) {
    const saleAmount = dealData.quantitySold * dealData.saleRate
    const purchaseAmount = dealData.materialSource === 'new-material'
      ? (dealData.quantityPurchased || 0) * (dealData.purchaseRate || 0)
      : 0
    const grossProfit = saleAmount - purchaseAmount
    const profitMargin = saleAmount > 0 ? (grossProfit / saleAmount) * 100 : 0

    return {
      saleAmount,
      purchaseAmount,
      grossProfit,
      profitMargin: Math.round(profitMargin * 100) / 100
    }
  }
}

/**
 * Singleton deal service instance
 */
let globalDealService: DealService | null = null

export const getDealService = (): DealService => {
  if (!globalDealService) {
    globalDealService = new DealService()
  }
  return globalDealService
}

export const createDealService = (): DealService => {
  return new DealService()
}