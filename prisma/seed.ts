import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { id: 'demo-user-123' },
    update: {},
    create: {
      id: 'demo-user-123',
      name: 'Demo User',
      email: 'demo@example.com',
    },
  });

  // Create user preferences
  await prisma.userPreferences.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      defaultLanguage: 'en',
      theme: 'light',
      timezone: 'UTC',
      notificationSettings: JSON.stringify({
        email: true,
        push: true,
        frequency: 'daily'
      }),
    },
  });

  // Create some sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        userId: demoUser.id,
        title: 'Welcome to Zara!',
        description: 'This is your first task. Try asking Zara to help you organize your day.',
        category: 'Personal',
        status: 'pending',
        priority: 'medium',
      },
    }),
    prisma.task.create({
      data: {
        userId: demoUser.id,
        title: 'Learn about Zara\'s features',
        description: 'Explore the different modules and capabilities of your AI companion.',
        category: 'Learning',
        status: 'in_progress',
        priority: 'high',
      },
    }),
  ]);

  // Create some sample memories
  const memories = await Promise.all([
    prisma.memory.create({
      data: {
        userId: demoUser.id,
        key: 'communication_style',
        value: 'casual',
        type: 'preference',
      },
    }),
    prisma.memory.create({
      data: {
        userId: demoUser.id,
        key: 'user_experience',
        value: 'new_user',
        type: 'context',
      },
    }),
  ]);

  // Create sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId: demoUser.id,
      content: 'Hello! I\'m Zara, your AI companion. I\'m here to help you organize your life and chat with you. What would you like to work on today?',
      metadata: JSON.stringify({
        role: 'assistant',
        activeModules: [],
        currentTask: null,
        mood: 'neutral',
      }),
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`   - 1 user`);
  console.log(`   - ${tasks.length} tasks`);
  console.log(`   - ${memories.length} memories`);
  console.log(`   - 1 conversation message`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
