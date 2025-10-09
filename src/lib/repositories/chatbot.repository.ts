import { createClient } from '@supabase/supabase-js';
import { format, subDays } from 'date-fns';
import type {
  ChatMessage,
  ChatConversation,
  CustomerData,
  SupplierData,
  ProductData,
  DealData,
  FinancialAnalysis,
  MarketData,
  QueryCustomersParams,
  QuerySuppliersParams,
  QueryProductsParams,
  QueryDealsParams,
  AnalyzeFinancialsParams,
  GetMarketInsightsParams
} from '@/types/chatbot';

export class ChatbotRepository {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // Conversation Management
  async createConversation(userSession: string): Promise<string> {
    const { data, error } = await this.supabase
      .from('chat_conversations')
      .insert({
        user_session: userSession,
        title: 'New Conversation',
        context: {},
        metadata: {}
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to create conversation');
    }

    return data.id;
  }

  async getConversationHistory(conversationId: string, limit: number = 50): Promise<ChatMessage[]> {
    const { data, error } = await this.supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Failed to get conversation history:', error);
      throw new Error('Failed to get conversation history');
    }

    return data || [];
  }

  async saveMessage(conversationId: string, message: {
    role: string;
    content: string;
    responseTime?: number;
    tokensUsed?: number;
    functionCalls?: any[];
  }): Promise<void> {
    const { error } = await this.supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        response_time_ms: message.responseTime,
        tokens_used: message.tokensUsed,
        function_calls: message.functionCalls
      });

    if (error) {
      console.error('Failed to save message:', error);
      throw new Error('Failed to save message');
    }
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    if (error) {
      console.error('Failed to update conversation title:', error);
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Failed to delete conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  async cleanupOldConversations(retentionDays: number): Promise<void> {
    const cutoffDate = subDays(new Date(), retentionDays);

    const { error } = await this.supabase
      .from('chat_conversations')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Failed to cleanup old conversations:', error);
    }
  }

  // Company Data Query Methods
  async queryCustomers(params: QueryCustomersParams): Promise<CustomerData[]> {
    let query = this.supabase
      .from('customers')
      .select('*')
      .limit(params.limit || 10);

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params.top_customers) {
      // Join with deals to get revenue data
      query = this.supabase
        .from('customers')
        .select(`
          *,
          deals_unified!inner(customer_name, sale_amount)
        `)
        .order('deals_unified.sale_amount', { ascending: false })
        .limit(params.limit || 10);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to query customers:', error);
      throw new Error('Failed to query customers');
    }

    return data || [];
  }

  async querySuppliers(params: QuerySuppliersParams): Promise<SupplierData[]> {
    let query = this.supabase
      .from('suppliers')
      .select('*')
      .limit(params.limit || 10);

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params.product_type) {
      query = query.eq('product_category', params.product_type);
    }

    if (params.location) {
      query = query.ilike('city', `%${params.location}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to query suppliers:', error);
      throw new Error('Failed to query suppliers');
    }

    return data || [];
  }

  async queryProducts(params: QueryProductsParams): Promise<ProductData[]> {
    let query = this.supabase
      .from('products')
      .select('*')
      .limit(params.limit || 10);

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    if (params.category) {
      query = query.eq('category', params.category);
    }

    if (params.grade) {
      query = query.ilike('grade', `%${params.grade}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to query products:', error);
      throw new Error('Failed to query products');
    }

    return data || [];
  }

  async queryDeals(params: QueryDealsParams): Promise<DealData[]> {
    let query = this.supabase
      .from('deals_unified')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(params.limit || 10);

    if (params.date_range) {
      const [start, end] = params.date_range.split(',');
      if (start) query = query.gte('created_at', start);
      if (end) query = query.lte('created_at', end);
    }

    if (params.customer) {
      query = query.ilike('customer_name', `%${params.customer}%`);
    }

    if (params.product) {
      query = query.ilike('product', `%${params.product}%`);
    }

    if (params.min_value) {
      query = query.gte('sale_amount', params.min_value);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to query deals:', error);
      throw new Error('Failed to query deals');
    }

    return data || [];
  }

  async analyzeFinancials(params: AnalyzeFinancialsParams): Promise<FinancialAnalysis> {
    // Get deals data for financial analysis
    let query = this.supabase
      .from('deals_unified')
      .select('sale_amount, purchase_amount, created_at, customer_name, product, quantity_sold, sale_rate, purchase_rate');

    if (params.period) {
      const periodStart = this.getPeriodStart(params.period);
      query = query.gte('created_at', periodStart.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to analyze financials:', error);
      throw new Error('Failed to analyze financials');
    }

    if (!data || data.length === 0) {
      return {
        totalRevenue: 0,
        totalCost: 0,
        profit: 0,
        margin: 0,
        dealCount: 0,
        avgDealSize: 0
      };
    }

    // Calculate financial metrics
    const totalRevenue = data.reduce((sum, deal) => sum + (deal.sale_amount || 0), 0);
    const totalCost = data.reduce((sum, deal) => sum + (deal.purchase_amount || 0), 0);
    const profit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    let breakdown: any = {};

    if (params.breakdown_by === 'customer') {
      breakdown = data.reduce((acc, deal) => {
        const customer = deal.customer_name;
        if (!acc[customer]) {
          acc[customer] = { revenue: 0, cost: 0, profit: 0, deals: 0 };
        }
        acc[customer].revenue += deal.sale_amount || 0;
        acc[customer].cost += deal.purchase_amount || 0;
        acc[customer].profit = acc[customer].revenue - acc[customer].cost;
        acc[customer].deals += 1;
        return acc;
      }, {});
    } else if (params.breakdown_by === 'product') {
      breakdown = data.reduce((acc, deal) => {
        const product = deal.product;
        if (!acc[product]) {
          acc[product] = { revenue: 0, cost: 0, profit: 0, deals: 0 };
        }
        acc[product].revenue += deal.sale_amount || 0;
        acc[product].cost += deal.purchase_amount || 0;
        acc[product].profit = acc[product].revenue - acc[product].cost;
        acc[product].deals += 1;
        return acc;
      }, {});
    }

    return {
      totalRevenue,
      totalCost,
      profit,
      margin,
      dealCount: data.length,
      avgDealSize: totalRevenue / data.length,
      period: params.period,
      breakdown
    };
  }

  async getMarketInsights(params: GetMarketInsightsParams): Promise<MarketData> {
    // Get recent deals data for market analysis
    const { data, error } = await this.supabase
      .from('deals_unified')
      .select('product, sale_rate, purchase_rate, created_at, quantity_sold, customer_name')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Failed to get market insights:', error);
      throw new Error('Failed to get market insights');
    }

    if (!data || data.length === 0) {
      return { productTrends: {} };
    }

    // Analyze trends by product
    const productTrends = data.reduce((acc, deal) => {
      const product = deal.product;
      if (!acc[product]) {
        acc[product] = {
          count: 0,
          totalVolume: 0,
          avgPrice: 0,
          avgMargin: 0
        };
      }

      acc[product].count++;
      acc[product].totalVolume += deal.quantity_sold || 0;

      // Calculate average price (weighted)
      const currentAvg = acc[product].avgPrice;
      acc[product].avgPrice = (currentAvg * (acc[product].count - 1) + deal.sale_rate) / acc[product].count;

      // Calculate margin
      const margin = deal.sale_rate > 0 ? ((deal.sale_rate - deal.purchase_rate) / deal.sale_rate) * 100 : 0;
      const currentMarginAvg = acc[product].avgMargin;
      acc[product].avgMargin = (currentMarginAvg * (acc[product].count - 1) + margin) / acc[product].count;

      return acc;
    }, {} as Record<string, any>);

    // Get top customers if requested
    let topCustomers: CustomerData[] = [];
    if (params.trend_analysis) {
      topCustomers = await this.queryCustomers({ top_customers: true, limit: 5 });
    }

    return {
      productTrends,
      topCustomers
    };
  }

  // Helper Methods
  private getPeriodStart(period: string): Date {
    const now = new Date();

    switch (period.toLowerCase()) {
      case 'week':
      case 'this week':
        return subDays(now, 7);
      case 'month':
      case 'this month':
        return subDays(now, 30);
      case 'quarter':
      case 'this quarter':
        return subDays(now, 90);
      case 'year':
      case 'this year':
        return subDays(now, 365);
      default:
        // Try to parse as number of days
        const days = parseInt(period);
        if (!isNaN(days)) {
          return subDays(now, days);
        }
        return subDays(now, 30); // Default to 30 days
    }
  }

  // Health Check
  async testConnection(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('chat_conversations')
        .select('id')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}