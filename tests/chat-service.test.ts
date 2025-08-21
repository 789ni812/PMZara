import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { PromptService } from '../src/services/prompt-service';
import { LLMService } from '../src/services/llm-service';
import { MemoryService } from '../src/services/memory-service';
import { ChatService } from '../src/services/chat-service';

// Mock Prisma
jest.mock('@prisma/client');

// Mock file system
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('ChatService Integration', () => {
  let chatService: ChatService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock Prisma
    mockPrisma = {
      conversation: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      memory: {
        create: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    } as any;

    // Create services
    const promptService = new PromptService();
    const llmService = new LLMService();
    const memoryService = new MemoryService(mockPrisma);
    
    chatService = new ChatService(promptService, llmService, memoryService);
  });

  describe('processMessage', () => {
    it('should process a simple message successfully', async () => {
      // Mock LLM response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello! How can I help you today?' } }]
        })
      });

      // Mock memory operations
      mockPrisma.memory.findMany.mockResolvedValue([]);
      mockPrisma.memory.create.mockResolvedValue({} as any);
      mockPrisma.conversation.create.mockResolvedValue({} as any);

      const result = await chatService.processMessage('test-user', 'Hello Zara');

      expect(result).toBeDefined();
      expect(result.response).toContain('Hello');
      expect(result.context).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Mock LLM failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('LLM service unavailable'));

      await expect(
        chatService.processMessage('test-user', 'Hello')
      ).rejects.toThrow('LLM service unavailable');
    });
  });

  describe('getConversationHistory', () => {
    it('should return conversation history', async () => {
      const mockHistory = [
        { id: '1', userId: 'test-user', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', userId: 'test-user', role: 'assistant', content: 'Hi there!', timestamp: new Date() }
      ];

      mockPrisma.conversation.findMany.mockResolvedValue(mockHistory as any);

      const history = await chatService.getConversationHistory('test-user', 10);

      expect(history).toHaveLength(2);
      expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user' },
        orderBy: { timestamp: 'desc' },
        take: 10
      });
    });
  });

  describe('resetConversation', () => {
    it('should reset conversation for a user', async () => {
      mockPrisma.conversation.deleteMany.mockResolvedValue({ count: 5 } as any);
      mockPrisma.memory.deleteMany.mockResolvedValue({ count: 3 } as any);

      const result = await chatService.resetConversation('test-user');

      expect(result).toBe(true);
      expect(mockPrisma.conversation.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'test-user' }
      });
      expect(mockPrisma.memory.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'test-user' }
      });
    });
  });

  describe('isReady', () => {
    it('should check if all services are ready', async () => {
      // Mock LLM service check
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: ['test-model'] })
      });

      const status = await chatService.isReady();

      expect(status.ready).toBe(true);
      expect(status.issues).toHaveLength(0);
    });

    it('should report issues when services are not ready', async () => {
      // Mock LLM service failure
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Service unavailable'));

      const status = await chatService.isReady();

      expect(status.ready).toBe(false);
      expect(status.issues.length).toBeGreaterThan(0);
    });
  });
});
