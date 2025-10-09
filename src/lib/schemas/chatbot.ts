import { z } from 'zod';

// Message Validation Schema
export const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  conversationId: z.string().min(1, 'Conversation ID required'),
  userSession: z.string().min(1, 'User session required'),
});

export type MessageRequest = z.infer<typeof messageSchema>;

// Chat Response Schema
export const chatResponseSchema = z.object({
  response: z.string(),
  conversationId: z.string(),
  responseTime: z.number(),
  tokensUsed: z.number().optional(),
  error: z.boolean().optional(),
});

export type ChatResponseData = z.infer<typeof chatResponseSchema>;

// Conversation Schema
export const conversationSchema = z.object({
  id: z.string().uuid(),
  user_session: z.string(),
  title: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  context: z.any().optional(),
  metadata: z.any().optional(),
});

export type ConversationData = z.infer<typeof conversationSchema>;

// Chat Message Schema
export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  function_calls: z.any().optional(),
  company_data_accessed: z.any().optional(),
  tokens_used: z.number().optional(),
  response_time_ms: z.number().optional(),
  created_at: z.date(),
});

export type ChatMessageData = z.infer<typeof chatMessageSchema>;

// Company Data Query Schemas
export const queryCustomersSchema = z.object({
  search: z.string().optional(),
  top_customers: z.boolean().optional(),
  recent_activity: z.boolean().optional(),
  credit_status: z.string().optional(),
  min_revenue: z.number().optional(),
  date_range: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
});

export const querySuppliersSchema = z.object({
  search: z.string().optional(),
  product_type: z.string().optional(),
  reliability_score: z.number().min(1).max(10).optional(),
  recent_purchases: z.boolean().optional(),
  payment_terms: z.string().optional(),
  location: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
});

export const queryProductsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  grade: z.string().optional(),
  availability: z.boolean().optional(),
  profitability: z.boolean().optional(),
  trend_analysis: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
});

export const queryDealsSchema = z.object({
  date_range: z.string().optional(),
  customer: z.string().optional(),
  product: z.string().optional(),
  status: z.string().optional(),
  min_value: z.number().optional(),
  profit_analysis: z.boolean().optional(),
  payment_status: z.string().optional(),
  limit: z.number().min(1).max(100).optional().default(10),
});

export const analyzeFinancialsSchema = z.object({
  period: z.string().optional(),
  metric: z.string().optional(),
  comparison: z.boolean().optional(),
  breakdown_by: z.string().optional(),
  forecast: z.boolean().optional(),
});

export const getMarketInsightsSchema = z.object({
  product_category: z.string().optional(),
  trend_analysis: z.boolean().optional(),
  competitor_data: z.boolean().optional(),
  price_movements: z.boolean().optional(),
  demand_forecast: z.boolean().optional(),
});

// Feature Flag Validation
export const featureFlagsSchema = z.object({
  FEATURE_CHATBOT: z.boolean().default(false),
  CHATBOT_MAX_TOKENS_PER_REQUEST: z.number().min(100).max(4000).default(1000),
  CHATBOT_RATE_LIMIT_PER_MINUTE: z.number().min(1).max(100).default(30),
  CHATBOT_DATA_RETENTION_DAYS: z.number().min(1).max(365).default(90),
  CHATBOT_RESPONSE_TIMEOUT_MS: z.number().min(1000).max(30000).default(10000),
  CHATBOT_MAX_CONVERSATION_LENGTH: z.number().min(10).max(200).default(50),
  CHATBOT_ENABLE_FUNCTION_CALLING: z.boolean().default(true),
  CHATBOT_ENABLE_AUDIT_LOGGING: z.boolean().default(true),
});

export type FeatureFlags = z.infer<typeof featureFlagsSchema>;

// Environment Configuration Schema
export const chatbotConfigSchema = z.object({
  openaiApiKey: z.string().min(1, 'OpenAI API key is required'),
  supabaseUrl: z.string().url('Invalid Supabase URL'),
  supabaseServiceKey: z.string().min(1, 'Supabase service key is required'),
  featureFlags: featureFlagsSchema,
});

export type ChatbotConfig = z.infer<typeof chatbotConfigSchema>;

// Validation Helper Functions
export const validateMessage = (data: unknown): MessageRequest => {
  return messageSchema.parse(data);
};

export const validateChatResponse = (data: unknown): ChatResponseData => {
  return chatResponseSchema.parse(data);
};

export const validateConversation = (data: unknown): ConversationData => {
  return conversationSchema.parse(data);
};

export const validateChatMessage = (data: unknown): ChatMessageData => {
  return chatMessageSchema.parse(data);
};

// Configuration Validation
export const validateChatbotConfig = (): ChatbotConfig => {
  const config = {
    openaiApiKey: process.env.OPENAI_API_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    featureFlags: {
      FEATURE_CHATBOT: process.env.FEATURE_CHATBOT === 'true',
      CHATBOT_MAX_TOKENS_PER_REQUEST: parseInt(process.env.CHATBOT_MAX_TOKENS_PER_REQUEST || '1000'),
      CHATBOT_RATE_LIMIT_PER_MINUTE: parseInt(process.env.CHATBOT_RATE_LIMIT_PER_MINUTE || '30'),
      CHATBOT_DATA_RETENTION_DAYS: parseInt(process.env.CHATBOT_DATA_RETENTION_DAYS || '90'),
      CHATBOT_RESPONSE_TIMEOUT_MS: parseInt(process.env.CHATBOT_RESPONSE_TIMEOUT_MS || '10000'),
      CHATBOT_MAX_CONVERSATION_LENGTH: parseInt(process.env.CHATBOT_MAX_CONVERSATION_LENGTH || '50'),
      CHATBOT_ENABLE_FUNCTION_CALLING: process.env.CHATBOT_ENABLE_FUNCTION_CALLING !== 'false',
      CHATBOT_ENABLE_AUDIT_LOGGING: process.env.CHATBOT_ENABLE_AUDIT_LOGGING !== 'false',
    },
  };

  return chatbotConfigSchema.parse(config);
};

// Error Validation
export const chatbotErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  context: z.any().optional(),
  timestamp: z.date().optional().default(() => new Date()),
});

export type ChatbotErrorData = z.infer<typeof chatbotErrorSchema>;