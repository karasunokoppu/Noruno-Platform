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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::{
        db_delete_calendar_event, db_load_calendar_events, db_save_calendar_event,
    };
    use crate::tests::test_utils::setup_test_db;
    use chrono::Utc;

    #[tokio::test]
    async fn test_calendar_crud() {
        let test_db = setup_test_db().await;
        let pool = &test_db.pool;

        // Create
        let event = CalendarEvent {
            id: "event-1".to_string(),
            title: "Test Event".to_string(),
            description: "Desc".to_string(),
            start_datetime: "2023-01-01 10:00".to_string(),
            end_datetime: Some("2023-01-01 11:00".to_string()),
            all_day: false,
            color: Some("#000000".to_string()),
            recurrence_rule: None,
            reminder_minutes: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        db_save_calendar_event(pool, &event)
            .await
            .expect("Failed to save event");

        // Read
        let events = db_load_calendar_events(pool)
            .await
            .expect("Failed to load events");
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].title, "Test Event");

        // Update
        let mut event = events[0].clone();
        event.title = "Updated Event".to_string();
        db_save_calendar_event(pool, &event)
            .await
            .expect("Failed to update event");

        let events = db_load_calendar_events(pool)
            .await
            .expect("Failed to load events");
        assert_eq!(events[0].title, "Updated Event");

        // Delete
        db_delete_calendar_event(pool, "event-1")
            .await
            .expect("Failed to delete event");
        let events = db_load_calendar_events(pool)
            .await
            .expect("Failed to load events");
        assert!(events.is_empty());
    }
}
