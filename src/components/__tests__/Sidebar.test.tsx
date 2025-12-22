import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "../sidebar/Sidebar";

// Mock ContextMenu
vi.mock("../ui/ContextMenu", () => ({
  default: ({
    onClose,
    items,
  }: {
    onClose: () => void;
    items: { label: string; onClick: () => void }[];
  }) => (
    <div data-testid="context-menu">
      {items.map((item) => (
        <button key={item.label} onClick={item.onClick}>
          {item.label}
        </button>
      ))}
      <button onClick={onClose}>Close Menu</button>
    </div>
  ),
}));

describe("Sidebar", () => {
  const mockTasks = [
    {
      id: 1,
      description: "Task 1",
      due_date: "",
      group: "Work",
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
      completed: false,
      subtasks: [],
    },
  ];

  const mockHandlers = {
    onSelectGroup: vi.fn(),
    onAddGroup: vi.fn(),
    onDeleteGroup: vi.fn(),
    onRenameGroup: vi.fn(),
    onOpenSettings: vi.fn(),
  };

  const groups = ["Work", "Personal"];

  // beforeEach(() => {
  //     vi.clearAllMocks();
  // });

  it("renders navigation items", () => {
    render(
      <Sidebar
        tasks={mockTasks}
        groups={groups}
        currentGroup="__ALL__"
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("📋 All Tasks")).toBeInTheDocument();
    expect(screen.getByText("📊 Dashboard")).toBeInTheDocument();
    expect(screen.getByText("📅 Calendar")).toBeInTheDocument();
    expect(screen.getByText("💹 Gantt Chart")).toBeInTheDocument();
    expect(screen.getByText("📝 Memos")).toBeInTheDocument();
    expect(screen.getByText("📚 Reading Memos")).toBeInTheDocument();
  });

  it("renders group list", () => {
    render(
      <Sidebar
        tasks={mockTasks}
        groups={groups}
        currentGroup="__ALL__"
        {...mockHandlers}
      />,
    );

    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();
  });

  it("highlights active group", () => {
    render(
      <Sidebar
        tasks={mockTasks}
        groups={groups}
        currentGroup="__DASHBOARD__"
        {...mockHandlers}
      />,
    );

    const dashboardItem = screen.getByText("📊 Dashboard").closest("div");
    expect(dashboardItem).toHaveClass("active");
  });

  it("calls onSelectGroup when nav item is clicked", () => {
    render(
      <Sidebar
        tasks={mockTasks}
        groups={groups}
        currentGroup="__ALL__"
        {...mockHandlers}
      />,
    );

    fireEvent.click(screen.getByText("📊 Dashboard"));
    expect(mockHandlers.onSelectGroup).toHaveBeenCalledWith("__DASHBOARD__");
  });

  it("calls onSelectGroup when group is clicked", () => {
    render(
      <Sidebar
        tasks={mockTasks}
        groups={groups}
        currentGroup="__ALL__"
        {...mockHandlers}
      />,
    );

    fireEvent.click(screen.getByText("Work"));
    expect(mockHandlers.onSelectGroup).toHaveBeenCalledWith("Work");
  });

  it("shows add group input when + is clicked", () => {
    render(
      <Sidebar
        tasks={mockTasks}
        groups={groups}
        currentGroup="__ALL__"
        {...mockHandlers}
      />,
    );

    fireEvent.click(screen.getByText("+"));
    expect(screen.getByPlaceholderText("New Group")).toBeInTheDocument();
  });

  it("calls onOpenSettings when Settings is clicked", () => {
    render(
      <Sidebar
        tasks={mockTasks}
        groups={groups}
        currentGroup="__ALL__"
        {...mockHandlers}
      />,
    );

    fireEvent.click(screen.getByText("⚙️ Settings"));
    expect(mockHandlers.onOpenSettings).toHaveBeenCalled();
  });

  it("shows No Group option when tasks without group exist", () => {
    render(
      <Sidebar
        tasks={mockTasks}
        groups={groups}
        currentGroup="__ALL__"
        {...mockHandlers}
      />,
    );

    // mockTasks has task with empty group
    expect(screen.getByText("📄 No Group")).toBeInTheDocument();
  });
});
