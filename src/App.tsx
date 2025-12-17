import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./styles/theme.css";
import "./App.css";
import Sidebar from "./components/sidebar";
import TaskList from "./components/TaskList";
import TaskInput from "./components/TaskInput";
import EditDialog from "./components/EditDialog";
import CalendarView from "./components/CalendarView";
import SettingsModal from "./components/settings";
import MemoView from "./components/memo";
import ReadingMemoView from "./components/reading";
import DashboardView from "./components/dashboard";
import GanttView from "./components/GanttView";

// Reading Book interface for dashboard
interface ReadingBook {
  id: string;
  title: string;
  status: string;
  reading_sessions: {
    duration_minutes?: number;
    pages_read: number;
  }[];
}

export interface Subtask {
  id: number;
  description: string;
  completed: boolean;
}

export interface Task {
  id: number;
  description: string;
  start_date?: string;
  due_date: string;
  group: string;
  details: string;
  completed: boolean;
  notification_minutes?: number;
  subtasks: Subtask[];
  dependencies?: number[];
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [currentGroup, setCurrentGroup] = useState<string>("__ALL__");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [theme, setTheme] = useState<string>("dark");
  const [showSettings, setShowSettings] = useState(false);
  const [readingBooks, setReadingBooks] = useState<ReadingBook[]>([]);

  useEffect(() => {
    refreshData();
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.className = `theme-${savedTheme}`;
  }, []);

  async function refreshData() {
    const loadedTasks = await invoke<Task[]>("get_tasks");
    const loadedGroups = await invoke<string[]>("get_groups");
    const loadedBooks = await invoke<ReadingBook[]>("get_reading_books");
    setTasks(loadedTasks);
    setGroups(loadedGroups);
    setReadingBooks(loadedBooks);
  }

  const handleAddTask = async (desc: string, date: string, group: string, details: string, notificationMinutes?: number, startDate?: string) => {
    const newTasks = await invoke<Task[]>("add_task", {
      description: desc,
      startDate: startDate || null,
      dueDate: date,
      group: group,
      details: details,
      notificationMinutes: notificationMinutes || null,
      dependencies: null,
    });
    setTasks(newTasks);
  };

  const handleDeleteTask = async (id: number) => {
    const newTasks = await invoke<Task[]>("delete_task", { id });
    setTasks(newTasks);
  };

  const handleCompleteTask = async (id: number) => {
    const newTasks = await invoke<Task[]>("complete_task", { id });
    setTasks(newTasks);
  };

  const handleUpdateTask = async (task: Task) => {
    const newTasks = await invoke<Task[]>("update_task", {
      id: task.id,
      description: task.description,
      startDate: task.start_date || null,
      dueDate: task.due_date,
      group: task.group,
      details: task.details,
      notificationMinutes: task.notification_minutes || null,
      dependencies: task.dependencies || null,
    });
    setTasks(newTasks);
    setEditingTask(null);
  };

  const handleAddGroup = async (name: string) => {
    const newGroups = await invoke<string[]>("create_group", { name });
    setGroups(newGroups);
  };

  const handleDeleteGroup = async (name: string) => {
    const newGroups = await invoke<string[]>("delete_group", { name });
    setGroups(newGroups);
    // Also refresh tasks as some might have been updated (group cleared)
    const loadedTasks = await invoke<Task[]>("get_tasks");
    setTasks(loadedTasks);

    if (currentGroup === name) {
      setCurrentGroup("__ALL__");
    }
  };

  const handleRenameGroup = async (oldName: string, newName: string) => {
    try {
      const res = await invoke<any>("rename_group", { oldName, newName });
      // The backend returns a tuple [groups, tasks]
      if (Array.isArray(res)) {
        const newGroups = res[0] as string[];
        const newTasks = res[1] as Task[];
        if (newGroups) setGroups(newGroups);
        if (newTasks) setTasks(newTasks);
        if (currentGroup === oldName) setCurrentGroup(newName);
      }
    } catch (err) {
      alert("グループ名の変更に失敗しました: " + (err as any)?.toString?.());
    }
  };

  const handleSaveTask = async (task: Task) => {
    if (task.id === 0) {
      // New task
      await handleAddTask(task.description, task.due_date, task.group, task.details, task.notification_minutes);
    } else {
      // Update task
      await handleUpdateTask(task);
    }
    setEditingTask(null);
  };

  return (
    <div className="flex w-full h-full overflow-hidden text-text-primary bg-bg-primary">
      <div className="w-[200px] bg-bg-secondary border-r border-border-primary flex flex-col p-[10px] shadow-[2px_0_5px_var(--shadow)]">
        <Sidebar
          tasks={tasks} // Keep for counts if needed, or remove if not used
          groups={groups}
          currentGroup={currentGroup}
          onSelectGroup={setCurrentGroup}
          onAddGroup={handleAddGroup}
          onDeleteGroup={handleDeleteGroup}
          onRenameGroup={handleRenameGroup}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      <div className="flex-1 flex flex-col p-5 bg-bg-primary overflow-hidden">
        {currentGroup === "__DASHBOARD__" ? (
          <DashboardView tasks={tasks} readingBooks={readingBooks} />
        ) : currentGroup === "__CALENDAR__" ? (
          <CalendarView
            tasks={tasks}
            groups={groups}
            onEdit={setEditingTask}
            onAddTask={(date) => setEditingTask({
              id: 0,
              description: "",
              due_date: date,
              group: "",
              details: "",
              completed: false,
              subtasks: []
            })}
          />
        ) : currentGroup === "__MEMOS__" ? (
          <MemoView />
        ) : currentGroup === "__READING_MEMOS__" ? (
          <ReadingMemoView />
        ) : currentGroup === "__GANTT__" ? (
          <GanttView tasks={tasks} onTaskUpdate={handleUpdateTask} />
        ) : (
          <>
            <div className="input-section">
              <TaskInput onAddTask={handleAddTask} existingGroups={groups} />
            </div>

            <div className="task-list-container">
              <TaskList
                tasks={tasks}
                currentGroup={currentGroup}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
                onEdit={setEditingTask}
                onTasksUpdate={setTasks}
              />
            </div>
          </>
        )}
      </div>

      {editingTask && (
        <EditDialog
          task={editingTask}
          existingGroups={groups}
          allTasks={tasks}
          onSave={handleSaveTask}
          onCancel={() => setEditingTask(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          theme={theme}
          onThemeChange={(newTheme) => {
            setTheme(newTheme);
            localStorage.setItem("theme", newTheme);
            document.documentElement.className = `theme-${newTheme}`;
          }}
        />
      )}
    </div>
  );
}

export default App;
