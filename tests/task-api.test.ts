import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '../src/app/api/tasks/route';
import { GET as getTask, PUT, DELETE } from '../src/app/api/tasks/[id]/route';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    task: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Task API Routes', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const { PrismaClient } = require('@prisma/client');
    mockPrisma = new PrismaClient();
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks for a user', async () => {
      const mockTasks = [
        {
          id: '1',
          userId: 'demo-user-123',
          title: 'Test Task',
          description: 'Test Description',
          category: 'Personal',
          status: 'pending',
          priority: 'medium',
          dueDate: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.task.findMany.mockResolvedValue(mockTasks);

      const request = new NextRequest('http://localhost:3000/api/tasks?userId=demo-user-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTasks);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'demo-user-123' },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
      });
    });

    it('should filter tasks by status', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/tasks?userId=demo-user-123&status=pending');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'demo-user-123', status: 'pending' },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.task.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/tasks?userId=demo-user-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch tasks');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        category: 'Work',
        priority: 'high',
        dueDate: '2024-01-15',
      };

      const createdTask = {
        id: '2',
        userId: 'demo-user-123',
        ...newTask,
        status: 'pending',
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.task.create.mockResolvedValue(createdTask);

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdTask);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          ...newTask,
          userId: 'demo-user-123',
          dueDate: new Date('2024-01-15'),
        },
      });
    });

    it('should validate required fields', async () => {
      const invalidTask = {
        description: 'Missing title',
        category: 'Personal',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTask),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation error');
    });

    it('should handle database errors during creation', async () => {
      mockPrisma.task.create.mockRejectedValue(new Error('Database error'));

      const newTask = {
        title: 'New Task',
        category: 'Personal',
        priority: 'medium',
      };

      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create task');
    });
  });

  describe('GET /api/tasks/[id]', () => {
    it('should return a specific task', async () => {
      const task = {
        id: '1',
        userId: 'demo-user-123',
        title: 'Test Task',
        description: 'Test Description',
        category: 'Personal',
        status: 'pending',
        priority: 'medium',
        dueDate: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.task.findUnique.mockResolvedValue(task);

      const request = new NextRequest('http://localhost:3000/api/tasks/1');
      const response = await getTask(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(task);
    });

    it('should return 404 for non-existent task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/tasks/999');
      const response = await getTask(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/[id]', () => {
    it('should update a task successfully', async () => {
      const updates = {
        title: 'Updated Task',
        status: 'completed',
      };

      const updatedTask = {
        id: '1',
        userId: 'demo-user-123',
        title: 'Updated Task',
        description: 'Test Description',
        category: 'Personal',
        status: 'completed',
        priority: 'medium',
        dueDate: null,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.task.update.mockResolvedValue(updatedTask);

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedTask);
    });

    it('should set completedAt when status changes to completed', async () => {
      const updates = {
        status: 'completed',
      };

      mockPrisma.task.update.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      await PUT(request, { params: { id: '1' } });

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: 'completed',
          completedAt: expect.any(Date),
        },
      });
    });
  });

  describe('DELETE /api/tasks/[id]', () => {
    it('should delete a task successfully', async () => {
      mockPrisma.task.delete.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Task deleted successfully');
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle database errors during deletion', async () => {
      mockPrisma.task.delete.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/tasks/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to delete task');
    });
  });
});
