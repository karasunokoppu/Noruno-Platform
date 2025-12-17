// FolderTree component
// Located in src/components/memo/FolderTree.tsx
// This component renders a hierarchical tree of folders for organizing memos.

import React, { useState } from 'react';
import { Folder } from '../../types';
import ContextMenu from '../ui/ContextMenu';

interface FolderTreeProps {
    folders: Folder[];
    selectedFolder: string | null;
    onSelectFolder: (id: string | null) => void;
    onCreateFolder: (name: string, parentId: string | null) => void;
    onRenameFolder: (id: string, name: string) => void;
    onDeleteFolder: (id: string) => void;
}

const FolderTree: React.FC<FolderTreeProps> = ({
    folders,
    selectedFolder,
    onSelectFolder,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder
}) => {
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, folderId: string | null } | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

    const handleContextMenu = (e: React.MouseEvent, folderId: string | null) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, folderId });
    };

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName, newFolderParentId ?? null);
            setNewFolderName('');
            setShowNewFolderInput(false);
            setNewFolderParentId(null);
            setContextMenu(null);
        }
    };

    const handleRename = () => {
        if (contextMenu?.folderId) {
            const newName = prompt('Enter new folder name:');
            if (newName?.trim()) {
                onRenameFolder(contextMenu.folderId, newName);
            }
        }
        setContextMenu(null);
    };

    const handleDelete = () => {
        if (contextMenu?.folderId && confirm('Delete this folder?')) {
            onDeleteFolder(contextMenu.folderId);
        }
        setContextMenu(null);
    };

    // Build folder tree hierarchy
    const buildTree = (parentId: string | null = null): Folder[] => {
        return folders.filter(f => f.parent_id === parentId);
    };

    const renderFolder = (folder: Folder, level: number = 0) => {
        const children = buildTree(folder.id);
        return (
            <div key={folder.id} style={{ marginLeft: `${level * 15}px` }}>
                <div
                    className={`folder-item ${selectedFolder === folder.id ? 'selected' : ''}`}
                    onClick={() => onSelectFolder(folder.id)}
                    onContextMenu={(e) => handleContextMenu(e, folder.id)}
                >
                    📁 {folder.name}
                </div>
                {children.map(child => renderFolder(child, level + 1))}
            </div>
        );
    };

    return (
        <div className="folder-tree">
            <div className="folder-tree-header">
                <h3>Folders</h3>
                    <button onClick={() => { setNewFolderParentId(null); setShowNewFolderInput(true); }}>+</button>
            </div>
            <div
                className={`folder-item h-full ${selectedFolder === null ? 'selected' : ''}`}
                onClick={() => onSelectFolder(null)}
                onContextMenu={(e) => handleContextMenu(e, null)}
            >
                📂 All Memos
            </div>
            <div className='folder-item-list'>
                {buildTree(null).map(folder => renderFolder(folder))}
            </div>
            

            {showNewFolderInput && (
                <div className="new-folder-input">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder name"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                        autoFocus
                    />
                    <button onClick={handleCreateFolder}>Create</button>
                    <button onClick={() => setShowNewFolderInput(false)}>Cancel</button>
                </div>
            )}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    items={[
                        {
                            label: 'New Subfolder',
                            onClick: () => { setNewFolderParentId(contextMenu.folderId || null); setShowNewFolderInput(true); }
                        },
                        ...(contextMenu.folderId ? [
                            { label: 'Rename', onClick: handleRename },
                            { label: 'Delete', danger: true, onClick: handleDelete }
                        ] : [])
                    ]}
                />
            )}
        </div>
    );
};

export default FolderTree;
