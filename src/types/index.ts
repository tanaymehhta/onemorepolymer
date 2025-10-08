export type { Database, Tables, TablesInsert, TablesUpdate } from './database.types'

// Common type aliases for easier use
export type Deal = Tables<'deals_unified'>
export type DealInsert = TablesInsert<'deals_unified'>
export type DealUpdate = TablesUpdate<'deals_unified'>

export type Customer = Tables<'customers'>
export type Supplier = Tables<'suppliers'>
export type Product = Tables<'products'>

export type HealthCheck = Tables<'health_checks'>
export type MessageOutbox = Tables<'message_outbox'>
export type MessageTemplate = Tables<'message_templates'>

// Custom interfaces for the application
export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}