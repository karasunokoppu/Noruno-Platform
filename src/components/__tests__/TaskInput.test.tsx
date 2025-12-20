import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TaskInput from "../TaskInput";

// Mock CustomDatePicker and CustomDropdown
vi.mock("../CustomDatePicker", () => ({
    default: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="date-picker">
            <button onClick={onClose}>Close</button>
        </div>
    ),
}));

vi.mock("../CustomDropdown", () => ({
    default: ({
        value,
        onChange,
        options,
    }: {
        value: string;
        onChange: (v: string) => void;
        options: { value: string; label: string }[];
    }) => (
        <select
            data-testid="custom-dropdown"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    ),
}));

describe("TaskInput", () => {
    const mockOnAddTask = vi.fn();
    const existingGroups = ["Work", "Personal"];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the input and add button", () => {
        render(
            <TaskInput onAddTask={mockOnAddTask} existingGroups={existingGroups} />
        );

        expect(
            screen.getByPlaceholderText("Task description...")
        ).toBeInTheDocument();
        expect(screen.getByText("Add Task")).toBeInTheDocument();
    });

    it("expands the form when input is focused", () => {
        render(
            <TaskInput onAddTask={mockOnAddTask} existingGroups={existingGroups} />
        );

        const input = screen.getByPlaceholderText("Task description...");
        fireEvent.focus(input);

        // Check for expanded section elements
        expect(screen.getByText("Start Date")).toBeInTheDocument();
        expect(screen.getByText("Due Date")).toBeInTheDocument();
        expect(screen.getByText("Notify before:")).toBeInTheDocument();
    });

    it("collapses the form when Cancel button is clicked", () => {
        render(
            <TaskInput onAddTask={mockOnAddTask} existingGroups={existingGroups} />
        );

        const input = screen.getByPlaceholderText("Task description...");
        fireEvent.focus(input);

        // Check that the section has expanded class
        const expandedSection = screen.getByText("Start Date").closest(".task-expanded-section");
        expect(expandedSection).toHaveClass("expanded");

        expect(screen.getByText("Cancel")).toBeInTheDocument();

        // Collapse
        fireEvent.click(screen.getByText("Cancel"));

        // Form should be collapsed (check for collapsed class)
        expect(expandedSection).toHaveClass("collapsed");
    });

    it("calls onAddTask with correct parameters", () => {
        render(
            <TaskInput onAddTask={mockOnAddTask} existingGroups={existingGroups} />
        );

        const input = screen.getByPlaceholderText("Task description...");
        fireEvent.change(input, { target: { value: "New Task" } });
        fireEvent.click(screen.getByText("Add Task"));

        expect(mockOnAddTask).toHaveBeenCalledWith(
            "New Task",
            "",
            "",
            "",
            undefined,
            undefined
        );
    });

    it("clears input after adding task", () => {
        render(
            <TaskInput onAddTask={mockOnAddTask} existingGroups={existingGroups} />
        );

        const input = screen.getByPlaceholderText(
            "Task description..."
        ) as HTMLInputElement;
        fireEvent.change(input, { target: { value: "New Task" } });
        fireEvent.click(screen.getByText("Add Task"));

        expect(input.value).toBe("");
    });

    it("does not add task when description is empty", () => {
        render(
            <TaskInput onAddTask={mockOnAddTask} existingGroups={existingGroups} />
        );

        fireEvent.click(screen.getByText("Add Task"));

        expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it("adds task on Enter key press", () => {
        render(
            <TaskInput onAddTask={mockOnAddTask} existingGroups={existingGroups} />
        );

        const input = screen.getByPlaceholderText("Task description...");
        fireEvent.change(input, { target: { value: "Enter Task" } });
        fireEvent.keyDown(input, { key: "Enter" });

        expect(mockOnAddTask).toHaveBeenCalledWith(
            "Enter Task",
            "",
            "",
            "",
            undefined,
            undefined
        );
    });
});
