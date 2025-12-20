// Sidebar component
// Located in src/components/sidebar/Sidebar.tsx
// This component renders the navigation sidebar with group selection and settings access.

import React from "react";
import { Task } from "../../types";
import ContextMenu from "../ui/ContextMenu";

interface SidebarProps {
  tasks: Task[];
  groups: string[];
  currentGroup: string;
  onSelectGroup: (group: string) => void;
  onAddGroup: (name: string) => void;
  onDeleteGroup: (name: string) => void;
  onRenameGroup: (oldName: string, newName: string) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  tasks,
  groups,
  currentGroup,
  onSelectGroup,
  onAddGroup,
  onDeleteGroup,
  onRenameGroup,
  onOpenSettings,
}) => {
  const hasNoGroup = tasks.some((t) => !t.group);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [isAdding, setIsAdding] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    group: string | null;
  } | null>(null);

  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  // Context menu lifecycle handled by shared ContextMenu component

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName("");
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setNewGroupName("");
    setIsAdding(false);
  };

  const getItemClass = (isActive: boolean) =>
    `sidebar-item ${isActive ? "active" : ""}`;

  return (
    <div className="sidebar-container">
      <div
        className={getItemClass(currentGroup === "__ALL__")}
        onClick={() => onSelectGroup("__ALL__")}
      >
        📋 All Tasks
      </div>
      <div
        className={getItemClass(currentGroup === "__DASHBOARD__")}
        onClick={() => onSelectGroup("__DASHBOARD__")}
      >
        📊 Dashboard
      </div>
      <div
        className={getItemClass(currentGroup === "__CALENDAR__")}
        onClick={() => onSelectGroup("__CALENDAR__")}
      >
        📅 Calendar
      </div>
      <div
        className={getItemClass(currentGroup === "__GANTT__")}
        onClick={() => onSelectGroup("__GANTT__")}
      >
        💹 Gantt Chart
      </div>
      <div
        className={getItemClass(currentGroup === "__MEMOS__")}
        onClick={() => onSelectGroup("__MEMOS__")}
      >
        📝 Memos
      </div>
      <div
        className={getItemClass(currentGroup === "__READING_MEMOS__")}
        onClick={() => onSelectGroup("__READING_MEMOS__")}
      >
        📚 Reading Memos
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section-header">
        <span className="sidebar-section-title">GROUPS</span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="sidebar-add-btn"
        >
          +
        </button>
      </div>

      {isAdding && (
        <div className="sidebar-group-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New Group"
            className="sidebar-group-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddGroup();
              if (e.key === "Escape") handleCancelAdd();
            }}
          />
          <button
            onClick={handleCancelAdd}
            className="sidebar-cancel-btn"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      )}

      {groups.map((group) => (
        <div
          key={group}
          className={`${getItemClass(currentGroup === group)} justify-between`}
          onClick={() => onSelectGroup(group)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, group });
          }}
        >
          <div className="sidebar-group-content">
            <span>📁</span> {group}
          </div>
          <div className="sidebar-group-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete group "${group}"?`)) onDeleteGroup(group);
              }}
              className="sidebar-delete-btn"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: "Rename",
              onClick: () => {
                const g = contextMenu.group as string;
                const newName = prompt(`Rename group "${g}" to:`, g);
                if (newName && newName.trim() && newName.trim() !== g)
                  onRenameGroup(g, newName.trim());
              },
            },
            {
              label: "Delete",
              danger: true,
              onClick: () => {
                const g = contextMenu.group as string;
                if (confirm(`Delete group "${g}"?`)) onDeleteGroup(g);
              },
            },
          ]}
        />
      )}

      {hasNoGroup && (
        <div
          className={getItemClass(currentGroup === "__NO_GROUP__")}
          onClick={() => onSelectGroup("__NO_GROUP__")}
        >
          📄 No Group
        </div>
      )}

      <div className="sidebar-divider" />

      <div className={getItemClass(false)} onClick={onOpenSettings}>
        ⚙️ Settings
      </div>
    </div>
  );
};

export default Sidebar;
