import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
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
  due_date: string;
  group: string;
  details: string;
  completed: boolean;
  notification_minutes?: number;
  subtasks: Subtask[];
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

  const handleAddTask = async (desc: string, date: string, group: string, details: string, notificationMinutes?: number) => {
    const newTasks = await invoke<Task[]>("add_task", {
      description: desc,
      dueDate: date,
      group: group,
      details: details,
      notificationMinutes: notificationMinutes || null,
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
      dueDate: task.due_date,
      group: task.group,
      details: task.details,
      notificationMinutes: task.notification_minutes || null,
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

  return (
    <div className="container">
      <div className="sidebar-container">
        <Sidebar
          tasks={tasks} // Keep for counts if needed, or remove if not used
          groups={groups}
          currentGroup={currentGroup}
          onSelectGroup={setCurrentGroup}
          onAddGroup={handleAddGroup}
          onDeleteGroup={handleDeleteGroup}
          onOpenSettings={() => setShowSettings(true)}
        />
      </div>

      <div className="main-content">
        {currentGroup === "__DASHBOARD__" ? (
          <DashboardView tasks={tasks} readingBooks={readingBooks} />
        ) : currentGroup === "__CALENDAR__" ? (
          <CalendarView tasks={tasks} groups={groups} onEdit={setEditingTask} />
        ) : currentGroup === "__MEMOS__" ? (
          <MemoView />
        ) : currentGroup === "__READING_MEMOS__" ? (
          <ReadingMemoView />
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

      {editingTask && ( //editingTaskが真(値がセットされている)場合に描画する。
        <EditDialog
          task={editingTask}
          existingGroups={groups}
          onSave={handleUpdateTask}
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
