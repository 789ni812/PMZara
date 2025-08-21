'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Clock,
  CheckCircle,
  Circle,
  AlertCircle
} from 'lucide-react';
import { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const PRIORITY_CONFIG = {
  low: { color: 'bg-green-100 text-green-800', icon: Circle },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  high: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const STATUS_CONFIG = {
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
  in_progress: { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
};

export function TaskItem({ task, onUpdate, onDelete, onEdit }: TaskItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const statusConfig = STATUS_CONFIG[task.status];
  const PriorityIcon = priorityConfig.icon;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await onUpdate(task.id, { 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await onDelete(task.id);
    }
  };

  const formatDueDate = (date: Date) => {
    const dueDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dueDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dueDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return dueDate.toLocaleDateString();
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      task.status === 'completed' ? 'opacity-75' : ''
    } ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={handleStatusToggle}
              disabled={isUpdating}
              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
            />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-gray-900 ${
                  task.status === 'completed' ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className={`text-sm text-gray-600 mt-1 ${
                    task.status === 'completed' ? 'line-through' : ''
                  }`}>
                    {task.description}
                  </p>
                )}

                {/* Task Meta */}
                <div className="flex items-center gap-3 mt-2">
                  {/* Category */}
                  <Badge variant="outline" className="text-xs">
                    {task.category}
                  </Badge>

                  {/* Priority */}
                  <Badge className={`text-xs ${priorityConfig.color}`}>
                    <PriorityIcon className="w-3 h-3 mr-1" />
                    {task.priority}
                  </Badge>

                  {/* Status */}
                  <Badge className={`text-xs ${statusConfig.color}`}>
                    {statusConfig.label}
                  </Badge>

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 text-xs ${
                      isOverdue ? 'text-red-600' : 
                      isDueToday ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      <Calendar className="w-3 h-3" />
                      {formatDueDate(task.dueDate)}
                      {isOverdue && <span className="font-medium">(Overdue)</span>}
                    </div>
                  )}
                </div>

                {/* Completion Date */}
                {task.completedAt && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed {new Date(task.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
