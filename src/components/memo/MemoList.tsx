// MemoList component
// Located in src/components/memo/MemoList.tsx
// This component displays a list of memos with search functionality and filtering.

import React from 'react';
import { Memo } from '../../types';

interface MemoListProps {
    memos: Memo[];
    selectedMemo: Memo | null;
    onSelectMemo: (memo: Memo) => void;
    onCreateMemo: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const MemoList: React.FC<MemoListProps> = ({
    memos,
    selectedMemo,
    onSelectMemo,
    onCreateMemo,
    searchQuery,
    onSearchChange
}) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    const getPreview = (content: string, maxLength: number = 60) => {
        const stripped = content.replace(/[#*`\[\]]/g, '').trim();
        return stripped.length > maxLength ? stripped.slice(0, maxLength) + '...' : stripped;
    };

    return (
        <div className="memo-list">
            <div className="memo-list-header">
                <input
                    type="text"
                    placeholder="Search memos..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="memo-search"
                />
                <button onClick={onCreateMemo} className="create-memo-btn">+ New Memo</button>
            </div>
            <div className="memo-list-items">
                {memos.length === 0 ? (
                    <div className="empty-state">No memos found</div>
                ) : (
                    memos.map(memo => (
                        <div
                            key={memo.id}
                            className={`memo-list-item ${selectedMemo?.id === memo.id ? 'selected' : ''}`}
                            onClick={() => onSelectMemo(memo)}
                        >
                            <div className="memo-list-item-title">{memo.title}</div>
                            <div className="memo-list-item-preview">{getPreview(memo.content)}</div>
                            <div className="memo-list-item-footer">
                                <div className="memo-list-item-tags">
                                    {memo.tags.slice(0, 3).map((tag, idx) => (
                                        <span key={idx} className="tag-badge">{tag}</span>
                                    ))}
                                </div>
                                <div className="memo-list-item-date">{formatDate(memo.updated_at)}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MemoList;
