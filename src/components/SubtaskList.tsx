// サブタスク一覧コンポーネント

import React, { useState } from "react";
import { Task } from "../types";
import { addSubtask, deleteSubtask, toggleSubtask, updateSubtask } from "../tauri/api";
import ContextMenu, { ContextMenuItem } from "./ui/ContextMenu";

interface SubtaskListProps {
  task: Task;
  onTasksUpdate: (tasks: Task[]) => void;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  subtaskId: number | null;
  subtaskDescription: string;
  subtaskCompleted: boolean;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ task, onTasksUpdate }) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    subtaskId: null,
    subtaskDescription: "",
    subtaskCompleted: false,
  });

  const handleContextMenu = (
    e: React.MouseEvent,
    subtaskId: number,
    description: string,
    completed: boolean
  ) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      subtaskId,
      subtaskDescription: description,
      subtaskCompleted: completed,
    });
  };

  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

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

  const startEdit = (subtaskId: number, currentDescription: string) => {
    setEditingId(subtaskId);
    setEditDescription(currentDescription);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDescription("");
  };

  const handleUpdateSubtask = async (subtaskId: number, completed: boolean) => {
    if (!editDescription.trim()) {
      cancelEdit();
      return;
    }
    try {
      const newTasks = await updateSubtask(
        task.id,
        subtaskId,
        editDescription.trim(),
        completed
      );
      onTasksUpdate(newTasks);
      cancelEdit();
    } catch (error) {
      console.error("Failed to update subtask:", error);
    }
  };

  const getContextMenuItems = (): ContextMenuItem[] => {
    if (contextMenu.subtaskId === null) return [];

    const subtaskId = contextMenu.subtaskId;
    const description = contextMenu.subtaskDescription;

    return [
      {
        label: "編集",
        onClick: () => startEdit(subtaskId, description),
      },
      {
        label: "削除",
        onClick: () => handleDeleteSubtask(subtaskId),
        danger: true,
      },
    ];
  };

  const completedCount = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalCount = task.subtasks?.length || 0;

  return (
    <div className="subtask-container">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="subtask-progress">
          <div className="subtask-progress-bar">
            <div
              className="subtask-progress-fill"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="subtask-progress-text">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Subtask items */}
      {task.subtasks?.map((subtask) => (
        <div
          key={subtask.id}
          className="subtask-item"
          onContextMenu={(e) =>
            handleContextMenu(e, subtask.id, subtask.description, subtask.completed)
          }
        >
          {editingId === subtask.id ? (
            // Edit mode
            <>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="subtask-edit-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateSubtask(subtask.id, subtask.completed);
                  }
                  if (e.key === "Escape") {
                    cancelEdit();
                  }
                }}
                autoFocus
              />
              <button
                className="subtask-btn primary"
                onClick={() => handleUpdateSubtask(subtask.id, subtask.completed)}
              >
                Save
              </button>
              <button
                className="subtask-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            </>
          ) : (
            // View mode
            <>
              <input
                type="checkbox"
                className="subtask-checkbox"
                checked={subtask.completed}
                onChange={() => handleToggleSubtask(subtask.id)}
              />
              <span
                className={`subtask-text ${subtask.completed ? "completed" : ""}`}
                onDoubleClick={() => startEdit(subtask.id, subtask.description)}
              >
                {subtask.description}
              </span>
              <button
                className="subtask-action-btn edit"
                onClick={() => startEdit(subtask.id, subtask.description)}
                title="Edit subtask"
              >
                ✎
              </button>
              <button
                className="subtask-action-btn delete"
                onClick={() => handleDeleteSubtask(subtask.id)}
                title="Delete subtask"
              >
                ✕
              </button>
            </>
          )}
        </div>
      ))}

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}

      {/* Add subtask */}
      {isAdding ? (
        <div className="subtask-add-form">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Enter subtask..."
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
            className="subtask-btn"
            onClick={handleAddSubtask}
          >
            Add
          </button>
          <button
            className="subtask-btn"
            onClick={() => setIsAdding(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="subtask-add-link"
          onClick={() => setIsAdding(true)}
        >
          + Add Subtask
        </button>
      )}
    </div>
  );
};

export default SubtaskList;
