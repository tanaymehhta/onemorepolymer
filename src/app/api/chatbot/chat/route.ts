import { NextRequest, NextResponse } from 'next/server';
import { ChatbotService } from '@/lib/services/chatbot.service';
import { validateMessage } from '@/lib/schemas/chatbot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, userSession } = validateMessage(body);

    // Feature flag check
    if (process.env.FEATURE_CHATBOT !== 'true') {
      return NextResponse.json(
        {
          error: 'Chatbot feature is currently disabled',
          code: 'FEATURE_DISABLED'
        },
        { status: 503 }
      );
    }

    // Initialize chatbot service
    const chatbotService = new ChatbotService();

    // Process the message
    const result = await chatbotService.processMessage(
      message,
      conversationId,
      userSession
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.message
        },
        { status: 400 }
      );
    }

    // Handle chatbot service errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'CHATBOT_ERROR'
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Failed to process message',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed. Use POST to send messages.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { status: 405 }
  );
}