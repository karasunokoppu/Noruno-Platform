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
    onRenameGroup: (oldName: string, newName: string) => void;
    onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tasks, groups, currentGroup, onSelectGroup, onAddGroup, onDeleteGroup, onRenameGroup, onOpenSettings }) => {
    const hasNoGroup = tasks.some(t => !t.group);
    const [newGroupName, setNewGroupName] = React.useState("");
    const [isAdding, setIsAdding] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [contextMenu, setContextMenu] = React.useState<{
        visible: boolean;
        x: number;
        y: number;
        group: string | null;
    }>({ visible: false, x: 0, y: 0, group: null });

    React.useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    React.useEffect(() => {
        const onClick = () => {
            if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, group: null });
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0, group: null });
        };
        window.addEventListener('click', onClick);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('click', onClick);
            window.removeEventListener('keydown', onKey);
        };
    }, [contextMenu.visible]);

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

    const itemBaseClass = "flex items-center gap-2.5 px-4 py-2.5 mb-1.5 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-bg-hover";
    const activeClass = "bg-bg-active font-bold text-text-primary";
    const getItemClass = (isActive: boolean) => `${itemBaseClass} ${isActive ? activeClass : ""}`;

    return (
        <div className="w-full">
            <div className={getItemClass(currentGroup === "__ALL__")} onClick={() => onSelectGroup("__ALL__")}>📋 All Tasks</div>
            <div className={getItemClass(currentGroup === "__DASHBOARD__")} onClick={() => onSelectGroup("__DASHBOARD__")}>📊 Dashboard</div>
            <div className={getItemClass(currentGroup === "__CALENDAR__")} onClick={() => onSelectGroup("__CALENDAR__")}>📅 Calendar</div>
            <div className={getItemClass(currentGroup === "__GANTT__")} onClick={() => onSelectGroup("__GANTT__")}>💹 Gantt Chart</div>
            <div className={getItemClass(currentGroup === "__MEMOS__")} onClick={() => onSelectGroup("__MEMOS__")}>📝 Memos</div>
            <div className={getItemClass(currentGroup === "__READING_MEMOS__")} onClick={() => onSelectGroup("__READING_MEMOS__")}>📚 Reading Memos</div>

            <div className="my-2.5 border-b border-border-primary" />

            <div className="px-2.5 mb-1.5 flex justify-between items-center">
                <span className="text-[0.8em] text-text-tertiary">GROUPS</span>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-transparent border-none text-text-tertiary cursor-pointer text-[1.2em] hover:text-text-primary"
                >
                    +
                </button>
            </div>

            {isAdding && (
                <div className="px-2.5 mb-2.5 flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        placeholder="New Group"
                        className="w-full mr-[5px] px-[5px] py-[2px] bg-bg-tertiary border-none text-text-primary rounded focus:ring-1 focus:ring-accent-primary outline-none"
                        onKeyDown={e => { if (e.key === "Enter") handleAddGroup(); if (e.key === "Escape") handleCancelAdd(); }}
                    />
                    <button onClick={handleCancelAdd} className="bg-transparent border-none text-text-tertiary cursor-pointer text-[1.2em] p-0 hover:text-danger" title="Cancel">✕</button>
                </div>
            )}

            {groups.map(group => (
                <div
                    key={group}
                    className={`${getItemClass(currentGroup === group)} justify-between group`}
                    onClick={() => onSelectGroup(group)}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, group });
                    }}
                >
                    <div className="flex items-center gap-1"><span>📁</span> {group}</div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={e => { e.stopPropagation(); if (confirm(`Delete group "${group}"?`)) onDeleteGroup(group); }}
                            className="bg-transparent border-none text-text-disabled cursor-pointer text-[0.8em] px-[5px] hover:text-danger"
                            title="Delete"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}

            {contextMenu.visible && contextMenu.group && (
                <>
                    <div
                        className="context-menu"
                        style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div onClick={() => {
                            const g = contextMenu.group as string;
                            const newName = prompt(`Rename group "${g}" to:`, g);
                            if (newName && newName.trim() && newName.trim() !== g) onRenameGroup(g, newName.trim());
                            setContextMenu({ visible: false, x: 0, y: 0, group: null });
                        }}>Rename</div>
                        <div onClick={() => {
                            const g = contextMenu.group as string;
                            if (confirm(`Delete group "${g}"?`)) onDeleteGroup(g);
                            setContextMenu({ visible: false, x: 0, y: 0, group: null });
                        }} className="text-danger">Delete</div>
                    </div>
                    <div className="context-menu-overlay" onClick={() => setContextMenu({ visible: false, x: 0, y: 0, group: null })} />
                </>
            )}

            {hasNoGroup && (
                <div className={getItemClass(currentGroup === "__NO_GROUP__")} onClick={() => onSelectGroup("__NO_GROUP__")}>📄 No Group</div>
            )}

            <div className="my-2.5 border-b border-border-primary" />

            <div className={`${getItemClass(false)} mb-2.5`} onClick={onOpenSettings}>⚙️ Settings</div>
        </div>
    );
};

export default Sidebar;

