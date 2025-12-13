-- Calendar events table (for future calendar features)
CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    start_datetime TEXT NOT NULL,
    end_datetime TEXT,
    all_day INTEGER NOT NULL DEFAULT 0,
    color TEXT,
    recurrence_rule TEXT,
    reminder_minutes INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end ON calendar_events(end_datetime);
