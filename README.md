# PMZara - AI Companion & Task Manager

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7.0-2D3748)](https://www.prisma.io/)
[![Tests](https://img.shields.io/badge/Tests-35%20passing-brightgreen)](https://jestjs.io/)

A modern, local-first AI companion application that combines intelligent conversation with comprehensive task management. Built with Next.js 15.5.0, TypeScript, and Prisma.

## 🚀 Features

### 🤖 **AI Chat Interface**
- **Natural Conversations** - Chat with your AI assistant using local LLMs
- **Context Awareness** - Remembers conversation history and user preferences
- **Local LLM Support** - Works with LM Studio or Ollama
- **Real-time Responses** - Instant AI responses with typing indicators

### 📋 **Task Management System**
- **Complete CRUD Operations** - Create, read, update, delete tasks
- **Advanced Organization** - Priority levels, categories, due dates
- **Smart Filtering** - Search and filter tasks by status, priority, category
- **Visual Indicators** - Overdue alerts, completion tracking, status badges

### 🎨 **Modern UI/UX**
- **Side-by-Side Layout** - Chat and tasks in unified interface
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Professional Interface** - Clean, modern design with consistent branding
- **Accessibility** - Full keyboard navigation and screen reader support

### 🧪 **Comprehensive Testing**
- **35 Test Suite** - Complete coverage of API, components, and services
- **Quality Assurance** - Automated testing with Jest and React Testing Library
- **Error Handling** - Robust error scenarios and edge case testing

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.5.0, React 18, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM, SQLite
- **AI**: Local LLM integration (LM Studio/Ollama)
- **Testing**: Jest, React Testing Library, Testing Coverage
- **UI**: shadcn/ui components, Lucide React icons
- **Validation**: Zod schema validation

## 📦 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Local LLM setup (LM Studio or Ollama)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/PMZara.git
cd PMZara

# Install dependencies
npm install

# Setup the project
npm run setup

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Environment Configuration
```bash
# Copy environment template
cp env.example .env.local

# Configure your local LLM endpoint
# For LM Studio: http://localhost:1234/v1
# For Ollama: http://localhost:11434/v1
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage**: 35 tests across API routes, React components, and services

## 📁 Project Structure

```
PMZara/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main page
│   │   └── tasks/page.tsx     # Tasks page
│   ├── components/            # React components
│   │   ├── ChatInterface.tsx  # Chat component
│   │   ├── TaskManager.tsx    # Task management
│   │   ├── TaskItem.tsx       # Individual task
│   │   ├── TaskForm.tsx       # Task form
│   │   └── ui/                # shadcn/ui components
│   ├── services/              # Core services
│   │   ├── chat-service.ts    # Chat orchestration
│   │   ├── llm-service.ts     # LLM integration
│   │   ├── memory-service.ts  # Memory management
│   │   └── prompt-service.ts  # Prompt engineering
│   └── types/                 # TypeScript definitions
├── tests/                     # Test files
│   ├── chat-service.test.ts   # Chat service tests
│   ├── prompt-service.test.ts # Prompt service tests
│   ├── task-api.test.ts       # API route tests
│   └── components.test.tsx    # Component tests
├── prisma/                    # Database
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── prompts/                   # AI prompt templates
└── docs/                      # Documentation
```

## 🎯 Core Features

### Chat Interface
- Real-time conversation with AI assistant
- Message history persistence
- Context-aware responses
- Local LLM integration
- Responsive design

### Task Management
- **Create Tasks** - Add new tasks with title, description, priority, due date
- **Organize** - Categorize tasks and set priority levels
- **Track Progress** - Update status (pending, in-progress, completed)
- **Smart Filtering** - Search and filter by multiple criteria
- **Visual Feedback** - Overdue indicators, completion tracking

### Integrated UI
- **Side-by-Side Layout** - Chat and tasks in unified view
- **Toggle Sections** - Show/hide chat or task sections
- **Responsive Design** - Adapts to different screen sizes
- **Modern Interface** - Clean, professional appearance

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
npm test             # Run test suite
npm run test:watch   # Watch mode for tests
npm run test:coverage # Generate coverage report
```

### Database Commands
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Deployment Options
- **Vercel** (Recommended) - Optimized for Next.js
- **Netlify** - Static site hosting
- **Docker** - Containerized deployment
- **Self-hosted** - Custom server setup

## 📊 Current Status

**PMZara v0.1** is production-ready with:
- ✅ Complete chat system with AI integration
- ✅ Full-featured task management
- ✅ Modern, responsive UI
- ✅ Comprehensive test suite (35 tests)
- ✅ Production-ready codebase
- ✅ Complete documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Prisma** - Database toolkit
- **shadcn/ui** - UI component library
- **TailwindCSS** - CSS framework
- **Jest** - Testing framework

---

**PMZara v0.1** - Your AI companion for organization and conversation! 🤖✨

**Last Updated**: December 2024
