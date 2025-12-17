import React, { useState } from 'react';
import { Task } from '../types';
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

    const buttonBaseClass = "px-2.5 py-2.5 rounded-md border-none font-bold cursor-pointer transition-colors duration-200 text-sm";
    const editBtnClass = `${buttonBaseClass} bg-bg-active text-text-primary hover:bg-bg-hover`;
    const deleteBtnClass = `${buttonBaseClass} bg-danger text-white hover:bg-danger-hover`;

    return (
        <div className="bg-bg-secondary rounded-lg mb-2.5 p-4 transition-transform duration-100 shadow border border-border-primary hover:-translate-y-[1px] hover:shadow-[0_4px_8px_var(--shadow)]">
            <div className="flex items-center gap-[15px]">
                <input
                    type="checkbox"
                    className="appearance-none w-5 h-5 border border-gray-500 rounded bg-transparent checked:bg-accent-primary checked:border-accent-primary cursor-pointer transition-all duration-200 flex-shrink-0 bg-center bg-no-repeat bg-[length:14px_14px] checked:bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%2220%206%209%2017%204%2012%22%2F%3E%3C%2Fsvg%3E')]"
                    checked={task.completed}
                    onChange={() => onComplete(task.id)}
                />

                <div className="flex-1 cursor-pointer" onClick={toggleExpand}>
                    <div className={`text-base font-medium ${task.completed ? "line-through text-text-tertiary" : "text-text-primary"}`}>
                        {task.description}
                        {hasSubtasks && (
                            <span className="ml-2 text-xs bg-bg-tertiary px-1.5 py-0.5 rounded text-text-secondary">
                                {completedSubtasks}/{totalSubtasks}
                            </span>
                        )}
                        <span className="text-xs ml-2 text-text-disabled">
                            {expanded ? "▲" : "▼"}
                        </span>
                    </div>
                    {(task.due_date || task.group) && (
                        <div className="text-xs text-text-secondary mt-1 italic">
                            {task.due_date && `Due: ${task.due_date}`}
                            {task.due_date && task.group && " | "}
                            {task.group && `Group: ${task.group}`}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button className={editBtnClass} onClick={() => onEdit(task)}>Edit</button>
                    <button className={`${deleteBtnClass} task-delete`} onClick={() => onDelete(task.id)}>Delete</button>
                </div>
            </div>

            {expanded && (
                <div className="mt-2.5">
                    {task.details && (
                        <div className="mt-2.5 pt-2.5 border-t border-border-primary animate-[slideDown_0.2s_ease-out]">
                            <div className="text-xs font-bold text-text-tertiary mb-1">Details:</div>
                            <div className="text-sm whitespace-pre-wrap text-text-primary">{task.details}</div>
                        </div>
                    )}
                    <SubtaskList task={task} onTasksUpdate={onTasksUpdate} />
                </div>
            )}
        </div >
    );
};

export default TaskRow;
