import fs from 'fs';
import path from 'path';
import { 
  PromptConfig, 
  ConversationContext, 
  PromptOverride,
  PromptAssemblyError 
} from '@/types';

/**
 * Service responsible for loading, assembling, and managing prompts for Zara.
 * Handles the layered prompt system: System + Task + Module + Memory + User
 */
export class PromptService {
  private readonly promptsDir: string;

  constructor(promptsDir: string = 'prompts') {
    this.promptsDir = promptsDir;
  }

  /**
   * Loads a prompt template from JSON file
   * @param filePath - Path to the prompt file (e.g., 'system.json', 'modules/languagePractice.json')
   * @returns Parsed prompt template
   */
  loadPrompt(filePath: string): Record<string, any> {
    try {
      const fullPath = path.join(process.cwd(), this.promptsDir, filePath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Prompt file not found: ${filePath}`);
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw error;
      }
      throw new PromptAssemblyError(`Failed to load prompt from ${filePath}`, error as Error);
    }
  }

  /**
   * Merges default prompts with user overrides
   * @param defaults - Default prompt configuration
   * @param overrides - User-provided overrides
   * @returns Merged prompt configuration
   */
  mergePrompts(defaults: Record<string, any>, overrides: PromptOverride): Record<string, any> {
    const merged = { ...defaults };

    // Merge system prompt
    if (overrides.systemPrompt) {
      merged.systemPrompt = overrides.systemPrompt;
    }

    // Merge task prompt
    if (overrides.taskPrompt) {
      merged.taskPrompt = overrides.taskPrompt;
    }

    // Merge module prompts
    if (overrides.modulePrompts) {
      merged.modulePrompts = {
        ...merged.modulePrompts,
        ...overrides.modulePrompts
      };
    }

    // Merge style overrides
    if (overrides.style) {
      merged.style = {
        ...merged.style,
        ...overrides.style
      };
    }

    return merged;
  }

  /**
   * Builds a complete prompt for the LLM by assembling all layers
   * @param userMessage - The user's input message
   * @param context - Current conversation context
   * @param memory - Relevant memory from previous conversations
   * @param overrides - Optional user prompt overrides
   * @returns Assembled prompt ready for LLM
   */
  async buildPrompt(
    userMessage: string,
    context: ConversationContext,
    memory: string = '',
    overrides?: PromptOverride
  ): Promise<string> {
    try {
      // Load default prompts
      const systemPrompt = this.loadPrompt('system.json');
      const taskPrompt = this.loadPrompt('tasks.json');

      // Load module prompts for active modules
      const modulePrompts: Record<string, string> = {};
      if (context.activeModules) {
        for (const moduleName of context.activeModules) {
          try {
            const modulePrompt = this.loadPrompt(`modules/${moduleName}.json`);
            if (modulePrompt.modulePrompt) {
              modulePrompts[moduleName] = modulePrompt.modulePrompt;
            }
          } catch (error) {
            // Skip modules that don't have prompt files
            console.warn(`Module prompt not found for ${moduleName}`);
          }
        }
      }

      // Create default config
      const defaultConfig = {
        systemPrompt: systemPrompt.systemPrompt,
        taskPrompt: taskPrompt.taskPrompt,
        modulePrompts
      };

      // Apply user overrides if provided
      const finalConfig = overrides 
        ? this.mergePrompts(defaultConfig, overrides)
        : defaultConfig;

      // Assemble the prompt
      const promptParts: string[] = [];

      // System prompt (Zara's core personality)
      promptParts.push(`[System] ${finalConfig.systemPrompt}`);

      // Task management prompt
      promptParts.push(`[System] ${finalConfig.taskPrompt}`);

      // Module prompts
      Object.entries(finalConfig.modulePrompts || {}).forEach(([moduleName, prompt]) => {
        promptParts.push(`[System] Module: ${moduleName} → ${prompt}`);
      });

      // Memory context (if available)
      if (memory.trim()) {
        promptParts.push(`[System] Memory: ${memory}`);
      }

      // User message
      promptParts.push(`[User] ${userMessage}`);

      return promptParts.join('\n\n');
    } catch (error) {
      throw new PromptAssemblyError('Failed to build prompt', error as Error);
    }
  }

  /**
   * Gets the debug view of an assembled prompt (for advanced users)
   * @param userMessage - The user's input message
   * @param context - Current conversation context
   * @param memory - Relevant memory from previous conversations
   * @param overrides - Optional user prompt overrides
   * @returns Debug view showing how the prompt was assembled
   */
  async getDebugView(
    userMessage: string,
    context: ConversationContext,
    memory: string = '',
    overrides?: PromptOverride
  ): Promise<string> {
    const assembledPrompt = await this.buildPrompt(userMessage, context, memory, overrides);
    
    return `🔧 Zara's Assembled Prompt\n\n${assembledPrompt}`;
  }

  /**
   * Validates a prompt template for safety and completeness
   * @param template - Prompt template to validate
   * @returns Validation result
   */
  validatePromptTemplate(template: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required fields
    if (!template.systemPrompt && !template.taskPrompt && !template.modulePrompt) {
      errors.push('Template must contain at least one prompt field');
    }

    // Check for potentially harmful content
    const content = JSON.stringify(template).toLowerCase();
    const harmfulPatterns = [
      'ignore previous',
      'ignore all previous',
      'system prompt',
      'you are now',
      'forget everything'
    ];

    for (const pattern of harmfulPatterns) {
      if (content.includes(pattern)) {
        errors.push(`Template contains potentially harmful pattern: ${pattern}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Lists all available prompt templates
   * @returns Array of available prompt file paths
   */
  listAvailablePrompts(): string[] {
    const prompts: string[] = [];
    
    try {
      const fullPromptsDir = path.join(process.cwd(), this.promptsDir);
      
      if (!fs.existsSync(fullPromptsDir)) {
        return prompts;
      }

      // Add system and task prompts
      if (fs.existsSync(path.join(fullPromptsDir, 'system.json'))) {
        prompts.push('system.json');
      }
      if (fs.existsSync(path.join(fullPromptsDir, 'tasks.json'))) {
        prompts.push('tasks.json');
      }

      // Add module prompts
      const modulesDir = path.join(fullPromptsDir, 'modules');
      if (fs.existsSync(modulesDir)) {
        const moduleFiles = fs.readdirSync(modulesDir);
        moduleFiles.forEach(file => {
          if (file.endsWith('.json')) {
            prompts.push(`modules/${file}`);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to list available prompts:', error);
    }

    return prompts;
  }
}

// Export a singleton instance for common use
export const promptService = new PromptService();
