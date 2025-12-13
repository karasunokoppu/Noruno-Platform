-- Memos table
CREATE TABLE IF NOT EXISTS memos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    folder_id TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- Index for searching
CREATE INDEX IF NOT EXISTS idx_memos_folder ON memos(folder_id);
CREATE INDEX IF NOT EXISTS idx_memos_title ON memos(title);
