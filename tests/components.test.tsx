import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskManager } from '../src/components/TaskManager';
import { TaskItem } from '../src/components/TaskItem';
import { TaskForm } from '../src/components/TaskForm';
import { Task } from '../src/types';

// Mock fetch
global.fetch = jest.fn();

// Mock the UI components
jest.mock('../src/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('../src/components/ui/input', () => ({
  Input: ({ onChange, ...props }: any) => (
    <input onChange={onChange} {...props} />
  ),
}));

jest.mock('../src/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

jest.mock('../src/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

jest.mock('../src/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('../src/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  ),
}));

describe('TaskManager Component', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      userId: 'demo-user-123',
      title: 'Test Task 1',
      description: 'Test Description 1',
      category: 'Personal',
      status: 'pending',
      priority: 'medium',
      dueDate: null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'demo-user-123',
      title: 'Test Task 2',
      description: 'Test Description 2',
      category: 'Work',
      status: 'completed',
      priority: 'high',
      dueDate: new Date('2024-01-15'),
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render task manager with loading state', () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'Failed to load' }),
    });

    render(<TaskManager />);
    
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('should render tasks when loaded successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockTasks }),
    });

    render(<TaskManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  it('should show error state when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<TaskManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should open task form when New Task button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [] }),
    });

    render(<TaskManager />);
    
    const newTaskButton = screen.getByText('New Task');
    fireEvent.click(newTaskButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });
  });

  it('should filter tasks by search term', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true, data: mockTasks }),
    });

    render(<TaskManager />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'Task 1' } });
    
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
  });
});

describe('TaskItem Component', () => {
  const mockTask: Task = {
    id: '1',
    userId: 'demo-user-123',
    title: 'Test Task',
    description: 'Test Description',
    category: 'Personal',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date('2024-01-15'),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockHandlers = {
    onUpdate: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render task item with all information', () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockHandlers.onUpdate}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should show completed task with strikethrough', () => {
    const completedTask = { ...mockTask, status: 'completed' as const };
    
    render(
      <TaskItem
        task={completedTask}
        onUpdate={mockHandlers.onUpdate}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
      />
    );

    const title = screen.getByText('Test Task');
    expect(title).toHaveClass('line-through');
  });

  it('should show overdue indicator for overdue tasks', () => {
    const overdueTask = { 
      ...mockTask, 
      dueDate: new Date('2020-01-01'),
      status: 'pending' as const 
    };
    
    render(
      <TaskItem
        task={overdueTask}
        onUpdate={mockHandlers.onUpdate}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
      />
    );

    expect(screen.getByText('(Overdue)')).toBeInTheDocument();
  });

  it('should call onUpdate when checkbox is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockHandlers.onUpdate}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockHandlers.onUpdate).toHaveBeenCalledWith('1', {
      status: 'completed',
      completedAt: expect.any(Date),
    });
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockHandlers.onUpdate}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('should call onDelete when delete button is clicked', () => {
    // Mock confirm dialog
    global.confirm = jest.fn(() => true);

    render(
      <TaskItem
        task={mockTask}
        onUpdate={mockHandlers.onUpdate}
        onDelete={mockHandlers.onDelete}
        onEdit={mockHandlers.onEdit}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });
});

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create task form', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
  });

  it('should render edit task form when task is provided', () => {
    const mockTask: Task = {
      id: '1',
      userId: 'demo-user-123',
      title: 'Existing Task',
      description: 'Existing Description',
      category: 'Work',
      status: 'pending',
      priority: 'high',
      dueDate: new Date('2024-01-15'),
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Create Task');
    fireEvent.click(submitButton);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText('Title *');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByText('Create Task');

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New Description',
      category: 'Personal',
      priority: 'medium',
      dueDate: '',
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show loading state when submitting', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});
