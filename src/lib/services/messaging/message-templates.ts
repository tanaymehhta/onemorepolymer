import { DealData, MessageTemplate, RecipientRole } from './whatsapp.types'

/**
 * WhatsApp Message Templates for Different Roles
 * Each role receives customized messages with relevant information
 */

/**
 * Format currency amount for display
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format number with Indian number system
 */
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Format date for display
 */
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

/**
 * Calculate deal metrics
 */
const calculateDealMetrics = (deal: DealData) => {
  const saleAmount = deal.quantitySold * deal.saleRate
  const purchaseAmount = (deal.quantityPurchased || 0) * (deal.purchaseRate || 0)
  const grossProfit = saleAmount - purchaseAmount
  const profitMargin = saleAmount > 0 ? (grossProfit / saleAmount) * 100 : 0

  return {
    saleAmount,
    purchaseAmount,
    grossProfit,
    profitMargin: Math.round(profitMargin * 100) / 100 // Round to 2 decimal places
  }
}

/**
 * Get product display string
 */
const getProductDisplay = (deal: DealData): string => {
  if (deal.product && deal.grade && deal.company) {
    return `${deal.product} - ${deal.grade} (${deal.company})`
  }
  return deal.productCode || 'Product details pending'
}

/**
 * ACCOUNTS TEAM MESSAGE
 * Focus: Financial details, payment terms, cost breakdown
 */
const accountsTemplate: MessageTemplate = {
  role: 'accounts',
  generateMessage: (deal: DealData): string => {
    const metrics = calculateDealMetrics(deal)
    const product = getProductDisplay(deal)

    let message = `🏦 NEW DEAL REGISTERED

Deal ID: ${deal.id}
Date: ${formatDate(deal.date)}
Customer: ${deal.saleParty}

💰 FINANCIAL DETAILS:
Sale: ${formatNumber(deal.quantitySold)}kg × ${formatCurrency(deal.saleRate)}/kg = ${formatCurrency(metrics.saleAmount)}`

    // Add purchase details if available
    if (deal.materialSource === 'new-material' && deal.purchaseParty && deal.quantityPurchased && deal.purchaseRate) {
      message += `
Purchase: ${formatNumber(deal.quantityPurchased)}kg × ${formatCurrency(deal.purchaseRate)}/kg = ${formatCurrency(metrics.purchaseAmount)}
Gross Profit: ${formatCurrency(metrics.grossProfit)} (${metrics.profitMargin}%)`
    }

    message += `

📦 PRODUCT DETAILS:
${product}
Delivery: ${deal.deliveryTerms === 'delivered' ? 'Delivered' : 'Ex-Warehouse (Pickup)'}
Source: ${deal.materialSource === 'new-material' ? 'New Purchase' : 'From Inventory'}`

    // Add supplier info if applicable
    if (deal.purchaseParty) {
      message += `
Supplier: ${deal.purchaseParty}`
    }

    // Add comments if available
    if (deal.saleComments) {
      message += `

💬 SALE NOTES:
${deal.saleComments}`
    }

    if (deal.purchaseComments) {
      message += `

💬 PURCHASE NOTES:
${deal.purchaseComments}`
    }

    message += `

📋 ACTION REQUIRED:
- Verify payment terms with customer
- Coordinate with logistics for delivery
- Update accounting records

---
Polymer Trading System`

    return message
  }
}

/**
 * LOGISTICS TEAM MESSAGE
 * Focus: Delivery coordination, supplier details, warehouse operations
 */
const logisticsTemplate: MessageTemplate = {
  role: 'logistics',
  generateMessage: (deal: DealData): string => {
    const product = getProductDisplay(deal)

    let message = `🚚 DELIVERY COORDINATION REQUIRED

Deal ID: ${deal.id}
Customer: ${deal.saleParty}
Date: ${formatDate(deal.date)}

📦 LOGISTICS DETAILS:
Quantity: ${formatNumber(deal.quantitySold)}kg
Product: ${product}
Delivery: ${deal.deliveryTerms === 'delivered' ? 'DELIVERY REQUIRED' : 'CUSTOMER PICKUP'}
Source: ${deal.materialSource === 'new-material' ? 'New Purchase' : 'Warehouse Stock'}`

    if (deal.warehouseLocation) {
      message += `
Warehouse: ${deal.warehouseLocation}`
    }

    // Coordination requirements based on material source
    if (deal.materialSource === 'new-material' && deal.purchaseParty) {
      message += `

🔄 COORDINATION NEEDED:
Supplier: ${deal.purchaseParty}
Purchase Qty: ${formatNumber(deal.quantityPurchased || 0)}kg

TASKS:
- Coordinate supplier pickup/delivery
- Schedule customer delivery
- Ensure quantity matching
- Quality check on receipt`
    } else {
      message += `

📋 INVENTORY DISPATCH:
- Verify stock availability
- Prepare material for dispatch
- ${deal.deliveryTerms === 'delivered' ? 'Schedule delivery to customer' : 'Notify customer for pickup'}`
    }

    // Add special notes
    if (deal.finalComments) {
      message += `

⚠️ SPECIAL INSTRUCTIONS:
${deal.finalComments}`
    }

    message += `

📞 CONTACTS:
- Customer coordination required
- Update accounts team on delivery status

---
Polymer Trading System`

    return message
  }
}

/**
 * BOSS 1 MESSAGE
 * Focus: Executive summary, profit analysis, key metrics
 */
const boss1Template: MessageTemplate = {
  role: 'boss1',
  generateMessage: (deal: DealData): string => {
    const metrics = calculateDealMetrics(deal)
    const product = getProductDisplay(deal)

    let message = `📊 DEAL SUMMARY - BOSS 1

Deal ID: ${deal.id}
Customer: ${deal.saleParty}
Product: ${product}

💵 PROFIT ANALYSIS:
Revenue: ${formatCurrency(metrics.saleAmount)}
${deal.materialSource === 'new-material' && metrics.purchaseAmount > 0
  ? `Cost: ${formatCurrency(metrics.purchaseAmount)}
Profit: ${formatCurrency(metrics.grossProfit)} (${metrics.profitMargin}%)`
  : 'Cost: From inventory (TBD)'}

📈 DEAL METRICS:
Volume: ${formatNumber(deal.quantitySold)}kg
Rate: ${formatCurrency(deal.saleRate)}/kg
Source: ${deal.materialSource === 'new-material' ? 'New Purchase' : 'Inventory'}`

    if (deal.purchaseParty) {
      message += `
Supplier: ${deal.purchaseParty}`
    }

    message += `

🎯 STATUS:
Date: ${formatDate(deal.date)}
Delivery: ${deal.deliveryTerms === 'delivered' ? 'Delivery' : 'Pickup'}
Processing: In progress

📞 TEAMS NOTIFIED:
- Accounts team (financial processing)
- Logistics team (coordination)

---
Polymer Trading System`

    return message
  }
}

/**
 * BOSS OG MESSAGE
 * Focus: High-level overview, strategic insights
 */
const bossOGTemplate: MessageTemplate = {
  role: 'bossog',
  generateMessage: (deal: DealData): string => {
    const metrics = calculateDealMetrics(deal)
    const product = getProductDisplay(deal)

    let message = `👑 DEAL ALERT - BOSS OG

Deal ID: ${deal.id}
Customer: ${deal.saleParty}

💰 QUICK OVERVIEW:
Volume: ${formatNumber(deal.quantitySold)}kg
Revenue: ${formatCurrency(metrics.saleAmount)}`

    if (deal.materialSource === 'new-material' && metrics.purchaseAmount > 0) {
      const marginStatus = metrics.profitMargin >= 15 ? '🟢' : metrics.profitMargin >= 10 ? '🟡' : '🔴'
      message += `
Profit: ${formatCurrency(metrics.grossProfit)} ${marginStatus}
Margin: ${metrics.profitMargin}%`
    }

    message += `

📋 DETAILS:
Product: ${product}
Date: ${formatDate(deal.date)}
Source: ${deal.materialSource === 'new-material' ? 'Purchase' : 'Stock'}`

    if (deal.purchaseParty) {
      message += `
Supplier: ${deal.purchaseParty}`
    }

    // Strategic notes
    message += `

⚡ STATUS: Processing
📱 Teams coordinating delivery

---
Polymer Trading System`

    return message
  }
}

/**
 * Template registry
 */
const templates: Record<RecipientRole, MessageTemplate> = {
  accounts: accountsTemplate,
  logistics: logisticsTemplate,
  boss1: boss1Template,
  bossog: bossOGTemplate
}

/**
 * Get message template for a specific role
 */
export const getMessageTemplate = (role: RecipientRole): MessageTemplate => {
  const template = templates[role]
  if (!template) {
    throw new Error(`No message template found for role: ${role}`)
  }
  return template
}

/**
 * Generate message for a specific role and deal
 */
export const generateMessage = (role: RecipientRole, deal: DealData): string => {
  const template = getMessageTemplate(role)
  return template.generateMessage(deal)
}

/**
 * Generate all messages for a deal
 */
export const generateAllMessages = (deal: DealData): Record<RecipientRole, string> => {
  return {
    accounts: generateMessage('accounts', deal),
    logistics: generateMessage('logistics', deal),
    boss1: generateMessage('boss1', deal),
    bossog: generateMessage('bossog', deal)
  }
}

/**
 * Validate that a deal has all required data for messaging
 */
export const validateDealForMessaging = (deal: Partial<DealData>): string[] => {
  const errors: string[] = []

  // Required fields
  if (!deal.id) errors.push('Deal ID is required')
  if (!deal.date) errors.push('Deal date is required')
  if (!deal.saleParty) errors.push('Sale party (customer) is required')
  if (!deal.quantitySold || deal.quantitySold <= 0) errors.push('Quantity sold must be positive')
  if (!deal.saleRate || deal.saleRate <= 0) errors.push('Sale rate must be positive')
  if (!deal.deliveryTerms) errors.push('Delivery terms are required')
  if (!deal.productCode) errors.push('Product code is required')
  if (!deal.materialSource) errors.push('Material source is required')

  // Conditional validation for new material
  if (deal.materialSource === 'new-material') {
    if (!deal.purchaseParty) errors.push('Purchase party is required for new material')
    if (!deal.quantityPurchased || deal.quantityPurchased <= 0) {
      errors.push('Purchase quantity is required for new material')
    }
    if (!deal.purchaseRate || deal.purchaseRate <= 0) {
      errors.push('Purchase rate is required for new material')
    }
  }

  return errors
}

/**
 * Get preview of all messages (for testing/debugging)
 */
export const getMessagePreviews = (deal: DealData) => {
  const validationErrors = validateDealForMessaging(deal)

  if (validationErrors.length > 0) {
    throw new Error(`Cannot generate messages: ${validationErrors.join(', ')}`)
  }

  const messages = generateAllMessages(deal)

  return {
    deal: {
      id: deal.id,
      customer: deal.saleParty,
      amount: formatCurrency(deal.quantitySold * deal.saleRate)
    },
    messages,
    stats: {
      accounts: { length: messages.accounts.length },
      logistics: { length: messages.logistics.length },
      boss1: { length: messages.boss1.length },
      bossog: { length: messages.bossog.length }
    }
  }
}

// Export template functions for testing
export { accountsTemplate, logisticsTemplate, boss1Template, bossOGTemplate }
export { formatCurrency, formatNumber, formatDate, calculateDealMetrics }