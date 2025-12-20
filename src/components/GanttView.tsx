import React, { useState, useEffect } from "react";
import { ViewMode, Gantt, Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Task } from "./../types";
import CustomDropdown from "./CustomDropdown";

interface GanttViewProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
}

type SortOption = "default" | "startDate" | "dueDate" | "name";

const GanttView: React.FC<GanttViewProps> = ({ tasks, onTaskUpdate }) => {
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [collapsedProjects, setCollapsedProjects] = useState<string[]>([]);

  useEffect(() => {
    // Only include tasks that have both start_date and due_date set and are valid dates
    const filtered = tasks.filter((t) => {
      if (!t.start_date || !t.due_date) return false;
      const s = new Date(t.start_date);
      const e = new Date(t.due_date);
      return !isNaN(s.getTime()) && !isNaN(e.getTime());
    });

    // Build gantt tasks grouped by Task.group. Each group becomes a `project` task,
    // and member tasks are regular `task` entries with `project` set to the project's id.
    const groupsMap: Record<string, Task[]> = {};
    const ungrouped: Task[] = [];
    filtered.forEach((t) => {
      const key = (t.group || "").trim();
      if (key) {
        if (!groupsMap[key]) groupsMap[key] = [];
        groupsMap[key].push(t);
      } else {
        ungrouped.push(t);
      }
    });

    const newGanttTasks: GanttTask[] = [];

    // Helper to create GanttTask from Task
    const makeTask = (task: Task, projectId?: string): GanttTask => {
      let endDate = new Date(task.due_date);
      if (isNaN(endDate.getTime())) endDate = new Date();

      let startDate = new Date();
      if (task.start_date) {
        const parsed = new Date(task.start_date);
        if (!isNaN(parsed.getTime())) startDate = parsed;
      } else {
        if (endDate > new Date()) startDate = new Date();
        else startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      }

      if (startDate >= endDate)
        startDate = new Date(endDate.getTime() - 60 * 60 * 1000);

      const progress =
        task.subtasks && task.subtasks.length > 0
          ? Math.round(
            (task.subtasks.filter((s) => s.completed).length /
              task.subtasks.length) *
            100,
          )
          : task.completed
            ? 100
            : 0;

      const dependencies = task.dependencies?.map((d) => d.toString());

      const out: GanttTask = {
        start: startDate,
        end: endDate,
        name: task.description,
        id: task.id.toString(),
        type: "task",
        progress: progress,
        isDisabled: false,
        // Use theme variables so color follows current theme
        styles: {
          progressColor: "var(--accent-primary)",
          progressSelectedColor: "var(--accent-primary)",
        },
        dependencies: dependencies,
      };
      if (projectId) out.project = projectId;
      return out;
    };

    // Create project entries for each non-empty group
    Object.keys(groupsMap).forEach((groupName, idx) => {
      const members = groupsMap[groupName];
      // compute min start and max end
      const starts = members
        .map((m) => new Date(m.start_date || m.due_date))
        .filter((d) => !isNaN(d.getTime()));
      const ends = members
        .map((m) => new Date(m.due_date))
        .filter((d) => !isNaN(d.getTime()));
      const projStart = new Date(Math.min(...starts.map((d) => d.getTime())));
      const projEnd = new Date(Math.max(...ends.map((d) => d.getTime())));
      const projectId = `project-${idx}-${groupName}`;

      // project progress: average of member progresses
      const progValues = members.map((m) => {
        if (m.subtasks && m.subtasks.length > 0)
          return Math.round(
            (m.subtasks.filter((s) => s.completed).length / m.subtasks.length) *
            100,
          );
        return m.completed ? 100 : 0;
      });
      const avgProgress =
        progValues.length > 0
          ? Math.round(
            progValues.reduce((a, b) => a + b, 0) / progValues.length,
          )
          : 0;

      newGanttTasks.push({
        id: projectId,
        name: groupName,
        start: projStart,
        end: projEnd,
        type: "project",
        progress: avgProgress,
        isDisabled: false,
        styles: { backgroundColor: "var(--accent-light)" },
        hideChildren: collapsedProjects.includes(projectId),
      });

      // add member tasks with project assigned
      members.forEach((m) => newGanttTasks.push(makeTask(m, projectId)));
    });

    // Add ungrouped tasks after grouped ones
    ungrouped.forEach((u) => newGanttTasks.push(makeTask(u)));

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
  }, [tasks, sortOption, collapsedProjects]);

  const onDateChange = (task: GanttTask) => {
    const originalTask = tasks.find((t) => t.id.toString() === task.id);
    if (originalTask) {
      // ... (keeping existing date logic)
      const formatDate = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
      };

      const updatedTask = {
        ...originalTask,
        start_date: formatDate(task.start),
        due_date: formatDate(task.end),
      };

      onTaskUpdate(updatedTask);
    }
  };

  return (
    <div className="gantt-container gantt-theme">
      <div className="gantt-toolbar">
        <div className="gantt-view-buttons">
          <button
            className={`gantt-view-btn ${viewMode === ViewMode.Day ? "active" : ""}`}
            onClick={() => setViewMode(ViewMode.Day)}
          >
            Day
          </button>
          <button
            className={`gantt-view-btn ${viewMode === ViewMode.Week ? "active" : ""}`}
            onClick={() => setViewMode(ViewMode.Week)}
          >
            Week
          </button>
          <button
            className={`gantt-view-btn ${viewMode === ViewMode.Month ? "active" : ""}`}
            onClick={() => setViewMode(ViewMode.Month)}
          >
            Month
          </button>
        </div>

        <div className="gantt-sort-section">
          <label className="gantt-sort-label">Sort:</label>
          <CustomDropdown
            value={sortOption}
            onChange={(v) => setSortOption(v as SortOption)}
            options={[
              { value: "default", label: "Default" },
              { value: "startDate", label: "Start Date" },
              { value: "dueDate", label: "Due Date" },
              { value: "name", label: "Name" },
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
          // ganttHeight={700}
          // set global progress bar colors (normal and selected)
          barProgressColor={"var(--accent-primary)"}
          barProgressSelectedColor={"var(--accent-primary)"}
          onExpanderClick={(task) => {
            if (task.type === "project") {
              const id = task.id;
              setCollapsedProjects((prev) =>
                prev.includes(id)
                  ? prev.filter((p) => p !== id)
                  : [...prev, id],
              );
            }
          }}
        />
      ) : (
        <div className="gantt-empty">
          No tasks to display
        </div>
      )}
    </div>
  );
};

export default GanttView;
