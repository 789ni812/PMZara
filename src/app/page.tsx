import { ChatInterface } from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // For now, we'll use a simple user ID. In a real app, this would come from authentication
  const userId = 'demo-user-123';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome to Zara
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Your AI companion for organization and conversation
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="default" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat with Zara
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Manage Tasks
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <ChatInterface userId={userId} />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>
            Built with Next.js, TypeScript, and local AI models
          </p>
          <p className="mt-1">
            Make sure your local LLM (LM Studio or Ollama) is running
          </p>
        </div>
      </div>
    </div>
  );
}
