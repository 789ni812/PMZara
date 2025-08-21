import { TaskManager } from '@/components/TaskManager';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Task Management
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Organize your tasks with Zara's help
          </p>
          
          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Back to Chat
              </Button>
            </Link>
          </div>
        </div>

        {/* Task Manager */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <TaskManager />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>
            Tasks are stored locally and synced with your Zara conversations
          </p>
        </div>
      </div>
    </div>
  );
}
