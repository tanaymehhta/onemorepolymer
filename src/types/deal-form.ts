import type { Database } from './database.types'

// Base types from database
export type DealUnified = Database['public']['Tables']['deals_unified']['Row']
export type DealInsert = Database['public']['Tables']['deals_unified']['Insert']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Supplier = Database['public']['Tables']['suppliers']['Row']
export type Product = Database['public']['Tables']['products']['Row']

// Form-specific types
export interface FormProduct extends Product {
  // Add display formatting
  displayName: string  // "Product - Grade (Company)"
  searchText: string   // For filtering
}

export interface FormCustomer extends Customer {
  displayName: string  // Customer name for display
  searchText: string   // For filtering
}

export interface FormSupplier extends Supplier {
  displayName: string  // Supplier name for display
  searchText: string   // For filtering
}

// Delivery terms options
export type DeliveryTerms = "delivered" | "ex-warehouse"

// Material source options
export type MaterialSource = "new-material" | "from-inventory"

// Form state interface
export interface DealFormState {
  // Basic Deal Information
  date: Date
  saleParty: string
  quantitySold: number
  saleRate: number
  deliveryTerms: DeliveryTerms
  saleComments: string

  // Product Information
  productCode: string
  selectedProduct?: FormProduct

  // Material Source
  materialSource: MaterialSource

  // Purchase Details
  purchaseParty: string
  quantityPurchased: number
  purchaseRate: number
  warehouseLocation: string

  // Comments
  purchaseComments: string
  finalComments: string
}

// Form errors interface
export interface DealFormErrors {
  date?: string
  saleParty?: string
  quantitySold?: string
  saleRate?: string
  deliveryTerms?: string
  saleComments?: string
  productCode?: string
  materialSource?: string
  purchaseParty?: string
  quantityPurchased?: string
  purchaseRate?: string
  warehouseLocation?: string
  purchaseComments?: string
  finalComments?: string
  general?: string
}

// Form submission state
export interface FormSubmissionState {
  isSubmitting: boolean
  isSuccess: boolean
  error?: string
  dealId?: string
}

// Dropdown data interfaces
export interface DropdownData {
  customers: FormCustomer[]
  suppliers: FormSupplier[]
  products: FormProduct[]
}

export interface DropdownLoadingState {
  customers: boolean
  suppliers: boolean
  products: boolean
}

// Form field props interface for reusable components
export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// Searchable dropdown props
export interface SearchableDropdownProps extends FormFieldProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{
    value: string
    label: string
    searchText?: string
  }>
  placeholder?: string
  isLoading?: boolean
  emptyMessage?: string
}

// Radio group props
export interface RadioGroupProps extends FormFieldProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{
    value: string
    label: string
  }>
}

// Form section props
export interface FormSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

// Deal calculation interface for cost calculations
export interface DealCalculation {
  saleAmount: number
  purchaseAmount: number
  grossProfit: number
  profitMargin: number
}

// API response types
export interface CreateDealResponse {
  success: boolean
  data?: {
    dealId: string
    deal: DealUnified
  }
  error?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  message: string
  field?: string
  code?: string
}

// Form hooks return types
export interface UseDealFormReturn {
  formState: DealFormState
  errors: DealFormErrors
  isSubmitting: boolean
  isValid: boolean
  updateField: (field: keyof DealFormState, value: any) => void
  validateField: (field: keyof DealFormState) => boolean
  submitForm: () => Promise<CreateDealResponse>
  resetForm: () => void
}

export interface UseDropdownDataReturn {
  data: DropdownData
  loading: DropdownLoadingState
  error: string | null
  refetch: () => Promise<void>
}

// WhatsApp result types
export interface WhatsAppResult {
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

// Form component props
export interface DealRegistrationFormProps {
  onSubmitSuccess?: (dealId: string, whatsappResult?: WhatsAppResult) => void
  onSubmitError?: (error: string) => void
  className?: string
}

// Individual section component props
export interface BasicDealInfoProps {
  formState: Partial<DealFormState>
  errors: DealFormErrors
  customers: FormCustomer[]
  isLoadingCustomers: boolean
  onFieldChange: (field: keyof DealFormState, value: any) => void
}

export interface ProductInformationProps {
  formState: Partial<DealFormState>
  errors: DealFormErrors
  products: FormProduct[]
  isLoadingProducts: boolean
  onFieldChange: (field: keyof DealFormState, value: any) => void
}

export interface MaterialSourceProps {
  formState: Partial<DealFormState>
  errors: DealFormErrors
  onFieldChange: (field: keyof DealFormState, value: any) => void
}

export interface PurchaseDetailsProps {
  formState: Partial<DealFormState>
  errors: DealFormErrors
  suppliers: FormSupplier[]
  isLoadingSuppliers: boolean
  onFieldChange: (field: keyof DealFormState, value: any) => void
  isRequired: boolean  // Based on materialSource
}

export interface CommentsSectionProps {
  formState: Partial<DealFormState>
  errors: DealFormErrors
  onFieldChange: (field: keyof DealFormState, value: any) => void
}

// Utility types
export type FormFieldNames = keyof DealFormState
export type RequiredFormFields = "date" | "saleParty" | "quantitySold" | "saleRate" | "deliveryTerms" | "productCode" | "materialSource"
export type OptionalFormFields = Exclude<FormFieldNames, RequiredFormFields>

// Constants
export const DELIVERY_TERMS_OPTIONS: Array<{ value: DeliveryTerms; label: string }> = [
  { value: "delivered", label: "Delivered" },
  { value: "ex-warehouse", label: "Ex-Warehouse (Pickup)" },
] as const

export const MATERIAL_SOURCE_OPTIONS: Array<{ value: MaterialSource; label: string }> = [
  { value: "new-material", label: "New Material" },
  { value: "from-inventory", label: "From Inventory" },
] as const

// Form configuration
export const FORM_CONFIG = {
  maxCommentLength: 1000,
  minQuantity: 0.01,
  minRate: 0.01,
  maxQuantity: 999999,
  maxRate: 999999,
  dateFormat: "yyyy-MM-dd",
  currencySymbol: "₹",
  quantityUnit: "kg",
} as const