// Sidebar component
// Located in src/components/sidebar/Sidebar.tsx
// This component renders the navigation sidebar with group selection and settings access.

import React from "react";
import { Task } from "../../App";

interface SidebarProps {
    tasks: Task[];
    groups: string[];
    currentGroup: string;
    onSelectGroup: (group: string) => void;
    onAddGroup: (name: string) => void;
    onDeleteGroup: (name: string) => void;
    onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tasks, groups, currentGroup, onSelectGroup, onAddGroup, onDeleteGroup, onOpenSettings }) => {
    const hasNoGroup = tasks.some(t => !t.group);
    const [newGroupName, setNewGroupName] = React.useState("");
    const [isAdding, setIsAdding] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

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

    return (
        <div className="sidebar">
            <div className={`sidebar-item ${currentGroup === "__ALL__" ? "active" : ""}`} onClick={() => onSelectGroup("__ALL__")}>📋 All Tasks</div>
            <div className={`sidebar-item ${currentGroup === "__DASHBOARD__" ? "active" : ""}`} onClick={() => onSelectGroup("__DASHBOARD__")}>📊 Dashboard</div>
            <div className={`sidebar-item ${currentGroup === "__CALENDAR__" ? "active" : ""}`} onClick={() => onSelectGroup("__CALENDAR__")}>📅 Calendar</div>
            <div className={`sidebar-item ${currentGroup === "__MEMOS__" ? "active" : ""}`} onClick={() => onSelectGroup("__MEMOS__")}>📝 Memos</div>
            <div className={`sidebar-item ${currentGroup === "__READING_MEMOS__" ? "active" : ""}`} onClick={() => onSelectGroup("__READING_MEMOS__")}>📚 Reading Memos</div>
            <div className="sidebar-divider" style={{ margin: "10px 0", borderBottom: "1px solid #3a3a3a" }} />
            <div className="groups-header" style={{ padding: "0 10px", marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8em", color: "#888" }}>GROUPS</span>
                <button onClick={() => setIsAdding(!isAdding)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1.2em" }}>+</button>
            </div>
            {isAdding && (
                <div style={{ padding: "0 10px", marginBottom: "10px", display: "flex", alignItems: "center" }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        placeholder="New Group"
                        style={{ width: "100%", marginRight: "5px", padding: "2px 5px", background: "#333", border: "none", color: "white" }}
                        onKeyDown={e => { if (e.key === "Enter") handleAddGroup(); if (e.key === "Escape") handleCancelAdd(); }}
                    />
                    <button onClick={handleCancelAdd} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "1.2em", padding: "0" }} title="Cancel">✕</button>
                </div>
            )}
            {groups.map(group => (
                <div key={group} className={`sidebar-item ${currentGroup === group ? "active" : ""}`} onClick={() => onSelectGroup(group)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center" }}><span>📁</span> {group}</div>
                    <button onClick={e => { e.stopPropagation(); if (confirm(`Delete group "${group}"?`)) onDeleteGroup(group); }} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "0.8em", padding: "0 5px" }} className="delete-group-btn">✕</button>
                </div>
            ))}
            {hasNoGroup && (
                <div className={`sidebar-item ${currentGroup === "__NO_GROUP__" ? "active" : ""}`} onClick={() => onSelectGroup("__NO_GROUP__")}>📄 No Group</div>
            )}
            <div className="sidebar-divider" style={{ margin: "10px 0", borderBottom: "1px solid #3a3a3a" }} />
            <div className="sidebar-item" onClick={onOpenSettings} style={{ marginBottom: "10px" }}>⚙️ Settings</div>
        </div>
    );
};

export default Sidebar;
