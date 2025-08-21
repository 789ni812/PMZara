# Developer Onboarding Guide

## 🚀 Welcome to Zara!

This guide will help you get up and running with the Zara AI Companion project. Whether you're a developer joining the team or using Cursor to work on this project, this document has everything you need.

## 📋 Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **Git**: For version control
- **Local LLM**: Either LM Studio or Ollama
- **Code Editor**: VS Code (recommended) or Cursor

### Optional but Recommended
- **Docker**: For containerized development
- **Postman**: For API testing
- **SQLite Browser**: For database inspection

## 🛠 Initial Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd zara
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings
nano .env.local
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### 5. Local LLM Setup

#### Option A: LM Studio
1. Download from [lmstudio.ai](https://lmstudio.ai)
2. Install and launch LM Studio
3. Download a model (recommended: Llama 2 7B Chat)
4. Start the local server (usually `http://localhost:1234`)

#### Option B: Ollama
1. Install from [ollama.ai](https://ollama.ai)
2. Pull a model: `ollama pull llama2:7b-chat`
3. Start the server: `ollama serve`

### 6. Verify Setup
```bash
# Run tests to ensure everything works
npm test

# Start development server
npm run dev
```

## 🏗 Project Structure

### Key Directories
```
zara/
├── docs/                    # 📚 Project documentation
│   ├── 01_Vision.md        # Project vision and goals
│   ├── 02_Requirements.md  # Functional requirements
│   ├── 03_Architecture.md  # Technical architecture
│   ├── 04_Prompts.md       # Prompt engineering guide
│   ├── 05_Standards.md     # Development standards
│   └── 06_Onboarding.md    # This file
├── src/
│   ├── components/         # 🧩 React components
│   ├── services/          # 🔧 Core business logic
│   ├── modules/           # 📦 Side-conversation modules
│   ├── types/             # 📝 TypeScript definitions
│   └── utils/             # 🛠 Utility functions
├── prompts/               # 💬 Default prompt templates
├── tests/                 # 🧪 Test files
├── prisma/               # 🗄 Database schema
└── public/               # 🌐 Static assets
```

### Important Files
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `prisma/schema.prisma`: Database schema
- `prompts/`: Default prompt templates
- `.env.local`: Environment variables

## 🧪 Development Workflow

### 1. TDD Approach
Always follow Test-Driven Development:

```bash
# Write test first
npm run test:watch

# Implement feature
# Run tests again
npm test

# Refactor if needed
```

### 2. Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### 3. Database Changes
```bash
# Create migration
npx prisma migrate dev --name add_user_preferences

# Update Prisma client
npx prisma generate
```

## 🎯 Key Concepts

### 1. Zara's Architecture
- **Local-First**: Everything runs on your machine
- **Modular**: Easy to add new features
- **Configurable**: Users can customize prompts and behavior
- **Testable**: Every component can be tested

### 2. Prompt System
- **Layered**: System + Task + Module + Memory + User
- **Configurable**: Users can override default prompts
- **Debug Mode**: View assembled prompts (advanced feature)

### 3. Module System
- **Side-Conversations**: Language practice, wellbeing, coding
- **Auto-Detection**: Zara detects when to activate modules
- **Extensible**: Easy to add new modules

## 🔧 Common Tasks

### Adding a New Module
1. Create module file in `src/modules/`
2. Add prompt template in `prompts/modules/`
3. Update database schema if needed
4. Write tests
5. Update documentation

### Modifying Prompts
1. Edit JSON files in `prompts/`
2. Test with different scenarios
3. Update documentation
4. Consider user customization options

### Database Changes
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev`
3. Update related services
4. Write tests for new schema

## 🐛 Troubleshooting

### Common Issues

#### LLM Connection Failed
```bash
# Check if LM Studio is running
curl http://localhost:1234/v1/models

# Check if Ollama is running
curl http://localhost:11434/api/tags
```

#### Database Issues
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm install
```

### Getting Help
1. Check the documentation in `docs/`
2. Look at existing tests for examples
3. Review the architecture document
4. Ask in the team chat or create an issue

## 📚 Learning Resources

### Project-Specific
- **Architecture**: `docs/03_Architecture.md`
- **Prompt Engineering**: `docs/04_Prompts.md`
- **Development Standards**: `docs/05_Standards.md`

### General Resources
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)
- **Prisma**: [prisma.io/docs](https://www.prisma.io/docs)
- **React Testing**: [testing-library.com](https://testing-library.com)

## 🎯 First Tasks

### For New Developers
1. **Read the Vision**: Understand what we're building (`docs/01_Vision.md`)
2. **Set up Environment**: Follow the setup steps above
3. **Run Tests**: Ensure everything works
4. **Explore the Code**: Look at existing components and services
5. **Make a Small Change**: Add a test or fix a minor issue

### For Cursor Users
1. **Load Documentation**: Share all docs with Cursor
2. **Understand Context**: Cursor should read the architecture and standards
3. **Follow TDD**: Write tests before implementation
4. **Use Prompts**: Reference the prompt engineering guide
5. **Ask Questions**: Cursor can help with implementation details

## 🚀 Next Steps

### Immediate Goals
- [ ] Set up development environment
- [ ] Run the application locally
- [ ] Understand the codebase structure
- [ ] Make your first contribution

### Learning Path
1. **Week 1**: Environment setup and basic understanding
2. **Week 2**: Contribute to existing features
3. **Week 3**: Add a new module or feature
4. **Week 4**: Lead a feature development

## 🤝 Getting Help

### Team Communication
- **Daily Standups**: Share progress and blockers
- **Code Reviews**: Get feedback on your changes
- **Pair Programming**: Work together on complex features
- **Documentation**: Keep docs updated as you learn

### Resources
- **Project Wiki**: Additional documentation
- **Team Chat**: Quick questions and discussions
- **Issue Tracker**: Bug reports and feature requests
- **Code Examples**: Look at existing implementations

---

**Welcome to the Zara team! 🎉**

*Remember: We're building something special - an AI companion that's truly helpful, truly private, and truly yours.*
