import { LLMConfig, LLMResponse, LLMServiceError } from '@/types';

/**
 * Service responsible for communicating with local LLM providers (LM Studio or Ollama).
 * Abstracts the differences between providers and provides a unified interface.
 */
export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Sends a prompt to the LLM and returns the response
   * @param prompt - The assembled prompt to send
   * @returns LLM response with content and metadata
   */
  async generateResponse(prompt: string): Promise<LLMResponse> {
    try {
      switch (this.config.provider) {
        case 'lmstudio':
          return await this.callLMStudio(prompt);
        case 'ollama':
          return await this.callOllama(prompt);
        default:
          throw new LLMServiceError(`Unsupported LLM provider: ${this.config.provider}`);
      }
    } catch (error) {
      throw new LLMServiceError('Failed to generate LLM response', error as Error);
    }
  }

  /**
   * Calls LM Studio API
   * @param prompt - The prompt to send
   * @returns LLM response
   */
  private async callLMStudio(prompt: string): Promise<LLMResponse> {
    console.log('🔍 LLM Service Debug:');
    console.log('  - Base URL:', this.config.baseUrl);
    console.log('  - Model:', this.config.model);
    console.log('  - Prompt length:', prompt.length);
    
    const requestBody = {
      model: this.config.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      stream: false
    };
    
    console.log('  - Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ LLM API Error:', response.status, response.statusText);
      console.error('❌ Error response:', errorText);
      throw new LLMServiceError(
        `LM Studio API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('✅ LLM Response:', JSON.stringify(data, null, 2));
    
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined,
      metadata: {
        model: data.model,
        finishReason: data.choices[0]?.finish_reason
      }
    };
  }

  /**
   * Calls Ollama API
   * @param prompt - The prompt to send
   * @returns LLM response
   */
  private async callOllama(prompt: string): Promise<LLMResponse> {
    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt: prompt,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      throw new LLMServiceError(
        `Ollama API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    
    return {
      content: data.response || '',
      usage: data.eval_count ? {
        promptTokens: 0, // Ollama doesn't provide token counts
        completionTokens: data.eval_count,
        totalTokens: data.eval_count
      } : undefined,
      metadata: {
        model: data.model,
        done: data.done
      }
    };
  }

  /**
   * Checks if the LLM service is available and responding
   * @returns True if the service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'lmstudio':
          return await this.checkLMStudioHealth();
        case 'ollama':
          return await this.checkOllamaHealth();
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks LM Studio health
   * @returns True if LM Studio is responding
   */
  private async checkLMStudioHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks Ollama health
   * @returns True if Ollama is responding
   */
  private async checkOllamaHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets available models from the LLM provider
   * @returns Array of available model names
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      switch (this.config.provider) {
        case 'lmstudio':
          return await this.getLMStudioModels();
        case 'ollama':
          return await this.getOllamaModels();
        default:
          return [];
      }
    } catch (error) {
      console.warn('Failed to get available models:', error);
      return [];
    }
  }

  /**
   * Gets available models from LM Studio
   * @returns Array of model names
   */
  private async getLMStudioModels(): Promise<string[]> {
    const response = await fetch(`${this.config.baseUrl}/v1/models`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data?.map((model: any) => model.id) || [];
  }

  /**
   * Gets available models from Ollama
   * @returns Array of model names
   */
  private async getOllamaModels(): Promise<string[]> {
    const response = await fetch(`${this.config.baseUrl}/api/tags`);
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.models?.map((model: any) => model.name) || [];
  }

  /**
   * Updates the LLM configuration
   * @param newConfig - New configuration
   */
  updateConfig(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets the current configuration
   * @returns Current LLM configuration
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }
}

/**
 * Factory function to create an LLM service from environment variables
 * @returns Configured LLM service
 */
export function createLLMService(): LLMService {
  const provider = (process.env.LLM_PROVIDER as 'lmstudio' | 'ollama') || 'lmstudio';
  const baseUrl = process.env.LLM_BASE_URL || 
    (provider === 'lmstudio' ? 'http://localhost:1234' : 'http://localhost:11434');
  const model = process.env.LLM_MODEL || 'llama-2-7b-chat';
  const temperature = parseFloat(process.env.LLM_TEMPERATURE || '0.7');
  const maxTokens = parseInt(process.env.LLM_MAX_TOKENS || '2048');

  const config: LLMConfig = {
    provider,
    baseUrl,
    model,
    temperature,
    maxTokens
  };

  return new LLMService(config);
}

// Export a singleton instance for common use
export const llmService = createLLMService();
