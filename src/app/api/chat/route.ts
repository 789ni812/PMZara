import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { promptService } from '@/services/prompt-service';
import { llmService } from '@/services/llm-service';
import { createMemoryService } from '@/services/memory-service';
import { createChatService } from '@/services/chat-service';

// Initialize Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:./dev.db"
    }
  }
});

// Request validation schema
const ChatRequestSchema = z.object({
  userId: z.string().min(1),
  message: z.string().min(1).max(2000),
  overrides: z.object({
    systemPrompt: z.string().optional(),
    taskPrompt: z.string().optional(),
    modulePrompts: z.record(z.string()).optional(),
    style: z.object({
      tone: z.enum(['formal', 'casual', 'encouraging', 'strict']).optional(),
      humour: z.enum(['none', 'light', 'moderate']).optional(),
      formality: z.enum(['very_formal', 'formal', 'casual', 'very_casual']).optional(),
    }).optional(),
  }).optional(),
  debug: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = ChatRequestSchema.parse(body);

    // Create services
    const memoryService = createMemoryService(prisma);
    const chatService = createChatService(promptService, llmService, memoryService);

    // Check if service is ready
    const serviceStatus = await chatService.isReady();
    if (!serviceStatus.ready) {
      return NextResponse.json({
        success: false,
        error: 'Service not ready',
        issues: serviceStatus.issues
      }, { status: 503 });
    }

    // Process the message
    const result = await chatService.processMessage(
      validatedData.userId,
      validatedData.message,
      validatedData.overrides
    );

    // Prepare response
    const response: any = {
      success: true,
      data: {
        response: result.response,
        context: result.context,
        metadata: result.metadata
      }
    };

    // Include debug view if requested
    if (validatedData.debug) {
      const debugView = await chatService.getDebugView(
        validatedData.userId,
        validatedData.message,
        validatedData.overrides
      );
      response.data.debugView = debugView;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 });
    }

    // Create services
    const memoryService = createMemoryService(prisma);
    const chatService = createChatService(promptService, llmService, memoryService);

    // Get conversation history
    const history = await chatService.getConversationHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: {
        history,
        count: history.length
      }
    });

  } catch (error) {
    console.error('Chat history API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 });
    }

    // Create services
    const memoryService = createMemoryService(prisma);
    const chatService = createChatService(promptService, llmService, memoryService);

    // Reset conversation
    const success = await chatService.resetConversation(userId);

    return NextResponse.json({
      success: true,
      data: {
        reset: success,
        message: success ? 'Conversation reset successfully' : 'Failed to reset conversation'
      }
    });

  } catch (error) {
    console.error('Chat reset API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
