import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskRow from '../TaskRow';

// Mock child component to focus on TaskRow logic
vi.mock('../SubtaskList', () => ({
    default: () => <div data-testid="subtask-list" />
}));

describe('TaskRow', () => {
    const mockTask = {
        id: 1,
        description: 'Test Task',
        due_date: '2023-01-01',
        group: 'Test Group',
        details: 'Some detauls',
        completed: false,
        // notified: false, // Removed as it is not in Task interface
        // notification_minutes: undefined, // undefined is optional
        subtasks: []
    };

    const mockHandlers = {
        onDelete: vi.fn(),
        onComplete: vi.fn(),
        onEdit: vi.fn(),
        onTasksUpdate: vi.fn(),
    };

    it('renders task information correctly', () => {
        render(<TaskRow task={mockTask} {...mockHandlers} />);

        expect(screen.getByText('Test Task')).toBeInTheDocument();
        expect(screen.getByText(/Due: 2023-01-01/)).toBeInTheDocument();
        expect(screen.getByText(/Group: Test Group/)).toBeInTheDocument();
    });

    it('calls onComplete when checkbox is clicked', () => {
        render(<TaskRow task={mockTask} {...mockHandlers} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(mockHandlers.onComplete).toHaveBeenCalledWith(1);
    });

    it('calls onDelete when delete button is clicked', () => {
        render(<TaskRow task={mockTask} {...mockHandlers} />);

        const deleteBtn = screen.getByText('Delete');
        fireEvent.click(deleteBtn);

        expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
    });

    it('expands details when clicked', () => {
        render(<TaskRow task={mockTask} {...mockHandlers} />);

        expect(screen.queryByText('Some detauls')).not.toBeInTheDocument();

        // Click on the main content area to expand
        fireEvent.click(screen.getByText('Test Task'));

        expect(screen.getByText('Some detauls')).toBeInTheDocument();
        expect(screen.getByTestId('subtask-list')).toBeInTheDocument();
    });
});
