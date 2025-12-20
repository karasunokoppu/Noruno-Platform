import React, { useState } from "react";
import { Task } from "../types";
import SubtaskList from "./SubtaskList";

interface TaskRowProps {
  task: Task;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onTasksUpdate: (tasks: Task[]) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onDelete,
  onComplete,
  onEdit,
  onTasksUpdate,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <div className="task-row">
      <div className="task-row-header">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={() => onComplete(task.id)}
        />

        <div className="task-content" onClick={toggleExpand}>
          <div className={`task-title ${task.completed ? "completed" : ""}`}>
            {task.description}
            {hasSubtasks && (
              <span className="task-subtask-badge">
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
            <span className="task-expand-icon">
              {expanded ? "▲" : "▼"}
            </span>
          </div>
          {(task.due_date || task.group) && (
            <div className="task-meta">
              {task.due_date && `Due: ${task.due_date}`}
              {task.due_date && task.group && " | "}
              {task.group && `Group: ${task.group}`}
            </div>
          )}
        </div>

        <div className="task-actions">
          <button className="task-edit-btn" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button
            className="task-delete-btn"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      </div>

      {expanded && (
        <div className="task-details-section">
          {task.details && (
            <div>
              <div className="task-details-label">Details:</div>
              <div className="task-details-text">{task.details}</div>
            </div>
          )}
          <SubtaskList task={task} onTasksUpdate={onTasksUpdate} />
        </div>
      )}
    </div>
  );
};

export default TaskRow;
