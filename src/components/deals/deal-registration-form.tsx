"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RefinedDealRegistrationSchema, defaultFormValues, type DealRegistrationFormData } from "@/lib/schemas/deal-registration"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { BasicDealInfo } from "./form-sections/basic-deal-info"
import { ProductInformation } from "./form-sections/product-information"
import { MaterialSource } from "./form-sections/material-source"
import { PurchaseDetails } from "./form-sections/purchase-details"
import { CommentsSection } from "./form-sections/comments-section"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DealRegistrationFormProps } from "@/types/deal-form"

export function DealRegistrationForm({
  onSubmitSuccess,
  onSubmitError,
  className
}: DealRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DealRegistrationFormData>({
    resolver: zodResolver(RefinedDealRegistrationSchema),
    defaultValues: defaultFormValues,
    mode: "onChange",
  })

  const watchedMaterialSource = form.watch("materialSource")
  const isPurchaseRequired = watchedMaterialSource === "new-material"

  const onSubmit = async (data: DealRegistrationFormData) => {
    try {
      setIsSubmitting(true)

      console.log("Submitting deal to API:", data)

      // Call real API to create deal with WhatsApp notifications
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create deal')
      }

      if (!result.success) {
        throw new Error(result.error || 'Deal creation failed')
      }

      console.log("Deal created successfully:", result)

      // Pass the real deal ID and WhatsApp results to success handler
      onSubmitSuccess?.(result.data.dealId, result.data.whatsapp)

      // Reset form on success
      form.reset(defaultFormValues)

    } catch (error) {
      console.error("Deal submission error:", error)
      onSubmitError?.(error instanceof Error ? error.message : "Failed to create deal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", className)}>

        {/* Basic Deal Information Section */}
        <BasicDealInfo form={form} />

        {/* Product Information Section */}
        <ProductInformation form={form} />

        {/* Material Source Section */}
        <MaterialSource form={form} />

        {/* Purchase Details Section */}
        <PurchaseDetails
          form={form}
          isRequired={isPurchaseRequired}
        />

        {/* Comments Section */}
        <CommentsSection form={form} />

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset(defaultFormValues)}
            disabled={isSubmitting}
          >
            Reset Form
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Deal...
              </>
            ) : (
              "Register Deal"
            )}
          </Button>
        </div>

        {/* Debug Info - Disabled to prevent hydration errors */}
        {false && process.env.NODE_ENV === "development" && (
          <details className="mt-8 p-4 bg-muted rounded-lg">
            <summary className="cursor-pointer font-medium">Debug: Form State</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(form.watch(), null, 2)}
            </pre>
            <div className="mt-2">
              <strong>Form Valid:</strong> {form.formState.isValid ? "Yes" : "No"}
            </div>
            <div>
              <strong>Errors:</strong>
              <pre className="text-xs">
                {JSON.stringify(form.formState.errors, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </form>
    </Form>
  )
}