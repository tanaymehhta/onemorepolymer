import { z } from "zod"

// Enum definitions for form options
export const DeliveryTermsSchema = z.enum(["delivered", "ex-warehouse"], {
  required_error: "Please select delivery terms",
})

export const MaterialSourceSchema = z.enum(["new-material", "from-inventory"], {
  required_error: "Please select material source",
})

// Main deal registration schema
export const DealRegistrationSchema = z.object({
  // Basic Deal Information
  date: z.date({
    required_error: "Deal date is required",
  }),
  saleParty: z.string({
    required_error: "Sale party (customer) is required",
  }).min(1, "Sale party cannot be empty"),
  quantitySold: z.number({
    required_error: "Quantity sold is required",
  }).positive("Quantity sold must be positive"),
  saleRate: z.number({
    required_error: "Sale rate is required",
  }).positive("Sale rate must be positive"),
  deliveryTerms: DeliveryTermsSchema,
  saleComments: z.string().optional(),

  // Product Information
  productCode: z.string({
    required_error: "Product selection is required",
  }).min(1, "Product cannot be empty"),

  // Material Source
  materialSource: MaterialSourceSchema,

  // Purchase Details
  purchaseParty: z.string().optional(),
  quantityPurchased: z.number().positive("Purchase quantity must be positive").optional(),
  purchaseRate: z.number().positive("Purchase rate must be positive").optional(),
  warehouseLocation: z.string().optional(),

  // Comments
  purchaseComments: z.string().optional(),
  finalComments: z.string().optional(),
})

// Refined schema with conditional validation
export const RefinedDealRegistrationSchema = DealRegistrationSchema.refine(
  (data) => {
    // If material source is "new-material", purchase details are required
    if (data.materialSource === "new-material") {
      return data.purchaseParty && data.quantityPurchased && data.purchaseRate;
    }
    return true;
  },
  {
    message: "Purchase details are required when material source is 'New Material'",
    path: ["purchaseParty"], // This will show the error on purchaseParty field
  }
)

// Type inference
export type DealRegistrationFormData = z.infer<typeof RefinedDealRegistrationSchema>

// Individual field schemas for form validation
export const FieldSchemas = {
  date: z.date(),
  saleParty: z.string().min(1, "Required"),
  quantitySold: z.number().positive("Must be positive"),
  saleRate: z.number().positive("Must be positive"),
  deliveryTerms: DeliveryTermsSchema,
  saleComments: z.string(),
  productCode: z.string().min(1, "Required"),
  materialSource: MaterialSourceSchema,
  purchaseParty: z.string(),
  quantityPurchased: z.number().positive("Must be positive"),
  purchaseRate: z.number().positive("Must be positive"),
  warehouseLocation: z.string(),
  purchaseComments: z.string(),
  finalComments: z.string(),
} as const

// Default values for the form
export const defaultFormValues: Partial<DealRegistrationFormData> = {
  date: new Date(),
  deliveryTerms: "delivered",
  materialSource: "new-material",
  quantitySold: 0,
  saleRate: 0,
  quantityPurchased: 0,
  purchaseRate: 0,
  saleComments: "",
  purchaseComments: "",
  finalComments: "",
  warehouseLocation: "",
}

// Helper functions for form validation
export const validateField = (fieldName: keyof typeof FieldSchemas, value: any) => {
  try {
    FieldSchemas[fieldName].parse(value)
    return { isValid: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message || "Invalid value" }
    }
    return { isValid: false, error: "Validation error" }
  }
}

// Transform form data to database format
export const transformToDatabaseFormat = (formData: DealRegistrationFormData) => {
  return {
    Date: formData.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    "Sale Party": formData.saleParty,
    "Quantity Sold": formData.quantitySold,
    "Sale Rate": formData.saleRate,
    "Purchase Party": formData.purchaseParty || null,
    "Quantity Purchased": formData.quantityPurchased || null,
    "Purchase Rate": formData.purchaseRate || null,
    // These will be populated from product selection
    Product: "", // Will be set when product is selected
    Grade: "", // Will be set when product is selected
    Company: "", // Will be set when product is selected
    "Specific Grade": "", // Will be set when product is selected
    // Generate SrNo - this should be handled by the service layer
    SrNo: "", // Will be generated server-side
  }
}

// Validation error types
export class DealValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = "DealValidationError"
  }
}

// Form step validation - useful for multi-step forms if needed later
export const validateFormStep = (step: string, data: Partial<DealRegistrationFormData>) => {
  switch (step) {
    case "basic":
      return z.object({
        date: FieldSchemas.date,
        saleParty: FieldSchemas.saleParty,
        quantitySold: FieldSchemas.quantitySold,
        saleRate: FieldSchemas.saleRate,
        deliveryTerms: FieldSchemas.deliveryTerms,
      }).safeParse(data)

    case "product":
      return z.object({
        productCode: FieldSchemas.productCode,
        materialSource: FieldSchemas.materialSource,
      }).safeParse(data)

    case "purchase":
      return z.object({
        purchaseParty: FieldSchemas.purchaseParty.optional(),
        quantityPurchased: FieldSchemas.quantityPurchased.optional(),
        purchaseRate: FieldSchemas.purchaseRate.optional(),
        warehouseLocation: FieldSchemas.warehouseLocation.optional(),
      }).safeParse(data)

    default:
      return { success: false, error: "Invalid step" }
  }
}