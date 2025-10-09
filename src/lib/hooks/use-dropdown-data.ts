"use client"

import { useCustomers } from "./use-customers"
import { useSuppliers } from "./use-suppliers"
import { useProducts } from "./use-products"
import type { DropdownData, DropdownLoadingState } from "@/types/deal-form"

export interface UseDropdownDataReturn {
  data: DropdownData
  loading: DropdownLoadingState
  error: string | null
  refetch: () => Promise<void>
}

export function useDropdownData(): UseDropdownDataReturn {
  const customersQuery = useCustomers()
  const suppliersQuery = useSuppliers()
  const productsQuery = useProducts()

  const data: DropdownData = {
    customers: customersQuery.customers,
    suppliers: suppliersQuery.suppliers,
    products: productsQuery.products,
  }

  const loading: DropdownLoadingState = {
    customers: customersQuery.isLoading,
    suppliers: suppliersQuery.isLoading,
    products: productsQuery.isLoading,
  }

  // Combine errors
  const error = customersQuery.error || suppliersQuery.error || productsQuery.error

  // Refetch all data
  const refetch = async () => {
    await Promise.all([
      customersQuery.refetch(),
      suppliersQuery.refetch(),
      productsQuery.refetch(),
    ])
  }

  return {
    data,
    loading,
    error,
    refetch,
  }
}