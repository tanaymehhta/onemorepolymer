"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Customer, FormCustomer } from "@/types/deal-form"

export interface UseCustomersReturn {
  customers: FormCustomer[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<FormCustomer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from("customers")
        .select("*")
        .order("Name", { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Transform data for form usage
      const formattedCustomers: FormCustomer[] = (data || []).map((customer: Customer) => ({
        ...customer,
        displayName: customer.Name,
        searchText: customer.Name.toLowerCase(),
      }))

      setCustomers(formattedCustomers)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch customers"
      setError(errorMessage)
      console.error("Error fetching customers:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await fetchCustomers()
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    isLoading,
    error,
    refetch,
  }
}