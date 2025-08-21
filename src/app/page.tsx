'use client';

import { ChatInterface } from '@/components/ChatInterface';
import { TaskManager } from '@/components/TaskManager';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  // For now, we'll use a simple user ID. In a real app, this would come from authentication
  const userId = 'demo-user-123';
  
  // State to control which sections are visible
  const [showChat, setShowChat] = useState(true);
  const [showTasks, setShowTasks] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            PMZara v0.1
          </h1>
          
          
          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Button 
              variant={showChat ? "default" : "outline"} 
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
            <Button 
              variant={showTasks ? "default" : "outline"} 
              onClick={() => setShowTasks(!showTasks)}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Manage Tasks
            </Button>
          </div>
        </div>

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Section */}
          {showChat && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <ChatInterface userId={userId} />
            </div>
          )}

          {/* Tasks Section */}
          {showTasks && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <TaskManager userId={userId} />
            </div>
          )}
        </div>

        {/* Show message when both sections are hidden */}
        {!showChat && !showTasks && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a section to get started
              </h3>
              <p className="text-gray-600 mb-4">
                Choose whether you'd like to chat with Zara or manage your tasks.
              </p>
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => setShowChat(true)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat with Zara
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowTasks(true)}
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Manage Tasks
                </Button>
              </div>
            </div>
          </div>
        )}

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
