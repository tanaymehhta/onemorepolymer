"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Product, FormProduct } from "@/types/deal-form"

export interface UseProductsReturn {
  products: FormProduct[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<FormProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: supabaseError } = await supabase
        .from("products")
        .select("*")
        .order("Product", { ascending: true })

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      // Transform data for form usage
      const formattedProducts: FormProduct[] = (data || []).map((product: Product) => ({
        ...product,
        displayName: `${product.Product} - ${product.Grade} (${product.Company})`,
        searchText: `${product.Product} ${product.Grade} ${product.Company} ${product["Specific Grade"]}`.toLowerCase(),
      }))

      setProducts(formattedProducts)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products"
      setError(errorMessage)
      console.error("Error fetching products:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const refetch = async () => {
    await fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    isLoading,
    error,
    refetch,
  }
}