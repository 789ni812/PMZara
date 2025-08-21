'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, Settings, Eye, EyeOff } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface ChatInterfaceProps {
  userId: string;
  className?: string;
}

export function ChatInterface({ userId, className = '' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugView, setDebugView] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: inputValue,
          debug: showDebug,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
        metadata: data.data.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (showDebug && data.data.debugView) {
        setDebugView(data.data.debugView);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetConversation = async () => {
    try {
      const response = await fetch(`/api/chat?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessages([]);
        setDebugView(null);
        setError(null);
      } else {
        setError('Failed to reset conversation');
      }
    } catch (err) {
      setError('Failed to reset conversation');
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              Z
            </div>
            Zara AI Companion
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-1"
            >
              {showDebug ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Debug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetConversation}
              className="flex items-center gap-1"
            >
              <Settings className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollAreaRef} className="h-[400px] px-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Start a conversation with Zara!</p>
                <p className="text-sm">She's here to help you organize and chat.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.metadata && (
                    <div className="mt-2 space-y-1">
                      {message.metadata.activeModules && message.metadata.activeModules.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {message.metadata.activeModules.map((module: string) => (
                            <Badge key={module} variant="secondary" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {message.metadata.currentTask && (
                        <p className="text-xs text-muted-foreground">
                          Current task: {message.metadata.currentTask}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Zara is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Debug View */}
      {showDebug && debugView && (
        <>
          <Separator />
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Debug View</h3>
            <div className="bg-muted rounded-lg p-3 text-xs font-mono overflow-auto max-h-40">
              <pre>{JSON.stringify(debugView, null, 2)}</pre>
            </div>
          </CardContent>
        </>
      )}

      {/* Error Display */}
      {error && (
        <>
          <Separator />
          <CardContent className="p-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          </CardContent>
        </>
      )}

      {/* Input */}
      <CardContent className="pt-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
