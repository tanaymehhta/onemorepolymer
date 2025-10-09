"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableDropdown } from "../searchable-dropdown"
import { DealRegistrationFormData } from "@/types/deal-form"
import { useProducts } from "@/lib/hooks/use-products"

interface ProductInformationProps {
  form: UseFormReturn<DealRegistrationFormData>
}

export function ProductInformation({ form }: ProductInformationProps) {
  const { products, isLoading: isLoadingProducts } = useProducts()

  // Transform products for dropdown
  const productOptions = products.map(product => ({
    value: product.id,
    label: product.displayName,
    searchText: product.searchText,
  }))

  // Find selected product for details display
  const selectedProductId = form.watch("productCode")
  const selectedProduct = products.find(p => p.id === selectedProductId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Product Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Product Code Selection */}
        <FormField
          control={form.control}
          name="productCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Code *</FormLabel>
              <FormControl>
                <SearchableDropdown
                  value={field.value}
                  onValueChange={field.onChange}
                  options={productOptions}
                  placeholder="Search by product code, grade, company, or specific grade..."
                  emptyMessage="No products found."
                  disabled={isLoadingProducts}
                />
              </FormControl>
              <FormMessage />
              <div className="text-sm text-muted-foreground">
                Search by product name, grade, company name, or specific grade to find the right product.
              </div>
            </FormItem>
          )}
        />

        {/* Product Details Display (when product is selected) */}
        {selectedProduct && (
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Selected Product Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Product:</span> {selectedProduct.Product}
              </div>
              <div>
                <span className="font-medium">Grade:</span>{" "}
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                  {selectedProduct.Grade}
                </span>
              </div>
              <div>
                <span className="font-medium">Company:</span> {selectedProduct.Company}
              </div>
              <div>
                <span className="font-medium">Specific Grade:</span> {selectedProduct["Specific Grade"]}
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}