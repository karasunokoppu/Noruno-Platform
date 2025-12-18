// サブタスク一覧コンポーネント

import React, { useState } from "react";
import { Task } from "../types";
import { addSubtask, deleteSubtask, toggleSubtask } from "../tauri/api";

interface SubtaskListProps {
  task: Task;
  onTasksUpdate: (tasks: Task[]) => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ task, onTasksUpdate }) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;
    const newTasks = await addSubtask(task.id, newSubtask.trim());
    onTasksUpdate(newTasks);
    setNewSubtask("");
    setIsAdding(false);
  };

  const handleToggleSubtask = async (subtaskId: number) => {
    const newTasks = await toggleSubtask(task.id, subtaskId);
    onTasksUpdate(newTasks);
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    const newTasks = await deleteSubtask(task.id, subtaskId);
    onTasksUpdate(newTasks);
  };

  const completedCount = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalCount = task.subtasks?.length || 0;

  return (
    <div className="mt-2">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 mb-2 text-xs text-text-secondary">
          <div className="flex-1 h-1 bg-border-primary rounded overflow-hidden">
            <div
              className="h-full bg-accent-primary transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="min-w-[40px]">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Subtask items */}
      {task.subtasks?.map((subtask) => (
        <div
          key={subtask.id}
          className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-bg-hover transition-colors group"
        >
          <input
            type="checkbox"
            className="appearance-none w-4 h-4 border border-gray-500 rounded bg-transparent checked:bg-accent-primary checked:border-accent-primary cursor-pointer transition-all duration-200 flex-shrink-0 bg-center bg-no-repeat bg-[length:12px_12px] checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%2220%206%209%2017%204%2012%22%2F%3E%3C%2Fsvg%3E')]"
            checked={subtask.completed}
            onChange={() => handleToggleSubtask(subtask.id)}
          />
          <span
            className={`flex-1 text-sm ${subtask.completed ? "line-through text-text-tertiary" : ""}`}
          >
            {subtask.description}
          </span>
          <button
            className="opacity-0 bg-transparent border-none text-text-tertiary cursor-pointer text-xs px-1.5 transition-opacity group-hover:opacity-100 hover:text-danger"
            onClick={() => handleDeleteSubtask(subtask.id)}
            title="Delete subtask"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add subtask */}
      {isAdding ? (
        <div className="flex gap-2 mb-2 items-center mt-1">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Enter subtask..."
            className="flex-1 p-1.5 text-sm rounded border border-border-primary bg-bg-tertiary text-text-primary focus:outline-none focus:border-accent-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddSubtask();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewSubtask("");
              }
            }}
            autoFocus
          />
          <button
            className="px-2 py-1 text-xs rounded border border-border-primary bg-bg-tertiary text-text-primary cursor-pointer hover:bg-bg-hover"
            onClick={handleAddSubtask}
          >
            Add
          </button>
          <button
            className="px-2 py-1 text-xs rounded border border-border-primary bg-bg-tertiary text-text-primary cursor-pointer hover:bg-bg-hover"
            onClick={() => setIsAdding(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="mt-1 text-xs text-accent-primary bg-transparent border-none cursor-pointer p-0 hover:underline flex items-center gap-1"
          onClick={() => setIsAdding(true)}
        >
          + Add Subtask
        </button>
      )}
    </div>
  );
};

export default SubtaskList;
