import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about customers, deals, products, or financials..."
          disabled={disabled}
          className="min-h-[60px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          rows={2}
        />
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{message.length}/1000</span>
        </div>
      </div>
      <Button
        onClick={handleSubmit}
        disabled={disabled || !message.trim() || message.length > 1000}
        size="default"
        className="h-[60px] px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}