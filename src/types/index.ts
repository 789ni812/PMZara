// Core Types for Zara AI Companion

export interface User {
  id: string;
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  defaultLanguage: string;
  theme: 'light' | 'dark';
  timezone: string;
  notificationSettings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Memory {
  id: string;
  userId: string;
  key: string;
  value: string;
  type: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  userId: string;
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  userId: string;
  name: string;
  template: Record<string, any>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// LLM Configuration Types
export interface LLMConfig {
  provider: 'lmstudio' | 'ollama';
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

// Prompt System Types
export interface PromptConfig {
  systemPrompt: string;
  taskPrompt: string;
  modulePrompts: Record<string, string>;
  memoryContext: string;
}

export interface PromptOverride {
  systemPrompt?: string;
  taskPrompt?: string;
  modulePrompts?: Record<string, string>;
  style?: {
    tone: 'formal' | 'casual' | 'encouraging' | 'strict';
    humour: 'none' | 'light' | 'moderate';
    formality: 'very_formal' | 'formal' | 'casual' | 'very_casual';
  };
}

// Conversation Context Types
export interface ConversationContext {
  userId: string;
  currentTask?: string;
  mood?: 'happy' | 'stressed' | 'neutral' | 'excited' | 'tired';
  energy?: 'high' | 'medium' | 'low';
  recentTopics?: string[];
  activeModules?: string[];
}

// Module System Types
export interface ConversationModule {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  
  shouldActivate(context: ConversationContext): boolean;
  generatePrompt(context: ConversationContext): string;
  processResponse(response: string): ModuleResponse;
}

export interface ModuleResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Chat Interface Types
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'zara';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error Types
export class PromptAssemblyError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'PromptAssemblyError';
  }
}

export class LLMServiceError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'LLMServiceError';
  }
}

export class MemoryServiceError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'MemoryServiceError';
  }
}

// UI Component Types
export interface ChatMessageProps {
  message: ChatMessage;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
}

export interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export interface ModuleConfigProps {
  module: Module;
  onUpdate: (id: string, config: Record<string, any>) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

// Form Types
export interface CreateTaskForm {
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateUserForm {
  name?: string;
  email?: string;
  preferences?: Partial<UserPreferences>;
}

// Utility Types
export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
export type TaskCategory = string;

export type LLMProvider = LLMConfig['provider'];
export type UserTheme = UserPreferences['theme'];
export type UserMood = ConversationContext['mood'];
export type UserEnergy = ConversationContext['energy'];
