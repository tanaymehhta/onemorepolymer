"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableDropdown } from "../searchable-dropdown"
import { DealRegistrationFormData } from "@/types/deal-form"
import { useSuppliers } from "@/lib/hooks/use-suppliers"

interface PurchaseDetailsProps {
  form: UseFormReturn<DealRegistrationFormData>
  isRequired: boolean
}

export function PurchaseDetails({ form, isRequired }: PurchaseDetailsProps) {
  const { suppliers, isLoading: isLoadingSuppliers } = useSuppliers()

  // Transform suppliers for dropdown
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.id,
    label: supplier.displayName,
    searchText: supplier.searchText,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏭 Purchase Details
          {isRequired && (
            <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              Required for New Material
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Purchase Party (Supplier) */}
          <FormField
            control={form.control}
            name="purchaseParty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Purchase Party (Supplier) {isRequired && "*"}
                </FormLabel>
                <FormControl>
                  <SearchableDropdown
                    value={field.value}
                    onValueChange={field.onChange}
                    options={supplierOptions}
                    placeholder="Search supplier..."
                    emptyMessage="No suppliers found."
                    disabled={isLoadingSuppliers}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Purchase Quantity */}
          <FormField
            control={form.control}
            name="quantityPurchased"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Purchase Quantity (kg) {isRequired && "*"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter purchase quantity"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Purchase Rate */}
          <FormField
            control={form.control}
            name="purchaseRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Purchase Rate (₹/kg) {isRequired && "*"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter purchase rate"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Warehouse Location */}
          <FormField
            control={form.control}
            name="warehouseLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse Location</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter warehouse location"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Purchase Calculation Display */}
        {form.watch("quantityPurchased") > 0 && form.watch("purchaseRate") > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Purchase Calculation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Quantity:</span>{" "}
                {form.watch("quantityPurchased").toLocaleString()} kg
              </div>
              <div>
                <span className="font-medium">Rate:</span>{" "}
                ₹{form.watch("purchaseRate").toLocaleString()}/kg
              </div>
              <div>
                <span className="font-medium">Total Amount:</span>{" "}
                <span className="text-lg font-semibold text-primary">
                  ₹{(form.watch("quantityPurchased") * form.watch("purchaseRate")).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deal Margin Calculation (if both sale and purchase data available) */}
        {form.watch("quantitySold") > 0 && form.watch("saleRate") > 0 &&
         form.watch("quantityPurchased") > 0 && form.watch("purchaseRate") > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-green-800">Deal Margin Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">Sale Amount:</span>
                <div className="text-lg font-semibold">
                  ₹{(form.watch("quantitySold") * form.watch("saleRate")).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="font-medium text-green-700">Purchase Amount:</span>
                <div className="text-lg font-semibold">
                  ₹{(form.watch("quantityPurchased") * form.watch("purchaseRate")).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="font-medium text-green-700">Gross Profit:</span>
                <div className="text-lg font-semibold">
                  ₹{((form.watch("quantitySold") * form.watch("saleRate")) -
                     (form.watch("quantityPurchased") * form.watch("purchaseRate"))).toLocaleString()}
                </div>
              </div>
              <div>
                <span className="font-medium text-green-700">Margin %:</span>
                <div className="text-lg font-semibold">
                  {(((form.watch("quantitySold") * form.watch("saleRate")) -
                     (form.watch("quantityPurchased") * form.watch("purchaseRate"))) /
                    (form.watch("quantitySold") * form.watch("saleRate")) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}