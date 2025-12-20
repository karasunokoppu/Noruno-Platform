import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TaskList from "../TaskList";

// Mock TaskRow component
vi.mock("../TaskRow", () => ({
    default: ({
        task,
        onDelete,
        onEdit,
        onComplete,
    }: {
        task: { id: number; description: string };
        onDelete: (id: number) => void;
        onEdit: (task: unknown) => void;
        onComplete: (id: number) => void;
    }) => (
        <div data-testid={`task-row-${task.id}`}>
            <span>{task.description}</span>
            <button onClick={() => onDelete(task.id)}>Delete</button>
            <button onClick={() => onEdit(task)}>Edit</button>
            <button onClick={() => onComplete(task.id)}>Complete</button>
        </div>
    ),
}));

describe("TaskList", () => {
    const mockTasks = [
        {
            id: 1,
            description: "Task 1",
            due_date: "",
            group: "",
            details: "",
            completed: false,
            subtasks: [],
        },
        {
            id: 2,
            description: "Task 2",
            due_date: "",
            group: "",
            details: "",
            completed: true,
            subtasks: [],
        },
    ];

    const mockHandlers = {
        onDelete: vi.fn(),
        onComplete: vi.fn(),
        onEdit: vi.fn(),
        onTasksUpdate: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders all tasks", () => {
        render(<TaskList tasks={mockTasks} currentGroup="__ALL__" {...mockHandlers} />);

        expect(screen.getByText("Task 1")).toBeInTheDocument();
        expect(screen.getByText("Task 2")).toBeInTheDocument();
    });

    it("renders correct number of task rows", () => {
        render(<TaskList tasks={mockTasks} currentGroup="__ALL__" {...mockHandlers} />);

        expect(screen.getByTestId("task-row-1")).toBeInTheDocument();
        expect(screen.getByTestId("task-row-2")).toBeInTheDocument();
    });

    it("renders empty when no tasks", () => {
        const { container } = render(<TaskList tasks={[]} currentGroup="__ALL__" {...mockHandlers} />);

        expect(container.firstChild?.childNodes.length).toBe(0);
    });

    it("passes delete handler to TaskRow", () => {
        render(<TaskList tasks={mockTasks} currentGroup="__ALL__" {...mockHandlers} />);

        const deleteButtons = screen.getAllByText("Delete");
        fireEvent.click(deleteButtons[0]);

        expect(mockHandlers.onDelete).toHaveBeenCalledWith(1);
    });

    it("passes complete handler to TaskRow", () => {
        render(<TaskList tasks={mockTasks} currentGroup="__ALL__" {...mockHandlers} />);

        const completeButtons = screen.getAllByText("Complete");
        fireEvent.click(completeButtons[0]);

        expect(mockHandlers.onComplete).toHaveBeenCalledWith(1);
    });
});
