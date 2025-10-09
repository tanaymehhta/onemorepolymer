"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DealRegistrationFormData } from "@/types/deal-form"

interface CommentsSectionProps {
  form: UseFormReturn<DealRegistrationFormData>
}

export function CommentsSection({ form }: CommentsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💬 Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Purchase Comments */}
        <FormField
          control={form.control}
          name="purchaseComments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about the purchase..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground">
                Notes about supplier, quality, delivery terms, payment conditions, etc.
              </div>
            </FormItem>
          )}
        />

        {/* Final Comments */}
        <FormField
          control={form.control}
          name="finalComments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any final notes or instructions..."
                  className="resize-none min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground">
                Final instructions, special handling requirements, follow-up actions, etc.
              </div>
            </FormItem>
          )}
        />

        {/* Character Counts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            Purchase Comments: {form.watch("purchaseComments")?.length || 0}/1000 characters
          </div>
          <div>
            Final Comments: {form.watch("finalComments")?.length || 0}/1000 characters
          </div>
        </div>

      </CardContent>
    </Card>
  )
}