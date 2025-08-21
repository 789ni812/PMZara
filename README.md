# Zara - AI Companion Organization Tool

Welcome to Zara! An AI companion that helps you organize your life while being a conversational partner.

## 🎯 Vision

Zara is a local-first AI assistant that combines task management with natural conversation. Think of Zara as a supportive companion who helps you stay organized while also engaging in side-activities like language practice, wellbeing check-ins, or coding quizzes.

## ✨ Key Features

- **AI Companion Interface**: Zara acts as your main interface (inspired by HAL from 2001)
- **Dual-Mode Interaction**: Task management + conversational side-activities
- **Local-First**: Runs entirely on your machine using LM Studio or Ollama
- **Configurable**: Customize Zara's persona, conversation style, and prompts
- **Memory**: Zara remembers your preferences and conversation history
- **Prompt Transparency**: See and edit how Zara thinks (advanced mode)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- LM Studio or Ollama installed and running locally
- Git

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd zara

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your local LLM settings

# Start the development server
npm run dev
```

### Local LLM Setup
1. **LM Studio**: Download from [lmstudio.ai](https://lmstudio.ai)
2. **Ollama**: Install from [ollama.ai](https://ollama.ai)

## 📁 Project Structure

```
zara/
├── docs/                    # Project documentation
│   ├── 01_Vision.md        # Project vision and goals
│   ├── 02_Requirements.md  # Functional requirements
│   ├── 03_Architecture.md  # Technical architecture
│   ├── 04_Prompts.md       # Prompt engineering guide
│   ├── 05_Standards.md     # Development standards
│   └── 06_Onboarding.md    # Developer onboarding
├── src/
│   ├── components/         # React components
│   ├── services/          # Core services (LLM, Memory, etc.)
│   ├── modules/           # Side-conversation modules
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── prompts/               # Default prompt templates
├── tests/                 # Test files
└── prisma/               # Database schema
```

## 🛠 Development

This project follows Test-Driven Development (TDD) principles:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📚 Documentation

- **[Vision & Goals](docs/01_Vision.md)** - Why we're building Zara
- **[Requirements](docs/02_Requirements.md)** - What Zara must do
- **[Architecture](docs/03_Architecture.md)** - How we'll build it
- **[Prompt Engineering](docs/04_Prompts.md)** - LLM configuration guide
- **[Development Standards](docs/05_Standards.md)** - Coding standards and practices
- **[Onboarding](docs/06_Onboarding.md)** - Getting started guide

## 🤝 Contributing

1. Follow TDD principles (write tests first)
2. Keep prompts modular and configurable
3. Maintain local-first architecture
4. Follow the coding standards in `docs/05_Standards.md`

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for local AI development**
