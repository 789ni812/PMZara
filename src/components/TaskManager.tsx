'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Filter, 
  Search, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Task, CreateTaskForm } from '@/types';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';

interface TaskManagerProps {
  userId?: string;
  className?: string;
}

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed';
type FilterPriority = 'all' | 'low' | 'medium' | 'high';

export function TaskManager({ userId = 'demo-user-123', className = '' }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Load tasks
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({ userId });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/tasks?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
      } else {
        setError(data.error || 'Failed to load tasks');
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    const filtered = tasks.filter(task => {
      const matchesSearch = searchTerm === '' || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
    
    setFilteredTasks(filtered);
  }, [tasks, searchTerm]);

  // Load tasks on mount and filter changes
  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Create task
  const handleCreateTask = async (taskData: CreateTaskForm) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTasks(prev => [data.data, ...prev]);
        setShowTaskForm(false);
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task
  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTasks(prev => prev.map(task => 
          task.id === id ? { ...task, ...data.data } : task
        ));
      } else {
        setError(data.error || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTasks(prev => prev.filter(task => task.id !== id));
      } else {
        setError(data.error || 'Failed to delete task');
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  // Edit task
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Update task (from form)
  const handleUpdateTaskFromForm = async (taskData: CreateTaskForm) => {
    if (!editingTask) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? { ...task, ...data.data } : task
        ));
        setShowTaskForm(false);
        setEditingTask(null);
      } else {
        setError(data.error || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;
    
    return { total, completed, pending, overdue };
  };

  const stats = getTaskStats();
  const categories = Array.from(new Set(tasks.map(t => t.category)));

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Task Manager
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {stats.total} tasks • {stats.completed} completed • {stats.pending} pending
              {stats.overdue > 0 && (
                <span className="text-red-600 ml-2">• {stats.overdue} overdue</span>
              )}
            </p>
          </div>
          <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </CardHeader>

      {/* Filters */}
      <CardContent className="pb-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Task List */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[500px] px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Loading tasks...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadTasks}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No tasks found' : 'No tasks yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first task to get started!'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowTaskForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {filteredTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <TaskForm
              task={editingTask || undefined}
              onSubmit={editingTask ? handleUpdateTaskFromForm : handleCreateTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
