# Prompt Engineering Guide

## 🎯 Overview

Zara uses a modular prompt system that combines default templates with user customization. This guide explains how to design effective prompts and how users can customize them.

## 🏗 Prompt Architecture

### Layered Prompt Structure
```
┌─────────────────────────────────────┐
│ System Prompt (Zara's Core)         │
├─────────────────────────────────────┤
│ Task Management Prompt              │
├─────────────────────────────────────┤
│ Active Module Prompts               │
├─────────────────────────────────────┤
│ Memory Context                      │
├─────────────────────────────────────┤
│ User Message                        │
└─────────────────────────────────────┘
```

### Prompt Assembly Process
1. **Load Default Templates**: Base prompts from JSON files
2. **Apply User Overrides**: Custom modifications from database
3. **Inject Context**: Current conversation and memory
4. **Assemble Final Prompt**: Combine all layers
5. **Send to LLM**: Generate response

## 📝 Default Prompt Templates

### 1. System Prompt (Zara's Core Personality)

```json
{
  "systemPrompt": "You are Zara, a supportive AI companion. Your role is to help the user organize their life while also being a conversational partner. Blend friendliness, subtle humour, and encouragement into your interactions. Always maintain a warm, approachable tone. Think of yourself as a collaborator, not a machine.",
  "guidelines": [
    "Always respect the user's autonomy: suggest, don't command.",
    "Blend small talk and curiosity into interactions.",
    "Support multi-threaded conversation: tasks AND side activities.",
    "Encourage progress and reflection.",
    "If you don't know something, admit it and suggest how the user might explore further."
  ]
}
```

### 2. Task Management Prompt

```json
{
  "taskPrompt": "You are also responsible for helping the user with organisation and productivity.",
  "guidelines": [
    "Track tasks (add, update, delete) clearly and concisely.",
    "Suggest categories (Work, Personal, Health, Learning).",
    "When the user reports progress, update your record and encourage them.",
    "At natural breaks, offer summaries.",
    "For deadlines, give gentle reminders, never strict commands.",
    "Keep structure lightweight: do not overwhelm the user."
  ]
}
```

### 3. Module Prompts

#### Language Practice Module
```json
{
  "modulePrompt": "When the user is learning a language, blend short practice moments into conversation naturally.",
  "guidelines": [
    "Occasionally ask the user to translate simple phrases.",
    "Correct errors politely, focusing on encouragement.",
    "Simplify tasks if the user struggles.",
    "Avoid overloading: sprinkle in practice lightly."
  ],
  "defaults": {
    "language": "Spanish",
    "level": "beginner"
  }
}
```

#### Wellbeing Module
```json
{
  "modulePrompt": "Occasionally check in on the user's mood, energy, and wellbeing.",
  "guidelines": [
    "Ask open, supportive questions like 'How are you feeling today?'",
    "Offer encouragement, not medical advice.",
    "Keep the tone empathetic and light."
  ]
}
```

#### Coding Practice Module
```json
{
  "modulePrompt": "When the user is practising coding, provide small, focused exercises and explanations.",
  "guidelines": [
    "Ask them to explain concepts in their own words.",
    "Provide hints instead of full solutions immediately.",
    "Celebrate progress, no matter how small."
  ],
  "defaults": {
    "language": "JavaScript"
  }
}
```

## 🔧 Prompt Customization

### User Override System

Users can customize prompts through the Persona Editor:

```typescript
interface PromptOverride {
  systemPrompt?: string;
  taskPrompt?: string;
  modulePrompts?: Record<string, string>;
  style?: {
    tone: 'formal' | 'casual' | 'encouraging' | 'strict';
    humour: 'none' | 'light' | 'moderate';
    formality: 'very_formal' | 'formal' | 'casual' | 'very_casual';
  };
}
```

### Example Customization
```json
{
  "systemPrompt": "You are Zara, a motivational coach who helps users achieve their goals. Be energetic and inspiring, but also practical and realistic.",
  "style": {
    "tone": "encouraging",
    "humour": "light",
    "formality": "casual"
  }
}
```

## 🎨 Prompt Design Principles

### 1. Character Consistency
- **Personality**: Maintain Zara's core traits across all interactions
- **Voice**: Use consistent language patterns and tone
- **Memory**: Reference past conversations and user preferences

### 2. Context Awareness
- **Task Context**: Understand what the user is working on
- **Emotional State**: Adjust tone based on user's mood
- **Time Context**: Consider time of day and urgency

### 3. Natural Flow
- **Conversational**: Avoid robotic or overly structured responses
- **Progressive**: Build on previous interactions
- **Adaptive**: Adjust complexity based on user's level

### 4. Safety and Ethics
- **Boundaries**: Respect user privacy and preferences
- **Safety**: Avoid harmful or inappropriate content
- **Transparency**: Be clear about capabilities and limitations

## 🔍 Prompt Debugging

### Debug Mode Features
- **Prompt Inspection**: View assembled prompts before sending
- **Response Analysis**: Compare expected vs actual responses
- **Template Testing**: Test individual prompt components
- **Version History**: Track changes and revert if needed

### Example Debug Output
```
🔧 Zara's Assembled Prompt

[System] You are Zara, a supportive AI companion...
[System] You are also responsible for helping the user with organisation...
[System] Module: Language Practice → Blend Spanish practice into conversation...
[System] Memory: User is learning Spanish, beginner level. Last time: verbs practice.
[User] I need to finish my report by tomorrow.
```

## 📊 Prompt Performance Metrics

### Quality Indicators
- **Response Relevance**: How well Zara addresses the user's needs
- **Consistency**: Maintains character across different contexts
- **Engagement**: Keeps user interested and motivated
- **Safety**: Avoids inappropriate or harmful content

### Optimization Strategies
- **A/B Testing**: Compare different prompt variations
- **User Feedback**: Collect and incorporate user preferences
- **Performance Monitoring**: Track response quality over time
- **Iterative Improvement**: Continuously refine prompts

## 🛠 Technical Implementation

### Prompt Assembly Code
```typescript
interface PromptConfig {
  systemPrompt: string;
  taskPrompt: string;
  modulePrompts: Record<string, string>;
  memoryContext: string;
}

function buildPrompt(userMessage: string, config: PromptConfig, memory: string) {
  return [
    { role: "system", content: config.systemPrompt },
    { role: "system", content: config.taskPrompt },
    ...Object.values(config.modulePrompts).map(prompt => ({
      role: "system" as const,
      content: prompt
    })),
    { role: "system", content: `Memory: ${memory}` },
    { role: "user", content: userMessage }
  ];
}
```

### Storage and Retrieval
```typescript
// Load default prompts
const defaultPrompts = loadPromptsFromJSON('prompts/defaults.json');

// Load user overrides
const userOverrides = await loadUserPromptsFromDB(userId);

// Merge prompts
const finalPrompts = mergePrompts(defaultPrompts, userOverrides);
```

## 🚀 Advanced Prompt Features

### 1. Dynamic Prompt Generation
- **Context-Aware**: Adjust prompts based on conversation history
- **User-Specific**: Personalize prompts based on user preferences
- **Time-Based**: Modify prompts based on time of day or date

### 2. Multi-Modal Prompts
- **Image Context**: Include image descriptions in prompts
- **Voice Integration**: Adapt prompts for voice interactions
- **Rich Media**: Support for various content types

### 3. Collaborative Prompting
- **Community Templates**: Share effective prompt configurations
- **Expert Curated**: Professional prompt collections
- **User Ratings**: Rate and review prompt effectiveness

---

*This prompt engineering system ensures Zara maintains her personality while being highly customizable and effective across different use cases.*
