import { ChatbotInterface } from '@/components/chatbot/chatbot-interface';

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ChatbotInterface />
    </div>
  );
}

export const metadata = {
  title: 'Chatbot - Polymer Trading Intelligence',
  description: 'AI-powered business intelligence assistant for polymer trading operations',
};