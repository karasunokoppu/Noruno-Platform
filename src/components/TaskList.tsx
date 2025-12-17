import React from 'react';
import { Task } from '../types';
import TaskRow from './TaskRow';

interface TaskListProps {
    tasks: Task[];
    currentGroup: string;
    onDelete: (id: number) => void;
    onComplete: (id: number) => void;
    onEdit: (task: Task) => void;
    onTasksUpdate: (tasks: Task[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, currentGroup, onDelete, onComplete, onEdit, onTasksUpdate }) => {
    const filteredTasks = tasks.filter(task => {
        if (currentGroup === "__ALL__") return true;
        if (currentGroup === "__NO_GROUP__") return !task.group;
        return task.group === currentGroup;
    }).sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
    });

    return (
        <div className="task-list">
            {filteredTasks.map(task => (
                <TaskRow
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    onComplete={onComplete}
                    onEdit={onEdit}
                    onTasksUpdate={onTasksUpdate}
                />
            ))}
        </div>
    );
};

export default TaskList;
