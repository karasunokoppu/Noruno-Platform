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

use std::fs;
use std::path::PathBuf;

pub fn get_calendar_events_file_path() -> PathBuf {
    let app_data = dirs::data_local_dir().unwrap();
    app_data
        .join("com.noruno.platform")
        .join("calendar_events.json")
}

pub fn load_calendar_events() -> Result<Vec<CalendarEvent>, String> {
    let path = get_calendar_events_file_path();
    if !path.exists() {
        return Ok(Vec::new());
    }

    let contents = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read calendar_events file: {}", e))?;

    serde_json::from_str(&contents).map_err(|e| format!("Failed to parse calendar_events: {}", e))
}

pub fn save_calendar_events(events: &Vec<CalendarEvent>) -> Result<(), String> {
    let path = get_calendar_events_file_path();
    let json = serde_json::to_string_pretty(events).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| format!("Failed to save calendar_events: {}", e))?;
    Ok(())
}
