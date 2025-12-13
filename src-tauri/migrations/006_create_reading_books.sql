-- Reading books table
CREATE TABLE IF NOT EXISTS reading_books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    publisher TEXT,
    published_year INTEGER,
    cover_image_url TEXT,
    genres TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'want_to_read',
    start_date TEXT,
    finish_date TEXT,
    progress_percent INTEGER,
    total_pages INTEGER,
    current_page INTEGER,
    rating INTEGER,
    summary TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '[]',
    reading_sessions TEXT NOT NULL DEFAULT '[]',
    tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reading_books_status ON reading_books(status);
