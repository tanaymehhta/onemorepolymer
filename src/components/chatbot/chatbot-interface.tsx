'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  responseTime?: number;
}

export function ChatbotInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize conversation
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(sessionId);

    // Add welcome message
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Polymer Trading Intelligence ready. Ask about customers, suppliers, deals, or financials.',
      timestamp: new Date()
    }]);
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          conversationId,
          userSession: conversationId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      // Update conversation ID if it was returned from the server
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        responseTime: data.responseTime
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);

      const errorResponse: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(sessionId);
    setMessages([{
      id: 'welcome_new',
      role: 'assistant',
      content: 'Polymer Trading Intelligence ready. Ask about customers, suppliers, deals, or financials.',
      timestamp: new Date()
    }]);
    setError('');
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Polymer Trading Intelligence
            </h1>
            <p className="text-sm text-gray-600">
              Ask about customers, suppliers, products, deals, or financial data
            </p>
          </div>
          <button
            onClick={clearConversation}
            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            New Chat
          </button>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}