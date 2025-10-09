import { formatDistanceToNow } from 'date-fns';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    responseTime?: number;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-600'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${
        isUser ? 'items-end' : 'items-start'
      }`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {/* Timestamp and metadata */}
        <div className={`text-xs mt-1 px-1 ${
          isUser ? 'text-gray-500 text-right' : 'text-gray-500 text-left'
        }`}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          {message.responseTime && (
            <span className="ml-2 text-gray-400">
              • {message.responseTime}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
}