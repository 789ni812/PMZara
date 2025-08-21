# Development Standards

## 🎯 Overview

This document outlines the coding standards, development practices, and quality requirements for the Zara project. Following these standards ensures code quality, maintainability, and team collaboration.

## 🧪 Test-Driven Development (TDD)

### TDD Workflow
1. **Write Test First**: Define expected behavior before implementation
2. **Watch Test Fail**: Ensure test catches the missing functionality
3. **Write Minimal Code**: Implement just enough to pass the test
4. **Refactor**: Clean up code while keeping tests green
5. **Repeat**: Move to the next feature

### Test Structure
```typescript
// Example: Testing prompt assembly
describe('PromptService', () => {
  describe('buildPrompt', () => {
    it('should assemble system prompt with user message', () => {
      // Arrange
      const userMessage = 'Hello Zara';
      const config = { systemPrompt: 'You are Zara' };
      
      // Act
      const result = buildPrompt(userMessage, config);
      
      // Assert
      expect(result).toContain('You are Zara');
      expect(result).toContain('Hello Zara');
    });
  });
});
```

### Testing Pyramid
- **Unit Tests** (70%): Individual functions and components
- **Integration Tests** (20%): Service interactions and API endpoints
- **E2E Tests** (10%): Full user workflows

## 📝 Code Style & Conventions

### TypeScript Standards
- **Strict Mode**: Always enabled
- **Explicit Types**: Avoid `any`, use proper type definitions
- **Interface First**: Define interfaces before implementation
- **Generic Types**: Use generics for reusable components

```typescript
// Good
interface ConversationContext {
  userId: string;
  currentTask?: string;
  mood?: 'happy' | 'stressed' | 'neutral';
}

// Avoid
const context: any = { userId: '123' };
```

### React Standards
- **Functional Components**: Use hooks over class components
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Props Interface**: Define prop types for all components
- **Error Boundaries**: Wrap components that might fail

```typescript
// Good
interface ChatMessageProps {
  message: string;
  sender: 'user' | 'zara';
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, timestamp }) => {
  return (
    <div className={`message ${sender}`}>
      <p>{message}</p>
      <time>{timestamp.toLocaleTimeString()}</time>
    </div>
  );
};
```

### Naming Conventions
- **Files**: kebab-case (`prompt-service.ts`, `chat-interface.tsx`)
- **Components**: PascalCase (`ChatInterface`, `PromptEditor`)
- **Functions**: camelCase (`buildPrompt`, `loadUserConfig`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_TEMPERATURE`, `MAX_TOKENS`)
- **Interfaces**: PascalCase with descriptive names (`ConversationContext`, `PromptConfig`)

## 🏗 Architecture Standards

### Service Layer
- **Single Responsibility**: Each service has one clear purpose
- **Dependency Injection**: Services accept dependencies as parameters
- **Error Handling**: Consistent error handling across all services
- **Async/Await**: Use async/await over promises

```typescript
// Good
class PromptService {
  constructor(
    private llmAdapter: LLMAdapter,
    private memoryService: MemoryService
  ) {}

  async buildPrompt(userMessage: string, context: ConversationContext): Promise<string> {
    try {
      const memory = await this.memoryService.getRelevantMemory(context.userId);
      return this.assemblePrompt(userMessage, memory);
    } catch (error) {
      throw new PromptAssemblyError('Failed to build prompt', error);
    }
  }
}
```

### Database Standards
- **Prisma ORM**: Use Prisma for all database operations
- **Migrations**: Version control database schema changes
- **Seeding**: Provide seed data for development
- **Transactions**: Use transactions for multi-step operations

```typescript
// Good
async function createUserWithPreferences(userData: CreateUserData) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData
    });
    
    await tx.userPreferences.create({
      data: {
        userId: user.id,
        defaultLanguage: 'en',
        theme: 'light'
      }
    });
    
    return user;
  });
}
```

## 🔒 Security Standards

### Input Validation
- **Sanitize Inputs**: Validate and sanitize all user inputs
- **Type Safety**: Use TypeScript for compile-time validation
- **Schema Validation**: Use Zod or similar for runtime validation

```typescript
// Good
import { z } from 'zod';

const UserInputSchema = z.object({
  message: z.string().min(1).max(1000),
  userId: z.string().uuid(),
  timestamp: z.date()
});

function validateUserInput(input: unknown): UserInput {
  return UserInputSchema.parse(input);
}
```

### LLM Security
- **Prompt Injection Protection**: Validate prompt templates
- **Content Filtering**: Implement basic safety measures
- **Rate Limiting**: Prevent abuse of local resources
- **Error Handling**: Graceful degradation on failures

## 📊 Quality Standards

### Code Coverage
- **Minimum Coverage**: 80% for core functionality
- **Critical Paths**: 100% coverage for critical business logic
- **Edge Cases**: Test error conditions and edge cases

### Performance Standards
- **Response Time**: LLM responses under 5 seconds
- **Memory Usage**: Efficient use of system resources
- **Bundle Size**: Keep frontend bundle under 2MB
- **Database Queries**: Optimize queries and use indexes

### Documentation Standards
- **JSDoc**: Document all public functions and interfaces
- **README**: Keep documentation up to date
- **API Docs**: Document all API endpoints
- **Architecture**: Document system design decisions

```typescript
/**
 * Builds a prompt for the LLM by combining system prompts, user context, and memory.
 * 
 * @param userMessage - The user's input message
 * @param context - Current conversation context
 * @param memory - Relevant memory from previous conversations
 * @returns Assembled prompt ready for LLM
 * 
 * @example
 * ```typescript
 * const prompt = await buildPrompt(
 *   "Hello Zara",
 *   { userId: "123", currentTask: "coding" },
 *   "User prefers casual tone"
 * );
 * ```
 */
async function buildPrompt(
  userMessage: string,
  context: ConversationContext,
  memory: string
): Promise<string> {
  // Implementation...
}
```

## 🔄 Git Workflow

### Branching Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Individual feature development
- **hotfix/**: Critical bug fixes

### Commit Standards
Use Conventional Commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

```bash
# Good commit messages
feat: add Spanish language practice module
fix: resolve prompt assembly error with empty memory
docs: update API documentation for chat endpoint
test: add unit tests for PromptService
```

### Pull Request Standards
- **Description**: Clear description of changes
- **Tests**: Include relevant tests
- **Documentation**: Update docs if needed
- **Review**: At least one code review required

## 🛠 Development Environment

### Required Tools
- **Node.js**: Version 18 or higher
- **TypeScript**: Latest stable version
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Prisma**: Database ORM

### IDE Configuration
- **VS Code**: Recommended editor
- **Extensions**: ESLint, Prettier, TypeScript
- **Settings**: Use workspace settings for consistency

### Environment Variables
```bash
# .env.local
DATABASE_URL="file:./dev.db"
LLM_PROVIDER="lmstudio" # or "ollama"
LLM_BASE_URL="http://localhost:1234"
LLM_MODEL="llama-2-7b-chat"
NODE_ENV="development"
```

## 📈 Monitoring & Logging

### Logging Standards
- **Structured Logging**: Use structured log format
- **Log Levels**: Appropriate log levels (debug, info, warn, error)
- **Sensitive Data**: Never log sensitive information
- **Performance**: Log performance metrics

```typescript
// Good
logger.info('Prompt assembled successfully', {
  userId: context.userId,
  promptLength: prompt.length,
  modules: activeModules
});

// Avoid
console.log('User data:', userData); // Might contain sensitive info
```

### Error Handling
- **Custom Errors**: Define specific error types
- **Error Boundaries**: React error boundaries for UI
- **Graceful Degradation**: Handle failures gracefully
- **User Feedback**: Provide helpful error messages

```typescript
// Good
class PromptAssemblyError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'PromptAssemblyError';
  }
}

try {
  const prompt = await buildPrompt(message, context);
  return prompt;
} catch (error) {
  if (error instanceof PromptAssemblyError) {
    logger.error('Failed to assemble prompt', { error });
    return getFallbackPrompt();
  }
  throw error;
}
```

---

*Following these standards ensures Zara is built with quality, maintainability, and collaboration in mind.*
