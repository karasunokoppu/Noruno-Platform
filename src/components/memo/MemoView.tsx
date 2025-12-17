// MemoView component
// Located in src/components/memo/MemoView.tsx
// This is the main container for the memo feature, managing state for memos and folders.

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import FolderTree from './FolderTree';
import MemoList from './MemoList';
import MemoEditor from './MemoEditor';
import type { Memo, Folder } from '../../types';

const MemoView: React.FC = () => {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadMemos();
        loadFolders();
    }, []);

    const loadMemos = async () => {
        try {
            const loaded = await invoke<Memo[]>('get_memos');
            setMemos(loaded);
        } catch (error) {
            console.error('Failed to load memos:', error);
        }
    };

    const loadFolders = async () => {
        try {
            const loaded = await invoke<Folder[]>('get_folders');
            setFolders(loaded);
        } catch (error) {
            console.error('Failed to load folders:', error);
        }
    };

    const handleCreateMemo = async () => {
        try {
            const newMemos = await invoke<Memo[]>('create_memo', {
                title: 'Untitled',
                content: '',
                folderId: selectedFolder,
                tags: []
            });
            setMemos(newMemos);
            if (newMemos.length > 0) {
                setSelectedMemo(newMemos[newMemos.length - 1]);
            }
        } catch (error) {
            console.error('Failed to create memo:', error);
        }
    };

    const handleSaveMemo = async (memo: Memo) => {
        try {
            const updated = await invoke<Memo[]>('update_memo', {
                id: memo.id,
                title: memo.title,
                content: memo.content,
                folderId: memo.folder_id,
                tags: memo.tags
            });
            setMemos(updated);
            setSelectedMemo(memo);
        } catch (error) {
            console.error('Failed to save memo:', error);
        }
    };

    const handleDeleteMemo = async (id: string) => {
        try {
            const updated = await invoke<Memo[]>('delete_memo', { id });
            setMemos(updated);
            if (selectedMemo?.id === id) {
                setSelectedMemo(null);
            }
        } catch (error) {
            console.error('Failed to delete memo:', error);
        }
    };

    const handleCreateFolder = async (name: string, parentId: string | null) => {
        try {
            const updated = await invoke<Folder[]>('create_folder', {
                name,
                parentId
            });
            setFolders(updated);
        } catch (error) {
            console.error('Failed to create folder:', error);
        }
    };

    const handleRenameFolder = async (id: string, name: string) => {
        try {
            const updated = await invoke<Folder[]>('update_folder', { id, name });
            setFolders(updated);
        } catch (error) {
            console.error('Failed to rename folder:', error);
        }
    };

    const handleDeleteFolder = async (id: string) => {
        try {
            const updated = await invoke<Folder[]>('delete_folder', { id });
            setFolders(updated);
            if (selectedFolder === id) {
                setSelectedFolder(null);
            }
        } catch (error) {
            console.error('Failed to delete folder:', error);
        }
    };

    const filteredMemos = memos.filter(memo => {
        const matchesFolder = !selectedFolder || memo.folder_id === selectedFolder;
        const matchesSearch = !searchQuery ||
            memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            memo.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            memo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesFolder && matchesSearch;
    });

    return (
        <div className="memo-view">
            <div className="memo-sidebar">
                <FolderTree
                    folders={folders}
                    selectedFolder={selectedFolder}
                    onSelectFolder={setSelectedFolder}
                    onCreateFolder={handleCreateFolder}
                    onRenameFolder={handleRenameFolder}
                    onDeleteFolder={handleDeleteFolder}
                />
                <MemoList
                    memos={filteredMemos}
                    selectedMemo={selectedMemo}
                    onSelectMemo={setSelectedMemo}
                    onCreateMemo={handleCreateMemo}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </div>
            <MemoEditor
                memo={selectedMemo}
                folders={folders}
                allMemos={memos}
                onSave={handleSaveMemo}
                onDelete={handleDeleteMemo}
            />
        </div>
    );
};

export default MemoView;
