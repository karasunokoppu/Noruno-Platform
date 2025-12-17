import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import GanttView from '../GanttView';
import { Task } from '../../types';

describe('GanttView', () => {

    beforeAll(() => {
        // Mock createSVGPoint which is missing in jsdom
        if (!SVGSVGElement.prototype.createSVGPoint) {
            SVGSVGElement.prototype.createSVGPoint = function () {
                return {
                    x: 0,
                    y: 0,
                    matrixTransform: function () { return this; }
                } as DOMPoint;
            };
        }

        // Mock getBBox which is also missing
        // TS ignore might be needed if types are strict
        Object.defineProperty(SVGElement.prototype, 'getBBox', {
            writable: true,
            value: () => ({
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                bottom: 0,
                left: 0,
                right: 0,
                top: 0
            }),
        });
    });
    const mockTasks: Task[] = [
        {
            id: 1,
            description: 'Test Task 1',
            due_date: '2023-12-31',
            start_date: '2023-12-01',
            group: 'Work',
            details: '',
            completed: false,
            // notified: false, // Removed as it is not in Task interface
            // notification_minutes: undefined, // undefined is optional, so we can just omit it or set it to undefined
            subtasks: []
        }
    ];

    const mockOnTaskUpdate = vi.fn();

    it('renders without crashing', () => {
        render(<GanttView tasks={mockTasks} onTaskUpdate={mockOnTaskUpdate} />);
        // Check if the task description appears. gantt-task-react usually renders task names.
        // Use getAllByText because it might appear in the list and the chart
        expect(screen.getAllByText('Test Task 1').length).toBeGreaterThan(0);
    });

    it('renders "No tasks to display" when task list is empty', () => {
        render(<GanttView tasks={[]} onTaskUpdate={mockOnTaskUpdate} />);
        expect(screen.getByText('No tasks to display')).toBeInTheDocument();
    });
});
