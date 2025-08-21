import { 
  ConversationContext, 
  ChatMessage, 
  PromptOverride,
  LLMResponse 
} from '@/types';
import { PromptService } from './prompt-service';
import { LLMService } from './llm-service';
import { MemoryService } from './memory-service';

/**
 * Main service responsible for orchestrating conversations with Zara.
 * Combines prompt assembly, LLM communication, and memory management.
 */
export class ChatService {
  private promptService: PromptService;
  private llmService: LLMService;
  private memoryService: MemoryService;

  constructor(
    promptService: PromptService,
    llmService: LLMService,
    memoryService: MemoryService
  ) {
    this.promptService = promptService;
    this.llmService = llmService;
    this.memoryService = memoryService;
  }

  /**
   * Processes a user message and generates Zara's response
   * @param userId - User ID
   * @param userMessage - User's input message
   * @param overrides - Optional prompt overrides
   * @returns Zara's response with metadata
   */
  async processMessage(
    userId: string,
    userMessage: string,
    overrides?: PromptOverride
  ): Promise<{
    response: string;
    context: ConversationContext;
    metadata: {
      promptLength: number;
      responseTime: number;
      tokensUsed?: number;
      debugView?: string;
    };
  }> {
    const startTime = Date.now();

    try {
      // 1. Get or create conversation context
      const context = await this.memoryService.getConversationContext(userId);

      // 2. Get relevant memories
      const memories = await this.memoryService.getRelevantMemories(userId, context);
      const memoryContext = this.formatMemoriesForPrompt(memories);

      // 3. Assemble the prompt
      const prompt = await this.promptService.buildPrompt(
        userMessage,
        context,
        memoryContext,
        overrides
      );

      // 4. Generate LLM response
      const llmResponse = await this.llmService.generateResponse(prompt);

      // 5. Update conversation context
      const updatedContext = await this.updateContextFromMessage(
        userId,
        context,
        userMessage,
        llmResponse.content
      );

      // 6. Store the conversation
      await this.memoryService.storeConversation(userId, userMessage, {
        type: 'user',
        timestamp: new Date()
      });

      await this.memoryService.storeConversation(userId, llmResponse.content, {
        type: 'zara',
        timestamp: new Date(),
        promptLength: prompt.length,
        tokensUsed: llmResponse.usage?.totalTokens
      });

      // 7. Store updated context
      await this.memoryService.storeConversationContext(userId, updatedContext);

      const responseTime = Date.now() - startTime;

      return {
        response: llmResponse.content,
        context: updatedContext,
        metadata: {
          promptLength: prompt.length,
          responseTime,
          tokensUsed: llmResponse.usage?.totalTokens
        }
      };
    } catch (error) {
      // Return a fallback response if something goes wrong
      console.error('Error processing message:', error);
      
      return {
        response: "I'm sorry, I'm having trouble processing that right now. Could you try again?",
        context: { userId },
        metadata: {
          promptLength: 0,
          responseTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * Gets debug view of the assembled prompt (for advanced users)
   * @param userId - User ID
   * @param userMessage - User's input message
   * @param overrides - Optional prompt overrides
   * @returns Debug view of the prompt
   */
  async getDebugView(
    userId: string,
    userMessage: string,
    overrides?: PromptOverride
  ): Promise<string> {
    try {
      const context = await this.memoryService.getConversationContext(userId);
      const memories = await this.memoryService.getRelevantMemories(userId, context);
      const memoryContext = this.formatMemoriesForPrompt(memories);

      return await this.promptService.getDebugView(
        userMessage,
        context,
        memoryContext,
        overrides
      );
    } catch (error) {
      return `Error generating debug view: ${error}`;
    }
  }

  /**
   * Formats memories for inclusion in the prompt
   * @param memories - Array of memory entries
   * @returns Formatted memory string
   */
  private formatMemoriesForPrompt(memories: any[]): string {
    if (memories.length === 0) {
      return '';
    }

    const memoryStrings = memories.map(memory => {
      const timestamp = new Date(memory.updatedAt).toLocaleDateString();
      return `${memory.key}: ${memory.value} (${timestamp})`;
    });

    return memoryStrings.join('; ');
  }

  /**
   * Updates conversation context based on the message exchange
   * @param userId - User ID
   * @param context - Current context
   * @param userMessage - User's message
   * @param zaraResponse - Zara's response
   * @returns Updated context
   */
  private async updateContextFromMessage(
    userId: string,
    context: ConversationContext,
    userMessage: string,
    zaraResponse: string
  ): Promise<ConversationContext> {
    const updatedContext = { ...context };

    // Extract potential task mentions
    const taskKeywords = ['task', 'todo', 'remind', 'deadline', 'due', 'finish', 'complete'];
    const hasTaskMention = taskKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (hasTaskMention && !context.currentTask) {
      // Try to extract task from message
      const taskMatch = userMessage.match(/(?:task|todo|remind me to|need to)\s+(.+?)(?:\s|$)/i);
      if (taskMatch) {
        updatedContext.currentTask = taskMatch[1].trim();
      }
    }

    // Extract potential mood indicators
    const moodKeywords = {
      happy: ['happy', 'great', 'excellent', 'wonderful', 'excited'],
      stressed: ['stressed', 'worried', 'anxious', 'overwhelmed', 'tired'],
      neutral: ['okay', 'fine', 'alright', 'normal']
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
        updatedContext.mood = mood as any;
        break;
      }
    }

    // Extract potential energy levels
    const energyKeywords = {
      high: ['energetic', 'motivated', 'ready', 'excited'],
      low: ['tired', 'exhausted', 'drained', 'unmotivated'],
      medium: ['okay', 'fine', 'normal']
    };

    for (const [energy, keywords] of Object.entries(energyKeywords)) {
      if (keywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
        updatedContext.energy = energy as any;
        break;
      }
    }

    // Update recent topics
    const topics = this.extractTopics(userMessage);
    if (topics.length > 0) {
      updatedContext.recentTopics = [
        ...(context.recentTopics || []),
        ...topics
      ].slice(-5); // Keep last 5 topics
    }

    // Detect module activation
    const moduleKeywords = {
      languagePractice: ['spanish', 'french', 'language', 'translate', 'practice'],
      wellbeing: ['mood', 'feeling', 'energy', 'stress', 'tired'],
      coding: ['code', 'programming', 'debug', 'function', 'algorithm']
    };

    const detectedModules: string[] = [];
    for (const [module, keywords] of Object.entries(moduleKeywords)) {
      if (keywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword) || 
        zaraResponse.toLowerCase().includes(keyword)
      )) {
        detectedModules.push(module);
      }
    }

    if (detectedModules.length > 0) {
      updatedContext.activeModules = [
        ...(context.activeModules || []),
        ...detectedModules
      ].filter((module, index, array) => array.indexOf(module) === index); // Remove duplicates
    }

    return updatedContext;
  }

  /**
   * Extracts potential topics from a message
   * @param message - The message to analyze
   * @returns Array of potential topics
   */
  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    
    // Simple topic extraction based on common patterns
    const topicPatterns = [
      /(?:talking about|discussing|learning)\s+(\w+)/i,
      /(\w+)\s+(?:is|are)\s+(?:important|interesting|difficult)/i,
      /(?:working on|studying|practicing)\s+(\w+)/i
    ];

    for (const pattern of topicPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        topics.push(match[1].toLowerCase());
      }
    }

    return topics;
  }

  /**
   * Gets conversation history for a user
   * @param userId - User ID
   * @param limit - Maximum number of messages to retrieve
   * @returns Conversation history
   */
  async getConversationHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const conversations = await this.memoryService.getRecentConversations(userId, limit);
      
      return conversations.map(conv => ({
        id: conv.id,
        content: conv.content,
        sender: conv.metadata?.type === 'zara' ? 'zara' : 'user',
        timestamp: new Date(conv.timestamp),
        metadata: conv.metadata
      }));
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Checks if the chat service is ready (all dependencies available)
   * @returns Service status
   */
  async isReady(): Promise<{
    ready: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check LLM service
    const llmAvailable = await this.llmService.isAvailable();
    if (!llmAvailable) {
      issues.push('LLM service is not available');
    }

    // Check if prompt files exist
    try {
      const availablePrompts = this.promptService.listAvailablePrompts();
      if (availablePrompts.length === 0) {
        issues.push('No prompt templates found');
      }
    } catch (error) {
      issues.push('Failed to load prompt templates');
    }

    return {
      ready: issues.length === 0,
      issues
    };
  }

  /**
   * Resets conversation context for a user
   * @param userId - User ID
   * @returns True if reset successfully
   */
  async resetConversation(userId: string): Promise<boolean> {
    try {
      // Clear conversation-related memories
      const memories = await this.memoryService.getRelevantMemories(userId, { userId });
      const conversationMemories = memories.filter(m => m.type === 'conversation');
      
      for (const memory of conversationMemories) {
        await this.memoryService.deleteMemory(memory.id);
      }

      return true;
    } catch (error) {
      console.error('Error resetting conversation:', error);
      return false;
    }
  }
}

// Export a factory function to create the service with all dependencies
export function createChatService(
  promptService: PromptService,
  llmService: LLMService,
  memoryService: MemoryService
): ChatService {
  return new ChatService(promptService, llmService, memoryService);
}
