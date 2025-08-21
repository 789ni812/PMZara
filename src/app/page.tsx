import { ChatInterface } from '@/components/ChatInterface';

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
          <p className="text-lg text-slate-600">
            Your AI companion for organization and conversation
          </p>
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
