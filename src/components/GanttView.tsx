import React, { useState, useEffect } from "react";
import { ViewMode, Gantt, Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Task } from "../App";
import CustomDropdown from './CustomDropdown';


interface GanttViewProps {
    tasks: Task[];
    onTaskUpdate: (task: Task) => void;
}

type SortOption = "default" | "startDate" | "dueDate" | "name";

const GanttView: React.FC<GanttViewProps> = ({ tasks, onTaskUpdate }) => {
    const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
    const [sortOption, setSortOption] = useState<SortOption>("default");

    useEffect(() => {
        let newGanttTasks: GanttTask[] = tasks.map((task) => {
            let endDate = new Date(task.due_date);
            // Handle invalid end date (e.g. empty string)
            if (isNaN(endDate.getTime())) {
                endDate = new Date(); // Default to now if invalid
            }

            let startDate = new Date();
            if (task.start_date) {
                const parsedStart = new Date(task.start_date);
                if (!isNaN(parsedStart.getTime())) {
                    startDate = parsedStart;
                }
            } else {
                if (endDate > new Date()) {
                    startDate = new Date();
                } else {
                    startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                }
            }

            if (startDate >= endDate) {
                startDate = new Date(endDate.getTime() - 60 * 60 * 1000);
            }

            // Calculate progress based on subtasks
            let progress = 0;
            if (task.subtasks && task.subtasks.length > 0) {
                const completedCount = task.subtasks.filter(s => s.completed).length;
                progress = Math.round((completedCount / task.subtasks.length) * 100);
            } else {
                progress = task.completed ? 100 : 0;
            }

            // Map dependencies (number[] -> string[])
            const dependencies = task.dependencies?.map(d => d.toString());

            return {
                start: startDate,
                end: endDate,
                name: task.description,
                id: task.id.toString(),
                type: "task",
                progress: progress,
                isDisabled: false,
                styles: { progressColor: "#ffbb54", progressSelectedColor: "#ff9e0d" },
                dependencies: dependencies,
            };
        });

        // Sorting
        if (sortOption === "startDate") {
            newGanttTasks.sort((a, b) => a.start.getTime() - b.start.getTime());
        } else if (sortOption === "dueDate") {
            newGanttTasks.sort((a, b) => a.end.getTime() - b.end.getTime());
        } else if (sortOption === "name") {
            newGanttTasks.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            // Default: ID
            newGanttTasks.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        }

        if (newGanttTasks.length > 0) {
            setGanttTasks(newGanttTasks);
        } else {
            setGanttTasks([]);
        }
    }, [tasks, sortOption]);

    const onDateChange = (task: GanttTask) => {
        const originalTask = tasks.find((t) => t.id.toString() === task.id);
        if (originalTask) {
            // ... (keeping existing date logic)
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
        <div className="p-4 bg-bg-primary h-full overflow-auto gantt-theme">
            <div className="mb-4 flex gap-4 items-center justify-between">
                <div className="flex gap-2">
                    <button className={`px-3 py-1 rounded border border-border-primary text-text-primary ${viewMode === ViewMode.Day ? 'bg-accent-primary' : 'bg-bg-secondary'}`} onClick={() => setViewMode(ViewMode.Day)}>Day</button>
                    <button className={`px-3 py-1 rounded border border-border-primary text-text-primary ${viewMode === ViewMode.Week ? 'bg-accent-primary' : 'bg-bg-secondary'}`} onClick={() => setViewMode(ViewMode.Week)}>Week</button>
                    <button className={`px-3 py-1 rounded border border-border-primary text-text-primary ${viewMode === ViewMode.Month ? 'bg-accent-primary' : 'bg-bg-secondary'}`} onClick={() => setViewMode(ViewMode.Month)}>Month</button>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-text-secondary text-sm">Sort:</label>
                    <CustomDropdown
                        value={sortOption}
                        onChange={(v) => setSortOption(v as SortOption)}
                        options={[
                            { value: 'default', label: 'Default' },
                            { value: 'startDate', label: 'Start Date' },
                            { value: 'dueDate', label: 'Due Date' },
                            { value: 'name', label: 'Name' },
                        ]}
                        placeholder="Sort..."
                        style={{ minWidth: 140 }}
                    />
                </div>
            </div>
            {ganttTasks.length > 0 ? (
                <Gantt
                    locale="ja"
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    onDateChange={onDateChange}
                    listCellWidth="155px"
                    columnWidth={60}
                    barFill={60}
                    ganttHeight={700}
                />
            ) : (
                <div className="text-text-secondary mt-10 text-center">No tasks to display</div>
            )}
        </div>
    );
};

export default GanttView;
