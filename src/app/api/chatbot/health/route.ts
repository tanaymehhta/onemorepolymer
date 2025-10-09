import { NextResponse } from 'next/server';
import { ChatbotRepository } from '@/lib/repositories/chatbot.repository';
import { validateChatbotConfig } from '@/lib/schemas/chatbot';

export async function GET() {
  try {
    const startTime = Date.now();

    // Check feature flag
    const featureEnabled = process.env.FEATURE_CHATBOT === 'true';

    // Test configuration
    let configValid = true;
    let configError = '';
    try {
      validateChatbotConfig();
    } catch (error) {
      configValid = false;
      configError = error instanceof Error ? error.message : 'Configuration validation failed';
    }

    // Test database connection
    let databaseHealth = 'unknown';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      const repository = new ChatbotRepository();
      const isConnected = await repository.testConnection();
      dbResponseTime = Date.now() - dbStart;
      databaseHealth = isConnected ? 'healthy' : 'unhealthy';
    } catch (error) {
      databaseHealth = 'error';
      dbResponseTime = Date.now() - startTime;
    }

    // Test OpenAI configuration
    let openaiHealth = 'unknown';
    try {
      const hasApiKey = !!process.env.OPENAI_API_KEY;
      const isValidFormat = process.env.OPENAI_API_KEY?.startsWith('sk-');
      openaiHealth = hasApiKey && isValidFormat ? 'configured' : 'not_configured';
    } catch (error) {
      openaiHealth = 'error';
    }

    const totalResponseTime = Date.now() - startTime;

    const overallStatus =
      featureEnabled && configValid && databaseHealth === 'healthy' && openaiHealth === 'configured'
        ? 'healthy'
        : 'degraded';

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      services: {
        feature_flag: {
          status: featureEnabled ? 'enabled' : 'disabled',
          value: featureEnabled
        },
        configuration: {
          status: configValid ? 'valid' : 'invalid',
          error: configError || undefined
        },
        database: {
          status: databaseHealth,
          responseTime: dbResponseTime
        },
        openai: {
          status: openaiHealth,
          configured: openaiHealth === 'configured'
        }
      },
      environment: {
        node_env: process.env.NODE_ENV,
        chatbot_enabled: featureEnabled,
        function_calling: process.env.CHATBOT_ENABLE_FUNCTION_CALLING !== 'false',
        audit_logging: process.env.CHATBOT_ENABLE_AUDIT_LOGGING !== 'false'
      }
    };

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 503;

    return NextResponse.json(healthData, { status: httpStatus });

  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
        services: {
          feature_flag: { status: 'unknown' },
          configuration: { status: 'unknown' },
          database: { status: 'unknown' },
          openai: { status: 'unknown' }
        }
      },
      { status: 500 }
    );
  }
}