// Chatbot TypeScript Interfaces
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  function_calls?: any[];
  company_data_accessed?: any;
  tokens_used?: number;
  response_time_ms?: number;
  created_at: Date;
}

export interface ChatConversation {
  id: string;
  user_session: string;
  title?: string;
  created_at: Date;
  updated_at: Date;
  context?: any;
  metadata?: any;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  responseTime: number;
  tokensUsed?: number;
  error?: boolean;
}

export interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    responseTime?: number;
  };
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

// Company Data Query Types
export interface CustomerData {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  credit_limit?: number;
  payment_terms?: string;
  created_at: Date;
}

export interface SupplierData {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  product_categories?: string[];
  reliability_score?: number;
  payment_terms?: string;
  created_at: Date;
}

export interface ProductData {
  id: string;
  name: string;
  category: string;
  grade?: string;
  company?: string;
  specifications?: any;
  base_price?: number;
  availability?: boolean;
  created_at: Date;
}

export interface DealData {
  id: string;
  customer_name: string;
  supplier_name?: string;
  product: string;
  grade?: string;
  company?: string;
  quantity_sold: number;
  sale_rate: number;
  sale_amount: number;
  quantity_purchased?: number;
  purchase_rate?: number;
  purchase_amount?: number;
  profit_margin?: number;
  material_source: 'inventory' | 'new-material';
  delivery_terms: string;
  sale_comments?: string;
  purchase_comments?: string;
  warehouse_location?: string;
  created_at: Date;
}

export interface FinancialAnalysis {
  totalRevenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  dealCount: number;
  avgDealSize: number;
  period?: string;
  breakdown?: any;
}

export interface MarketData {
  productTrends: Record<string, {
    count: number;
    totalVolume: number;
    avgPrice: number;
    avgMargin: number;
  }>;
  topCustomers?: CustomerData[];
  topSuppliers?: SupplierData[];
  insights?: string[];
}

// Function Call Parameter Types
export interface QueryCustomersParams {
  search?: string;
  top_customers?: boolean;
  recent_activity?: boolean;
  credit_status?: string;
  min_revenue?: number;
  date_range?: string;
  limit?: number;
}

export interface QuerySuppliersParams {
  search?: string;
  product_type?: string;
  reliability_score?: number;
  recent_purchases?: boolean;
  payment_terms?: string;
  location?: string;
  limit?: number;
}

export interface QueryProductsParams {
  search?: string;
  category?: string;
  grade?: string;
  availability?: boolean;
  profitability?: boolean;
  trend_analysis?: boolean;
  limit?: number;
}

export interface QueryDealsParams {
  date_range?: string;
  customer?: string;
  product?: string;
  status?: string;
  min_value?: number;
  profit_analysis?: boolean;
  payment_status?: string;
  limit?: number;
}

export interface AnalyzeFinancialsParams {
  period?: string;
  metric?: string;
  comparison?: boolean;
  breakdown_by?: string;
  forecast?: boolean;
}

export interface GetMarketInsightsParams {
  product_category?: string;
  trend_analysis?: boolean;
  competitor_data?: boolean;
  price_movements?: boolean;
  demand_forecast?: boolean;
}

// Agent Configuration
export interface AgentConfig {
  name: string;
  instructions: string;
  maxTokens?: number;
  temperature?: number;
  functions?: any[];
}

// Error Types
export interface ChatbotError extends Error {
  code?: string;
  context?: any;
  timestamp?: Date;
}