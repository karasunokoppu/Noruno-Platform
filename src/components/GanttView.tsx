import React, { useState, useEffect } from "react";
import { ViewMode, Gantt, Task as GanttTask, EventOption } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Task } from "../App";

interface GanttViewProps {
    tasks: Task[];
    onTaskUpdate: (task: Task) => void;
}

const GanttView: React.FC<GanttViewProps> = ({ tasks, onTaskUpdate }) => {
    const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

    useEffect(() => {
        const newGanttTasks: GanttTask[] = tasks.map((task) => {
            // Use start_date if available, otherwise default to now or create date logic
            // Ideally, we need a start date. If missing, maybe use due_date - 1 day?
            // For now, let's assume due_date is end, and start is today or existing start_date.

            const endDate = new Date(task.due_date);
            let startDate = new Date();
            if (task.start_date) {
                startDate = new Date(task.start_date);
            } else {
                // Default start to 1 hour before end if only due date exists, or simply now.
                // If end date is in future, start is now.
                // If end date is past, start is 1 day before end.
                if (endDate > new Date()) {
                    startDate = new Date();
                } else {
                    startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                }
            }

            // Ensure start < end
            if (startDate >= endDate) {
                startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
            }

            return {
                start: startDate,
                end: endDate,
                name: task.description,
                id: task.id.toString(),
                type: "task",
                progress: task.completed ? 100 : 0,
                isDisabled: false,
                styles: { progressColor: "#ffbb54", progressSelectedColor: "#ff9e0d" },
            };
        });

        // Check if we have tasks. If 0, we can't render Gantt correctly usually without dummy
        if (newGanttTasks.length > 0) {
            setGanttTasks(newGanttTasks);
        } else {
            setGanttTasks([]);
        }
    }, [tasks]);

    const handleTaskChange = (task: GanttTask) => {
        // Find original task
        const originalTask = tasks.find((t) => t.id.toString() === task.id);
        if (originalTask) {
            // Update dates
            // Note: Gantt library updates start/end in local time Date objects

            // Format to string YYYY-MM-DD HH:MM
            // Helper to format
            const format = (d: Date) => d.toISOString(); // Or localized format expected by backend

            // For now, let's keep simplistic and just log or pseudo-update
            // To really update, we need to convert back to the string format our backend expects
            // Backend expects naive strings effectively or depends on parsing.

            // Let's rely on simple string conversion for MVP
            // In reality we should format carefully matching backend expectations
        }
    };

    const onDateChange = (task: GanttTask) => {
        const originalTask = tasks.find((t) => t.id.toString() === task.id);
        if (originalTask) {
            const newStart = task.start.toISOString();
            // We likely want YYYY-MM-DD or YYYY-MM-DD HH:MM depending on backend
            // Backend uses String. task_commands.rs parses using %Y-%m-%d %H:%M or %Y-%m-%d

            const formatDate = (date: Date) => {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const dd = String(date.getDate()).padStart(2, '0');
                const hh = String(date.getHours()).padStart(2, '0');
                const min = String(date.getMinutes()).padStart(2, '0');
                return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
            };

            const updatedTask = {
                ...originalTask,
                start_date: formatDate(task.start),
                due_date: formatDate(task.end),
            };

            onTaskUpdate(updatedTask);
        }
    }

    return (
        <div className="p-4 bg-bg-primary h-full overflow-auto">
            <div className="mb-4 flex gap-2">
                <button className="px-3 py-1 bg-bg-secondary rounded border border-border-primary text-text-primary" onClick={() => setViewMode(ViewMode.Day)}>Day</button>
                <button className="px-3 py-1 bg-bg-secondary rounded border border-border-primary text-text-primary" onClick={() => setViewMode(ViewMode.Week)}>Week</button>
                <button className="px-3 py-1 bg-bg-secondary rounded border border-border-primary text-text-primary" onClick={() => setViewMode(ViewMode.Month)}>Month</button>
            </div>
            {ganttTasks.length > 0 ? (
                <Gantt
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    onDateChange={onDateChange}
                    // onProgressChange={handleProgressChange} // If we want to support progress drag
                    // onDoubleClick={handleDblClick}
                    // onDelete={handleDelete}
                    listCellWidth="155px"
                    columnWidth={60}
                />
            ) : (
                <div className="text-text-secondary">No tasks to display</div>
            )}
        </div>
    );
};

export default GanttView;
