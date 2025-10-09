"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Supplier, FormSupplier } from "@/types/deal-form"

export interface UseSuppliersReturn {
  suppliers: FormSupplier[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSuppliers(): UseSuppliersReturn {
  const [suppliers, setSuppliers] = useState<FormSupplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from("suppliers")
        .select("*")
        .order("Name", { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Transform data for form usage
      const formattedSuppliers: FormSupplier[] = (data || []).map((supplier: Supplier) => ({
        ...supplier,
        displayName: supplier.Name,
        searchText: supplier.Name.toLowerCase(),
      }))

      setSuppliers(formattedSuppliers)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch suppliers"
      setError(errorMessage)
      console.error("Error fetching suppliers:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await fetchSuppliers()
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  return {
    suppliers,
    isLoading,
    error,
    refetch,
  }
}