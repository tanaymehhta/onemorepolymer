import { NextRequest, NextResponse } from 'next/server';
import { ChatbotRepository } from '@/lib/repositories/chatbot.repository';

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = searchParams.get('limit');

    if (!conversationId) {
      return NextResponse.json(
        {
          error: 'conversationId parameter is required',
          code: 'MISSING_CONVERSATION_ID'
        },
        { status: 400 }
      );
    }

    // Validate conversationId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      return NextResponse.json(
        {
          error: 'Invalid conversationId format',
          code: 'INVALID_CONVERSATION_ID'
        },
        { status: 400 }
      );
    }

    const repository = new ChatbotRepository();
    const limitNum = limit ? parseInt(limit) : 50;

    const history = await repository.getConversationHistory(conversationId, limitNum);

    return NextResponse.json({
      conversationId,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('History API error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          code: 'HISTORY_FETCH_ERROR'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch conversation history',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        {
          error: 'conversationId parameter is required',
          code: 'MISSING_CONVERSATION_ID'
        },
        { status: 400 }
      );
    }

    const repository = new ChatbotRepository();
    await repository.deleteConversation(conversationId);

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to delete conversation',
        code: 'DELETE_ERROR'
      },
      { status: 500 }
    );
  }
}