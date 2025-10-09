import { Agent, run } from '@openai/agents';
import { ChatbotRepository } from '../repositories/chatbot.repository';
import { validateChatbotConfig } from '../schemas/chatbot';
import type {
  ChatResponse,
  QueryCustomersParams,
  QuerySuppliersParams,
  QueryProductsParams,
  QueryDealsParams,
  AnalyzeFinancialsParams,
  GetMarketInsightsParams
} from '@/types/chatbot';

const POLYMER_TRADING_AGENT_INSTRUCTIONS = `
You are a Polymer Trading Intelligence Assistant with access to all company data.

COMMUNICATION STYLE - CRITICAL REQUIREMENTS:
- **ULTRA CONCISE**: Maximum 2-3 sentences per response
- **HIGH READABILITY**: Simple words, clear structure, no jargon
- **ARTICULATE**: Professional but direct
- **TO THE POINT**: Zero fluff, only essential information
- **DATA-DRIVEN**: Always cite specific numbers, dates, amounts

RESPONSE FORMAT:
1. Lead with the key insight
2. Support with 1-2 critical data points
3. End with actionable takeaway (if relevant)

EXAMPLES - GOOD vs BAD:

❌ BAD: "Based on my comprehensive analysis of our customer database and recent transaction history, I can see that Reliance Industries has been one of our most valuable clients. They have a strong payment history and have been ordering consistently. Their recent activity shows they prefer polypropylene grades and typically order in large quantities."

✅ GOOD: "Reliance Industries: ₹2.3M revenue YTD (18% profit margin). Last order: Oct 5, PP H110MA. Payment: Always on time."

❌ BAD: "Looking at the various polymer grades we handle and analyzing their profitability metrics across different time periods, I can provide insights into which products are generating the highest margins."

✅ GOOD: "Top profitable grades: PE L-HD (22% margin), PP H110MA (19% margin). Focus on PE L-HD next quarter."

FUNCTION CALLING STRATEGY:
- Always query relevant data before responding
- Use multiple data sources for comprehensive answers
- Verify data freshness and accuracy
- Log all data access for audit purposes

PERSONALITY:
- Efficient business advisor
- No small talk or pleasantries
- Maximum value per word
- Confident in data analysis
- Proactive in suggesting improvements

SAFETY:
- Never expose sensitive customer information inappropriately
- Maintain confidentiality of competitive intelligence
- Validate data before making strategic recommendations
- Escalate complex decisions to human oversight
`;

export class ChatbotService {
  private agent: Agent;
  private repository: ChatbotRepository;
  private config: ReturnType<typeof validateChatbotConfig>;

  constructor() {
    this.config = validateChatbotConfig();

    if (!this.config.featureFlags.FEATURE_CHATBOT) {
      throw new Error('Chatbot feature is disabled');
    }

    this.repository = new ChatbotRepository();

    this.agent = new Agent({
      name: "Polymer Trading Intelligence Assistant",
      instructions: POLYMER_TRADING_AGENT_INSTRUCTIONS,
      functions: this.config.featureFlags.CHATBOT_ENABLE_FUNCTION_CALLING ? [
        {
          name: 'queryCustomers',
          description: 'Query customer data with filtering and analysis options',
          parameters: {
            type: 'object',
            properties: {
              search: { type: 'string', description: 'Search customer names' },
              top_customers: { type: 'boolean', description: 'Get top revenue customers' },
              recent_activity: { type: 'boolean', description: 'Filter by recent activity' },
              credit_status: { type: 'string', description: 'Filter by credit status' },
              min_revenue: { type: 'number', description: 'Minimum revenue filter' },
              date_range: { type: 'string', description: 'Date range for analysis' },
              limit: { type: 'number', description: 'Limit results', default: 10 }
            }
          },
          function: this.queryCustomers.bind(this)
        },
        {
          name: 'querySuppliers',
          description: 'Query supplier data with filtering and performance metrics',
          parameters: {
            type: 'object',
            properties: {
              search: { type: 'string', description: 'Search supplier names' },
              product_type: { type: 'string', description: 'Filter by product category' },
              reliability_score: { type: 'number', description: 'Minimum reliability score' },
              recent_purchases: { type: 'boolean', description: 'Filter by recent purchases' },
              payment_terms: { type: 'string', description: 'Filter by payment terms' },
              location: { type: 'string', description: 'Filter by location' },
              limit: { type: 'number', description: 'Limit results', default: 10 }
            }
          },
          function: this.querySuppliers.bind(this)
        },
        {
          name: 'queryProducts',
          description: 'Query product catalog with profitability and availability data',
          parameters: {
            type: 'object',
            properties: {
              search: { type: 'string', description: 'Search product names' },
              category: { type: 'string', description: 'Filter by product category' },
              grade: { type: 'string', description: 'Filter by product grade' },
              availability: { type: 'boolean', description: 'Filter by availability' },
              profitability: { type: 'boolean', description: 'Include profitability analysis' },
              trend_analysis: { type: 'boolean', description: 'Include trend analysis' },
              limit: { type: 'number', description: 'Limit results', default: 10 }
            }
          },
          function: this.queryProducts.bind(this)
        },
        {
          name: 'queryDeals',
          description: 'Query deal data with filtering and profitability analysis',
          parameters: {
            type: 'object',
            properties: {
              date_range: { type: 'string', description: 'Date range for deals' },
              customer: { type: 'string', description: 'Filter by customer' },
              product: { type: 'string', description: 'Filter by product' },
              status: { type: 'string', description: 'Filter by deal status' },
              min_value: { type: 'number', description: 'Minimum deal value' },
              profit_analysis: { type: 'boolean', description: 'Include profit analysis' },
              payment_status: { type: 'string', description: 'Filter by payment status' },
              limit: { type: 'number', description: 'Limit results', default: 10 }
            }
          },
          function: this.queryDeals.bind(this)
        },
        {
          name: 'analyzeFinancials',
          description: 'Analyze financial performance with metrics and comparisons',
          parameters: {
            type: 'object',
            properties: {
              period: { type: 'string', description: 'Time period for analysis' },
              metric: { type: 'string', description: 'Specific metric to analyze' },
              comparison: { type: 'boolean', description: 'Include period comparisons' },
              breakdown_by: { type: 'string', description: 'Breakdown by customer/product/etc' },
              forecast: { type: 'boolean', description: 'Include forecast data' }
            }
          },
          function: this.analyzeFinancials.bind(this)
        },
        {
          name: 'getMarketInsights',
          description: 'Get market intelligence and trend analysis',
          parameters: {
            type: 'object',
            properties: {
              product_category: { type: 'string', description: 'Focus on specific product category' },
              trend_analysis: { type: 'boolean', description: 'Include trend analysis' },
              competitor_data: { type: 'boolean', description: 'Include competitive insights' },
              price_movements: { type: 'boolean', description: 'Analyze price trends' },
              demand_forecast: { type: 'boolean', description: 'Include demand forecasting' }
            }
          },
          function: this.getMarketInsights.bind(this)
        }
      ] : []
    });
  }

  async processMessage(
    message: string,
    conversationId: string,
    userSession: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // Check rate limiting
      await this.checkRateLimit(userSession);

      // Get or create conversation
      let actualConversationId = conversationId;

      // Check if conversationId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!conversationId || conversationId === 'new' || !uuidRegex.test(conversationId)) {
        actualConversationId = await this.repository.createConversation(userSession);
      }

      // Get conversation history for context
      const history = await this.repository.getConversationHistory(
        actualConversationId,
        this.config.featureFlags.CHATBOT_MAX_CONVERSATION_LENGTH
      );

      // Build message history for agent - ensure clean format with string content
      const messages = [
        ...history.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        })),
        { role: 'user', content: message }
      ];

      // Run agent with timeout
      const agentPromise = run(this.agent, messages);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Response timeout')), this.config.featureFlags.CHATBOT_RESPONSE_TIMEOUT_MS)
      );

      const result = await Promise.race([agentPromise, timeoutPromise]) as any;
      const responseTime = Date.now() - startTime;

      // Save user message
      await this.repository.saveMessage(actualConversationId, {
        role: 'user',
        content: message,
        responseTime,
        functionCalls: []
      });

      // Save assistant response
      await this.repository.saveMessage(actualConversationId, {
        role: 'assistant',
        content: result.finalOutput,
        responseTime,
        tokensUsed: result.tokensUsed,
        functionCalls: result.functionCalls || []
      });

      // Update conversation title if it's the first message
      if (history.length === 0) {
        const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
        await this.repository.updateConversationTitle(actualConversationId, title);
      }

      return {
        response: result.finalOutput,
        conversationId: actualConversationId,
        responseTime,
        tokensUsed: result.tokensUsed
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Log error for debugging
      console.error('Chatbot processing failed:', error);

      // Save error message if conversation exists
      if (conversationId && conversationId !== 'new') {
        await this.repository.saveMessage(conversationId, {
          role: 'system',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          responseTime
        }).catch(console.error);
      }

      const errorMessage = error instanceof Error && error.message === 'Response timeout'
        ? "Response took too long. Please try a simpler question."
        : "I encountered an error processing your request. Please try rephrasing your question.";

      return {
        response: errorMessage,
        conversationId: conversationId || 'error',
        responseTime,
        error: true
      };
    }
  }

  private async checkRateLimit(userSession: string): Promise<void> {
    // Simple in-memory rate limiting
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    // In production, use Redis or database for rate limiting
    // For now, skip rate limiting in development
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // TODO: Implement proper rate limiting
  }

  // Company Data Access Functions
  private async queryCustomers(params: QueryCustomersParams): Promise<any> {
    try {
      const data = await this.repository.queryCustomers(params);

      if (this.config.featureFlags.CHATBOT_ENABLE_AUDIT_LOGGING) {
        console.log('Data access: queryCustomers', { params, resultCount: data.length });
      }

      return data;
    } catch (error) {
      console.error('queryCustomers failed:', error);
      throw new Error('Unable to query customer data');
    }
  }

  private async querySuppliers(params: QuerySuppliersParams): Promise<any> {
    try {
      const data = await this.repository.querySuppliers(params);

      if (this.config.featureFlags.CHATBOT_ENABLE_AUDIT_LOGGING) {
        console.log('Data access: querySuppliers', { params, resultCount: data.length });
      }

      return data;
    } catch (error) {
      console.error('querySuppliers failed:', error);
      throw new Error('Unable to query supplier data');
    }
  }

  private async queryProducts(params: QueryProductsParams): Promise<any> {
    try {
      const data = await this.repository.queryProducts(params);

      if (this.config.featureFlags.CHATBOT_ENABLE_AUDIT_LOGGING) {
        console.log('Data access: queryProducts', { params, resultCount: data.length });
      }

      return data;
    } catch (error) {
      console.error('queryProducts failed:', error);
      throw new Error('Unable to query product data');
    }
  }

  private async queryDeals(params: QueryDealsParams): Promise<any> {
    try {
      const data = await this.repository.queryDeals(params);

      if (this.config.featureFlags.CHATBOT_ENABLE_AUDIT_LOGGING) {
        console.log('Data access: queryDeals', { params, resultCount: data.length });
      }

      return data;
    } catch (error) {
      console.error('queryDeals failed:', error);
      throw new Error('Unable to query deal data');
    }
  }

  private async analyzeFinancials(params: AnalyzeFinancialsParams): Promise<any> {
    try {
      const data = await this.repository.analyzeFinancials(params);

      if (this.config.featureFlags.CHATBOT_ENABLE_AUDIT_LOGGING) {
        console.log('Data access: analyzeFinancials', { params });
      }

      return data;
    } catch (error) {
      console.error('analyzeFinancials failed:', error);
      throw new Error('Unable to analyze financial data');
    }
  }

  private async getMarketInsights(params: GetMarketInsightsParams): Promise<any> {
    try {
      const data = await this.repository.getMarketInsights(params);

      if (this.config.featureFlags.CHATBOT_ENABLE_AUDIT_LOGGING) {
        console.log('Data access: getMarketInsights', { params });
      }

      return data;
    } catch (error) {
      console.error('getMarketInsights failed:', error);
      throw new Error('Unable to get market insights');
    }
  }

  // Utility Methods
  async getConversationHistory(conversationId: string): Promise<any> {
    return await this.repository.getConversationHistory(conversationId);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.repository.deleteConversation(conversationId);
  }

  async cleanupOldConversations(): Promise<void> {
    const retentionDays = this.config.featureFlags.CHATBOT_DATA_RETENTION_DAYS;
    await this.repository.cleanupOldConversations(retentionDays);
  }
}