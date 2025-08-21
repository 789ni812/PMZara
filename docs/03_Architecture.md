# Technical Architecture

## 🏗 System Overview

Zara is built as a modular, local-first application with clear separation of concerns. The architecture prioritizes privacy, extensibility, and maintainability.

## 📊 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Local LLM     │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (LM Studio/   │
│                 │    │                 │    │    Ollama)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Core Services │    │   Local DB      │
│   - Chat        │    │   - LLM Adapter │    │   (SQLite)      │
│   - Config      │    │   - Memory      │    │                 │
│   - Tasks       │    │   - Prompts     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🧩 Core Components

### 1. Frontend Layer (Next.js 15)

#### Components
- **ChatInterface**: Main conversation UI with Zara
- **TaskManager**: Task creation, editing, and tracking
- **PersonaEditor**: Configure Zara's personality and prompts
- **PromptDebug**: Advanced mode for viewing/editing prompts
- **ModuleManager**: Enable/disable side-conversation modules

#### State Management
- **React Context**: Global state for user preferences
- **Zustand**: Lightweight state management for complex state
- **Local Storage**: Persist UI preferences and settings

### 2. Backend Layer (Node.js)

#### Core Services
- **LLMService**: Abstracted interface to local LLM
- **MemoryService**: Conversation and user data persistence
- **PromptService**: Template loading and assembly
- **TaskService**: Task CRUD operations
- **ModuleService**: Side-conversation module management

#### API Routes
- `/api/chat` - Main conversation endpoint
- `/api/tasks` - Task management
- `/api/config` - Configuration management
- `/api/memory` - Memory operations
- `/api/modules` - Module management

### 3. Data Layer

#### Database Schema (SQLite)
```sql
-- Users and preferences
users (id, name, preferences_json)

-- Conversation history
conversations (id, user_id, timestamp, content, metadata)

-- Tasks
tasks (id, user_id, title, description, category, status, due_date)

-- Memory storage
memories (id, user_id, key, value, timestamp, expires_at)

-- Module configurations
modules (id, user_id, name, enabled, config_json)

-- Prompt templates
prompts (id, user_id, name, template_json, is_default)
```

#### Data Access
- **Prisma ORM**: Type-safe database operations
- **Repository Pattern**: Clean separation of data logic
- **Caching**: In-memory cache for frequently accessed data

## 🔄 Data Flow

### 1. Conversation Flow
```
User Input → Frontend → API → Prompt Assembly → LLM → Response → Memory Storage → UI Update
```

### 2. Task Management Flow
```
Task Action → API → Database → Validation → Response → UI Update
```

### 3. Configuration Flow
```
Config Change → API → Validation → Database → Prompt Update → UI Refresh
```

## 🔌 Integration Points

### 1. Local LLM Integration

#### LM Studio
```typescript
interface LMStudioConfig {
  baseUrl: string;        // http://localhost:1234
  model: string;          // Model name
  temperature: number;    // 0.0 - 1.0
  maxTokens: number;      // Response length limit
}
```

#### Ollama
```typescript
interface OllamaConfig {
  baseUrl: string;        // http://localhost:11434
  model: string;          // Model name
  temperature: number;    // 0.0 - 1.0
  maxTokens: number;      // Response length limit
}
```

### 2. Module System

#### Module Interface
```typescript
interface ConversationModule {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  
  shouldActivate(context: ConversationContext): boolean;
  generatePrompt(context: ConversationContext): string;
  processResponse(response: string): ModuleResponse;
}
```

#### Example Modules
- **LanguagePractice**: Spanish, French, etc.
- **WellbeingCheckin**: Mood monitoring
- **CodingQuiz**: Programming practice
- **HabitTracker**: Goal tracking

## 🛡 Security Architecture

### 1. Data Protection
- **Local Storage**: All data stays on user's machine
- **No External Calls**: No data sent to external services
- **Input Validation**: Sanitize all user inputs
- **Prompt Injection Protection**: Validate prompt templates

### 2. LLM Security
- **Content Filtering**: Basic safety measures
- **Rate Limiting**: Prevent resource abuse
- **Error Handling**: Graceful degradation
- **Fallback Responses**: Safe defaults when LLM fails

## 📈 Performance Considerations

### 1. Response Time
- **LLM Optimization**: Efficient prompt engineering
- **Caching**: Cache frequently used data
- **Async Operations**: Non-blocking UI updates
- **Progressive Loading**: Load data as needed

### 2. Memory Management
- **Conversation History**: Limit stored messages
- **Database Optimization**: Indexed queries
- **Garbage Collection**: Clean up old data
- **Resource Monitoring**: Track memory usage

## 🔧 Development Architecture

### 1. Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: Full user workflow testing
- **TDD Workflow**: Test-first development

### 2. Code Organization
```
src/
├── components/          # React components
├── services/           # Core business logic
├── modules/            # Side-conversation modules
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── pages/              # Next.js pages
```

### 3. Configuration Management
- **Environment Variables**: Runtime configuration
- **JSON Configs**: User preferences and prompts
- **Database**: Persistent user data
- **Local Storage**: UI state and temporary data

## 🚀 Deployment Architecture

### 1. Local Development
- **Next.js Dev Server**: Hot reloading
- **SQLite Database**: File-based storage
- **Local LLM**: LM Studio or Ollama
- **Environment**: `.env.local` configuration

### 2. Production Considerations
- **Static Export**: Next.js static generation
- **Database Migration**: Schema versioning
- **Backup Strategy**: User data protection
- **Update Mechanism**: Seamless updates

## 🔮 Future Architecture

### 1. Scalability
- **Plugin System**: Third-party modules
- **API Gateway**: External integrations
- **Microservices**: Service decomposition
- **Distributed Storage**: Multi-device sync

### 2. Advanced Features
- **Vector Database**: Semantic search
- **Multi-Modal**: Image and voice support
- **Real-time**: WebSocket communication
- **Offline Support**: Service worker caching

---

*This architecture ensures Zara is robust, maintainable, and ready for future enhancements while maintaining the core principles of privacy and local-first operation.*
