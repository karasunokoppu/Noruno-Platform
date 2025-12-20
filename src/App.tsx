import { useState, useEffect } from "react";
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
import type { Task, ReadingBook } from "./types";
import {
  addTask,
  completeTask,
  createGroups,
  deleteGroups,
  deleteTask,
  getGroups,
  getReadingBooks,
  getTasks,
  renameGroups,
  updateTask,
} from "./tauri/api";

// Reading Book interface for dashboard

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

  useEffect(() => {
    const handler = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);


  async function refreshData() {
    const loadedTasks = await getTasks();
    const loadedGroups = await getGroups();
    const loadedBooks = await getReadingBooks();
    setTasks(loadedTasks);
    setGroups(loadedGroups);
    setReadingBooks(loadedBooks);
  }

  const handleAddTask = async (
    desc: string,
    date: string,
    group: string,
    details: string,
    notificationMinutes?: number,
    startDate?: string,
  ) => {
    const newTasks = await addTask(
      desc,
      startDate,
      date,
      group,
      details,
      notificationMinutes,
      null,
    );
    setTasks(newTasks);
  };

  const handleDeleteTask = async (id: number) => {
    const newTasks = await deleteTask(id);
    setTasks(newTasks);
  };

  const handleCompleteTask = async (id: number) => {
    const newTasks = await completeTask(id);
    setTasks(newTasks);
  };

  const handleUpdateTask = async (task: Task) => {
    const newTasks = await updateTask(task);
    setTasks(newTasks);
    setEditingTask(null);
  };

  const handleAddGroup = async (name: string) => {
    const newGroups = await createGroups(name);
    setGroups(newGroups);
  };

  const handleDeleteGroup = async (name: string) => {
    const newGroups = await deleteGroups(name);
    setGroups(newGroups);
    // Also refresh tasks as some might have been updated (group cleared)
    const loadedTasks = await getTasks();
    setTasks(loadedTasks);

    if (currentGroup === name) {
      setCurrentGroup("__ALL__");
    }
  };

  const handleRenameGroup = async (oldName: string, newName: string) => {
    try {
      const res = await renameGroups(oldName, newName);
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
      await handleAddTask(
        task.description,
        task.due_date,
        task.group,
        task.details,
        task.notification_minutes,
      );
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
            onAddTask={(date) =>
              setEditingTask({
                id: 0,
                description: "",
                due_date: date,
                group: "",
                details: "",
                completed: false,
                subtasks: [],
              })
            }
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
