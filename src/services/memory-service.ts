import { PrismaClient } from '@prisma/client';
import { Memory, ConversationContext, MemoryServiceError } from '@/types';

/**
 * Service responsible for managing Zara's memory - conversation history,
 * user preferences, and long-term context storage.
 */
export class MemoryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Stores a memory entry for a user
   * @param userId - User ID
   * @param key - Memory key
   * @param value - Memory value
   * @param type - Memory type (e.g., 'conversation', 'preference', 'task')
   * @param expiresAt - Optional expiration date
   * @returns Created memory entry
   */
  async storeMemory(
    userId: string,
    key: string,
    value: string,
    type: string = 'general',
    expiresAt?: Date
  ): Promise<Memory> {
    try {
      // Check if memory already exists
      const existingMemory = await this.prisma.memory.findFirst({
        where: {
          userId,
          key,
          type
        }
      });

      if (existingMemory) {
        // Update existing memory
        return await this.prisma.memory.update({
          where: { id: existingMemory.id },
          data: {
            value,
            expiresAt,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new memory
        return await this.prisma.memory.create({
          data: {
            userId,
            key,
            value,
            type,
            expiresAt
          }
        });
      }
    } catch (error) {
      throw new MemoryServiceError('Failed to store memory', error as Error);
    }
  }

  /**
   * Retrieves a specific memory entry
   * @param userId - User ID
   * @param key - Memory key
   * @param type - Memory type (optional)
   * @returns Memory entry or null if not found
   */
  async getMemory(userId: string, key: string, type?: string): Promise<Memory | null> {
    try {
      const where: any = { userId, key };
      if (type) {
        where.type = type;
      }

      const memory = await this.prisma.memory.findFirst({
        where,
        orderBy: { updatedAt: 'desc' }
      });

      // Check if memory has expired
      if (memory && memory.expiresAt && memory.expiresAt < new Date()) {
        await this.deleteMemory(memory.id);
        return null;
      }

      return memory;
    } catch (error) {
      throw new MemoryServiceError('Failed to retrieve memory', error as Error);
    }
  }

  /**
   * Retrieves relevant memories for a conversation context
   * @param userId - User ID
   * @param context - Current conversation context
   * @param limit - Maximum number of memories to retrieve
   * @returns Relevant memory entries
   */
  async getRelevantMemories(
    userId: string,
    context: ConversationContext,
    limit: number = 10
  ): Promise<Memory[]> {
    try {
      // Get recent memories
      const recentMemories = await this.prisma.memory.findMany({
        where: {
          userId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        orderBy: { updatedAt: 'desc' },
        take: limit
      });

      // Filter and prioritize memories based on context
      const relevantMemories = recentMemories.filter(memory => {
        // Check if memory is related to current task
        if (context.currentTask && 
            (memory.key.includes('task') || memory.value.toLowerCase().includes(context.currentTask.toLowerCase()))) {
          return true;
        }

        // Check if memory is related to active modules
        if (context.activeModules && context.activeModules.length > 0) {
          return context.activeModules.some(module => 
            memory.key.includes(module) || memory.value.toLowerCase().includes(module.toLowerCase())
          );
        }

        // Check if memory is related to recent topics
        if (context.recentTopics && context.recentTopics.length > 0) {
          return context.recentTopics.some(topic => 
            memory.value.toLowerCase().includes(topic.toLowerCase())
          );
        }

        // Include general memories if no specific context matches
        return memory.type === 'general' || memory.type === 'conversation';
      });

      return relevantMemories.slice(0, limit);
    } catch (error) {
      throw new MemoryServiceError('Failed to retrieve relevant memories', error as Error);
    }
  }

  /**
   * Stores conversation context
   * @param userId - User ID
   * @param context - Conversation context
   * @returns Stored context
   */
  async storeConversationContext(userId: string, context: ConversationContext): Promise<void> {
    try {
      // Store current task if present
      if (context.currentTask) {
        await this.storeMemory(userId, 'current_task', context.currentTask, 'conversation');
      }

      // Store mood if present
      if (context.mood) {
        await this.storeMemory(userId, 'current_mood', context.mood, 'conversation');
      }

      // Store energy level if present
      if (context.energy) {
        await this.storeMemory(userId, 'current_energy', context.energy, 'conversation');
      }

      // Store recent topics
      if (context.recentTopics && context.recentTopics.length > 0) {
        await this.storeMemory(
          userId, 
          'recent_topics', 
          JSON.stringify(context.recentTopics), 
          'conversation'
        );
      }

      // Store active modules
      if (context.activeModules && context.activeModules.length > 0) {
        await this.storeMemory(
          userId, 
          'active_modules', 
          JSON.stringify(context.activeModules), 
          'conversation'
        );
      }
    } catch (error) {
      throw new MemoryServiceError('Failed to store conversation context', error as Error);
    }
  }

  /**
   * Retrieves conversation context for a user
   * @param userId - User ID
   * @returns Conversation context
   */
  async getConversationContext(userId: string): Promise<ConversationContext> {
    try {
      const context: ConversationContext = { userId };

      // Get current task
      const currentTask = await this.getMemory(userId, 'current_task', 'conversation');
      if (currentTask) {
        context.currentTask = currentTask.value;
      }

      // Get current mood
      const currentMood = await this.getMemory(userId, 'current_mood', 'conversation');
      if (currentMood) {
        context.mood = currentMood.value as any;
      }

      // Get current energy
      const currentEnergy = await this.getMemory(userId, 'current_energy', 'conversation');
      if (currentEnergy) {
        context.energy = currentEnergy.value as any;
      }

      // Get recent topics
      const recentTopics = await this.getMemory(userId, 'recent_topics', 'conversation');
      if (recentTopics) {
        try {
          context.recentTopics = JSON.parse(recentTopics.value);
        } catch (error) {
          console.warn('Failed to parse recent topics:', error);
        }
      }

      // Get active modules
      const activeModules = await this.getMemory(userId, 'active_modules', 'conversation');
      if (activeModules) {
        try {
          context.activeModules = JSON.parse(activeModules.value);
        } catch (error) {
          console.warn('Failed to parse active modules:', error);
        }
      }

      return context;
    } catch (error) {
      throw new MemoryServiceError('Failed to retrieve conversation context', error as Error);
    }
  }

  /**
   * Stores a conversation message
   * @param userId - User ID
   * @param content - Message content
   * @param metadata - Optional metadata
   * @returns Stored conversation
   */
  async storeConversation(
    userId: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.prisma.conversation.create({
        data: {
          userId,
          content,
          metadata: metadata ? JSON.stringify(metadata) : null
        }
      });
    } catch (error) {
      throw new MemoryServiceError('Failed to store conversation', error as Error);
    }
  }

  /**
   * Retrieves recent conversations for a user
   * @param userId - User ID
   * @param limit - Maximum number of conversations to retrieve
   * @returns Recent conversations
   */
  async getRecentConversations(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      // Parse JSON metadata
      return conversations.map(conv => ({
        ...conv,
        metadata: conv.metadata ? JSON.parse(conv.metadata) : null
      }));
    } catch (error) {
      throw new MemoryServiceError('Failed to retrieve recent conversations', error as Error);
    }
  }

  /**
   * Deletes a memory entry
   * @param memoryId - Memory ID
   * @returns True if deleted successfully
   */
  async deleteMemory(memoryId: string): Promise<boolean> {
    try {
      await this.prisma.memory.delete({
        where: { id: memoryId }
      });
      return true;
    } catch (error) {
      throw new MemoryServiceError('Failed to delete memory', error as Error);
    }
  }

  /**
   * Cleans up expired memories
   * @returns Number of memories cleaned up
   */
  async cleanupExpiredMemories(): Promise<number> {
    try {
      const result = await this.prisma.memory.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
      return result.count;
    } catch (error) {
      throw new MemoryServiceError('Failed to cleanup expired memories', error as Error);
    }
  }

  /**
   * Gets memory statistics for a user
   * @param userId - User ID
   * @returns Memory statistics
   */
  async getMemoryStats(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    recentActivity: number;
  }> {
    try {
      const total = await this.prisma.memory.count({
        where: { userId }
      });

      const byType = await this.prisma.memory.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true }
      });

      const recentActivity = await this.prisma.memory.count({
        where: {
          userId,
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      const typeStats: Record<string, number> = {};
      byType.forEach(group => {
        typeStats[group.type] = group._count.type;
      });

      return {
        total,
        byType: typeStats,
        recentActivity
      };
    } catch (error) {
      throw new MemoryServiceError('Failed to get memory statistics', error as Error);
    }
  }
}

// Export a factory function to create the service with Prisma
export function createMemoryService(prisma: PrismaClient): MemoryService {
  return new MemoryService(prisma);
}
