import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SubtaskList from "../SubtaskList";

// Mock Tauri API
vi.mock("../../tauri/api", () => ({
  addSubtask: vi.fn().mockResolvedValue([]),
  deleteSubtask: vi.fn().mockResolvedValue([]),
  toggleSubtask: vi.fn().mockResolvedValue([]),
  updateSubtask: vi.fn().mockResolvedValue([]),
}));

// Mock ContextMenu
vi.mock("../ui/ContextMenu", () => ({
  default: () => <div data-testid="context-menu" />,
  ContextMenuItem: {},
}));

describe("SubtaskList", () => {
  const mockOnTasksUpdate = vi.fn();

  const taskWithSubtasks = {
    id: 1,
    description: "Main Task",
    due_date: "",
    group: "",
    details: "",
    completed: false,
    subtasks: [
      { id: 1, description: "Subtask 1", completed: false },
      { id: 2, description: "Subtask 2", completed: true },
    ],
  };

  const taskWithoutSubtasks = {
    id: 2,
    description: "Task without subtasks",
    due_date: "",
    group: "",
    details: "",
    completed: false,
    subtasks: [],
  };

  // beforeEach(() => {
  //     vi.clearAllMocks();
  // });

  it("renders subtasks correctly", () => {
    render(
      <SubtaskList task={taskWithSubtasks} onTasksUpdate={mockOnTasksUpdate} />,
    );

    expect(screen.getByText("Subtask 1")).toBeInTheDocument();
    expect(screen.getByText("Subtask 2")).toBeInTheDocument();
  });

  it("shows progress bar with correct count", () => {
    render(
      <SubtaskList task={taskWithSubtasks} onTasksUpdate={mockOnTasksUpdate} />,
    );

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("shows add subtask button", () => {
    render(
      <SubtaskList
        task={taskWithoutSubtasks}
        onTasksUpdate={mockOnTasksUpdate}
      />,
    );

    expect(screen.getByText("+ Add Subtask")).toBeInTheDocument();
  });

  it("shows input form when add subtask is clicked", () => {
    render(
      <SubtaskList
        task={taskWithoutSubtasks}
        onTasksUpdate={mockOnTasksUpdate}
      />,
    );

    fireEvent.click(screen.getByText("+ Add Subtask"));

    expect(screen.getByPlaceholderText("Enter subtask...")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders checkbox for each subtask", () => {
    render(
      <SubtaskList task={taskWithSubtasks} onTasksUpdate={mockOnTasksUpdate} />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it("shows completed subtask with completed style", () => {
    render(
      <SubtaskList task={taskWithSubtasks} onTasksUpdate={mockOnTasksUpdate} />,
    );

    const completedSubtask = screen.getByText("Subtask 2");
    expect(completedSubtask).toHaveClass("completed");
  });

  it("hides progress bar when no subtasks", () => {
    render(
      <SubtaskList
        task={taskWithoutSubtasks}
        onTasksUpdate={mockOnTasksUpdate}
      />,
    );

    expect(screen.queryByText("/")).not.toBeInTheDocument();
  });

  it("allows canceling add subtask", () => {
    render(
      <SubtaskList
        task={taskWithoutSubtasks}
        onTasksUpdate={mockOnTasksUpdate}
      />,
    );

    fireEvent.click(screen.getByText("+ Add Subtask"));
    expect(screen.getByPlaceholderText("Enter subtask...")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.queryByPlaceholderText("Enter subtask..."),
    ).not.toBeInTheDocument();
  });
});
