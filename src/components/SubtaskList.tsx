// サブタスク一覧コンポーネント

import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Task } from "../App";

interface SubtaskListProps {
    task: Task;
    onTasksUpdate: (tasks: Task[]) => void;
}

const SubtaskList: React.FC<SubtaskListProps> = ({ task, onTasksUpdate }) => {
    const [newSubtask, setNewSubtask] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddSubtask = async () => {
        if (!newSubtask.trim()) return;
        const newTasks = await invoke<Task[]>("add_subtask", {
            taskId: task.id,
            description: newSubtask.trim(),
        });
        onTasksUpdate(newTasks);
        setNewSubtask("");
        setIsAdding(false);
    };

    const handleToggleSubtask = async (subtaskId: number) => {
        const newTasks = await invoke<Task[]>("toggle_subtask", {
            taskId: task.id,
            subtaskId,
        });
        onTasksUpdate(newTasks);
    };

    const handleDeleteSubtask = async (subtaskId: number) => {
        const newTasks = await invoke<Task[]>("delete_subtask", {
            taskId: task.id,
            subtaskId,
        });
        onTasksUpdate(newTasks);
    };

    const completedCount = task.subtasks?.filter((s) => s.completed).length || 0;
    const totalCount = task.subtasks?.length || 0;

    return (
        <div className="subtask-list">
            {/* Progress bar */}
            {totalCount > 0 && (
                <div className="subtask-progress">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(completedCount / totalCount) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        {completedCount}/{totalCount}
                    </span>
                </div>
            )}

            {/* Subtask items */}
            {task.subtasks?.map((subtask) => (
                <div key={subtask.id} className="subtask-item">
                    <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask.id)}
                    />
                    <span className={subtask.completed ? "completed" : ""}>
                        {subtask.description}
                    </span>
                    <button
                        className="subtask-delete"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        title="Delete subtask"
                    >
                        ✕
                    </button>
                </div>
            ))}

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
                    <button onClick={handleAddSubtask}>Add</button>
                    <button onClick={() => setIsAdding(false)}>Cancel</button>
                </div>
            ) : (
                <button className="add-subtask-btn" onClick={() => setIsAdding(true)}>
                    + Add Subtask
                </button>
            )}
        </div>
    );
};

export default SubtaskList;
