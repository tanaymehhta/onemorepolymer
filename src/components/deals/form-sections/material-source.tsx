"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { DealRegistrationFormData, MATERIAL_SOURCE_OPTIONS } from "@/types/deal-form"

interface MaterialSourceProps {
  form: UseFormReturn<DealRegistrationFormData>
}

export function MaterialSource({ form }: MaterialSourceProps) {
  const selectedSource = form.watch("materialSource")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📦 Material Source
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Material Source Selection */}
        <FormField
          control={form.control}
          name="materialSource"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Sale Source *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {MATERIAL_SOURCE_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`
                        flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer
                        ${selectedSource === option.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                        }
                      `}
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.value === "new-material"
                            ? "Purchase new material from supplier and sell to customer"
                            : "Sell existing material from warehouse inventory"
                          }
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Information Message */}
        {selectedSource && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-lg">ℹ️</div>
              <div className="text-sm text-blue-800">
                {selectedSource === "new-material" ? (
                  <div>
                    <div className="font-medium mb-1">New Material Selected</div>
                    <div>Purchase details will be required. You'll need to specify the supplier, purchase quantity, and purchase rate.</div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium mb-1">From Inventory Selected</div>
                    <div>Material will be taken from existing warehouse stock. Purchase details are optional.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}