import { describe, it, expect, beforeEach } from '@jest/globals';
import { PromptConfig, ConversationContext } from '@/types';

// Mock prompt templates
const mockSystemPrompt = {
  systemPrompt: "You are Zara, a supportive AI companion.",
  guidelines: ["Be friendly", "Be helpful"]
};

const mockTaskPrompt = {
  taskPrompt: "Help the user with organization.",
  guidelines: ["Track tasks", "Suggest categories"]
};

const mockModulePrompt = {
  modulePrompt: "When learning a language, blend practice naturally.",
  guidelines: ["Ask for translations", "Correct gently"]
};

// Mock the prompt loading function
jest.mock('@/services/prompt-service', () => ({
  loadPrompt: jest.fn((path: string) => {
    if (path.includes('system')) return mockSystemPrompt;
    if (path.includes('tasks')) return mockTaskPrompt;
    if (path.includes('languagePractice')) return mockModulePrompt;
    return {};
  })
}));

describe('PromptService', () => {
  let promptService: any;
  let mockContext: ConversationContext;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock context
    mockContext = {
      userId: 'test-user-123',
      currentTask: 'learning Spanish',
      mood: 'happy',
      energy: 'high',
      recentTopics: ['language learning'],
      activeModules: ['languagePractice']
    };
  });

  describe('buildPrompt', () => {
    it('should assemble system prompt with user message', async () => {
      const userMessage = 'Hello Zara';
      const memory = 'User is learning Spanish, beginner level';
      
      // This test will fail initially (TDD approach)
      // We'll implement the function to make it pass
      const result = await promptService.buildPrompt(userMessage, mockContext, memory);
      
      expect(result).toContain('You are Zara, a supportive AI companion');
      expect(result).toContain('Hello Zara');
      expect(result).toContain('User is learning Spanish');
    });

    it('should include task management prompt when user mentions tasks', async () => {
      const userMessage = 'I need to organize my tasks';
      const memory = 'User has multiple pending tasks';
      
      const result = await promptService.buildPrompt(userMessage, mockContext, memory);
      
      expect(result).toContain('Help the user with organization');
      expect(result).toContain('Track tasks');
    });

    it('should include module prompts for active modules', async () => {
      const userMessage = 'Teach me Spanish';
      const memory = 'User is beginner Spanish learner';
      
      const result = await promptService.buildPrompt(userMessage, mockContext, memory);
      
      expect(result).toContain('When learning a language, blend practice naturally');
      expect(result).toContain('Ask for translations');
    });

    it('should handle empty memory gracefully', async () => {
      const userMessage = 'Hello';
      const memory = '';
      
      const result = await promptService.buildPrompt(userMessage, mockContext, memory);
      
      expect(result).toContain('You are Zara, a supportive AI companion');
      expect(result).toContain('Hello');
      expect(result).not.toContain('Memory: ');
    });

    it('should respect user prompt overrides', async () => {
      const userMessage = 'Hello';
      const memory = 'User prefers formal tone';
      const overrides = {
        systemPrompt: 'You are Zara, a formal assistant.'
      };
      
      const result = await promptService.buildPrompt(userMessage, mockContext, memory, overrides);
      
      expect(result).toContain('You are Zara, a formal assistant');
      expect(result).not.toContain('You are Zara, a supportive AI companion');
    });
  });

  describe('loadPrompt', () => {
    it('should load system prompt from JSON file', () => {
      const result = promptService.loadPrompt('system.json');
      
      expect(result).toEqual(mockSystemPrompt);
      expect(result.systemPrompt).toBe('You are Zara, a supportive AI companion.');
    });

    it('should load task prompt from JSON file', () => {
      const result = promptService.loadPrompt('tasks.json');
      
      expect(result).toEqual(mockTaskPrompt);
      expect(result.taskPrompt).toBe('Help the user with organization.');
    });

    it('should load module prompt from JSON file', () => {
      const result = promptService.loadPrompt('modules/languagePractice.json');
      
      expect(result).toEqual(mockModulePrompt);
      expect(result.modulePrompt).toBe('When learning a language, blend practice naturally.');
    });

    it('should throw error for non-existent prompt file', () => {
      expect(() => {
        promptService.loadPrompt('non-existent.json');
      }).toThrow('Prompt file not found: non-existent.json');
    });
  });

  describe('mergePrompts', () => {
    it('should merge default prompts with user overrides', () => {
      const defaults = {
        systemPrompt: 'You are Zara, a helpful assistant.',
        taskPrompt: 'Help with tasks.'
      };
      
      const overrides = {
        systemPrompt: 'You are Zara, a motivational coach.'
      };
      
      const result = promptService.mergePrompts(defaults, overrides);
      
      expect(result.systemPrompt).toBe('You are Zara, a motivational coach.');
      expect(result.taskPrompt).toBe('Help with tasks.');
    });

    it('should handle empty overrides', () => {
      const defaults = {
        systemPrompt: 'You are Zara, a helpful assistant.',
        taskPrompt: 'Help with tasks.'
      };
      
      const overrides = {};
      
      const result = promptService.mergePrompts(defaults, overrides);
      
      expect(result).toEqual(defaults);
    });

    it('should handle nested module prompts', () => {
      const defaults = {
        systemPrompt: 'You are Zara.',
        modulePrompts: {
          languagePractice: 'Practice language naturally.',
          wellbeing: 'Check on user wellbeing.'
        }
      };
      
      const overrides = {
        modulePrompts: {
          languagePractice: 'Practice Spanish specifically.'
        }
      };
      
      const result = promptService.mergePrompts(defaults, overrides);
      
      expect(result.modulePrompts.languagePractice).toBe('Practice Spanish specifically.');
      expect(result.modulePrompts.wellbeing).toBe('Check on user wellbeing.');
    });
  });
});
