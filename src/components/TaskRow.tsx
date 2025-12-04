import React, { useState } from 'react';
import { Task } from '../App';
import SubtaskList from './SubtaskList';

interface TaskRowProps {
    task: Task;
    onDelete: (id: number) => void;
    onComplete: (id: number) => void;
    onEdit: (task: Task) => void;
    onTasksUpdate: (tasks: Task[]) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onDelete, onComplete, onEdit, onTasksUpdate }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    return (
        <div className="task-row">
            <div className="task-header">
                <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => onComplete(task.id)}
                />

                <div className="task-info" onClick={toggleExpand}>
                    <div className={`task-desc ${task.completed ? "completed" : ""}`}>
                        {task.description}
                        {hasSubtasks && (
                            <span className="subtask-badge">
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        )}
                        <span style={{ fontSize: "12px", marginLeft: "8px", color: "#666" }}>
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
                    <button className="secondary" onClick={() => onEdit(task)}>Edit</button>
                    <button className="danger" onClick={() => onDelete(task.id)}>Delete</button>
                </div>
            </div>

            {expanded && (
                <div className="task-expanded">
                    {task.details && (
                        <div className="details-section">
                            <div className="details-label">Details:</div>
                            <div className="details-text">{task.details}</div>
                        </div>
                    )}
                    <SubtaskList task={task} onTasksUpdate={onTasksUpdate} />
                </div>
            )}
        </div >
    );
};

export default TaskRow;
