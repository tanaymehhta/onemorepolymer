"use client"

import { UseFormReturn } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { SearchableDropdown } from "../searchable-dropdown"
import { DealRegistrationFormData, DELIVERY_TERMS_OPTIONS } from "@/types/deal-form"
import { useCustomers } from "@/lib/hooks/use-customers"

interface BasicDealInfoProps {
  form: UseFormReturn<DealRegistrationFormData>
}

export function BasicDealInfo({ form }: BasicDealInfoProps) {
  const { customers, isLoading: isLoadingCustomers } = useCustomers()

  // Transform customers for dropdown
  const customerOptions = customers.map(customer => ({
    value: customer.id,
    label: customer.displayName,
    searchText: customer.searchText,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📋 Basic Deal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Date Field */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd-MM-yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sale Party (Customer) Dropdown */}
          <FormField
            control={form.control}
            name="saleParty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Party (Customer) *</FormLabel>
                <FormControl>
                  <SearchableDropdown
                    value={field.value}
                    onValueChange={field.onChange}
                    options={customerOptions}
                    placeholder="Search customer..."
                    emptyMessage="No customers found."
                    disabled={isLoadingCustomers}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity Sold */}
          <FormField
            control={form.control}
            name="quantitySold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity Sold (kg) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter quantity in kg"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sale Rate */}
          <FormField
            control={form.control}
            name="saleRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Rate (₹/kg) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter rate per kg"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Delivery Terms */}
        <FormField
          control={form.control}
          name="deliveryTerms"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Delivery Terms *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  {DELIVERY_TERMS_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sale Comments */}
        <FormField
          control={form.control}
          name="saleComments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sale Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about the sale..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}