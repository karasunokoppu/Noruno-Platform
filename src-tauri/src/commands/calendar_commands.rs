use crate::calendar::{save_calendar_events, CalendarEvent};
use crate::AppState;
use tauri::State;

#[tauri::command]
pub async fn get_calendar_events(state: State<'_, AppState>) -> Result<Vec<CalendarEvent>, String> {
    let events = state.calendar_events.lock().unwrap();
    Ok(events.clone())
}

#[tauri::command]
pub async fn create_calendar_event(
    state: State<'_, AppState>,
    title: String,
    description: String,
    start_datetime: String,
    end_datetime: Option<String>,
    all_day: bool,
    color: Option<String>,
    recurrence_rule: Option<String>,
    reminder_minutes: Option<i32>,
) -> Result<Vec<CalendarEvent>, String> {
    let new_event = CalendarEvent {
        id: uuid::Uuid::new_v4().to_string(),
        title,
        description,
        start_datetime,
        end_datetime,
        all_day,
        color,
        recurrence_rule,
        reminder_minutes,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
    };

    let events = {
        let mut events = state.calendar_events.lock().unwrap();
        events.push(new_event);
        save_calendar_events(&events)?;
        events.clone()
    };

    Ok(events)
}

#[tauri::command]
pub async fn update_calendar_event(
    state: State<'_, AppState>,
    id: String,
    title: String,
    description: String,
    start_datetime: String,
    end_datetime: Option<String>,
    all_day: bool,
    color: Option<String>,
    recurrence_rule: Option<String>,
    reminder_minutes: Option<i32>,
) -> Result<Vec<CalendarEvent>, String> {
    let events = {
        let mut events = state.calendar_events.lock().unwrap();
        if let Some(event) = events.iter_mut().find(|e| e.id == id) {
            event.title = title;
            event.description = description;
            event.start_datetime = start_datetime;
            event.end_datetime = end_datetime;
            event.all_day = all_day;
            event.color = color;
            event.recurrence_rule = recurrence_rule;
            event.reminder_minutes = reminder_minutes;
            event.updated_at = chrono::Utc::now();
            save_calendar_events(&events)?;
        }
        events.clone()
    };

    Ok(events)
}

#[tauri::command]
pub async fn delete_calendar_event(
    state: State<'_, AppState>,
    id: String,
) -> Result<Vec<CalendarEvent>, String> {
    let events = {
        let mut events = state.calendar_events.lock().unwrap();
        events.retain(|e| e.id != id);
        save_calendar_events(&events)?;
        events.clone()
    };

    Ok(events)
}
