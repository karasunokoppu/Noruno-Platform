use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalendarEvent {
    pub id: String,
    pub title: String,
    pub description: String,
    pub start_datetime: String, // Keep as string for now to match other patterns, or parse to DateTime
    pub end_datetime: Option<String>,
    pub all_day: bool,
    pub color: Option<String>,
    pub recurrence_rule: Option<String>,
    pub reminder_minutes: Option<i32>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
