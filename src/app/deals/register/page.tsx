"use client"

import { useState } from "react"
import { DealRegistrationForm } from "@/components/deals/deal-registration-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, MessageSquare } from "lucide-react"
import type { WhatsAppResult } from "@/types/deal-form"

export default function DealRegisterPage() {
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleSubmitSuccess = (dealId: string, whatsappResult?: WhatsAppResult) => {
    console.log("Deal created successfully:", dealId, whatsappResult)

    let message = `Deal ${dealId} created successfully!`

    if (whatsappResult?.enabled) {
      if (whatsappResult.success && whatsappResult.successCount > 0) {
        message += ` Boss1 notification sent to Tanay via WhatsApp.`
      } else if (whatsappResult.failureCount > 0) {
        message += ` Note: WhatsApp notification failed to send.`
      }
    }

    setSuccessMessage(message)
    setErrorMessage("")

    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(""), 5000)
  }

  const handleSubmitError = (error: string) => {
    console.error("Deal creation failed:", error)
    setErrorMessage(error)
    setSuccessMessage("")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Register New Deal</h1>
          <p className="text-muted-foreground mt-2">
            Create a new polymer trading deal with customer and supplier details.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <MessageSquare className="inline h-4 w-4 mr-1" />
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Deal Registration Form</CardTitle>
          </CardHeader>
          <CardContent>
            <DealRegistrationForm
              onSubmitSuccess={handleSubmitSuccess}
              onSubmitError={handleSubmitError}
              className="space-y-8"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}