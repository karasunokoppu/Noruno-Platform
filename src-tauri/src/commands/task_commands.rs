// タスク関連のTauriコマンド

use chrono::{Local, NaiveDate, NaiveDateTime, TimeZone};
use tauri::State;

use crate::mail::send_email;
use crate::settings::MailSettings;
use crate::task::{Subtask, Task};
use crate::AppState;

// ========================================
// タスク関連コマンド
// ========================================

#[tauri::command]
pub fn get_tasks(state: State<AppState>) -> Vec<Task> {
    let tasks = state.tasks.lock().unwrap();
    tasks.clone()
}

#[tauri::command]
pub async fn add_task(
    state: State<'_, AppState>,
    description: String,
    start_date: Option<String>,
    due_date: String,
    group: String,
    details: String,
    notification_minutes: Option<i32>,
    dependencies: Option<Vec<i32>>,
) -> Result<Vec<Task>, String> {
    let tasks = {
        let mut tasks = state.tasks.lock().unwrap();
        let mut next_id = state.next_id.lock().unwrap();

        let task = Task {
            id: *next_id,
            description,
            start_date,
            due_date,
            group,
            details,
            completed: false,
            notified: false,
            notification_minutes,
            subtasks: Vec::new(),
            dependencies,
        };

        *next_id += 1;
        tasks.push(task);

        // Save to JSON file
        let data_file = state.data_file.lock().unwrap();
        crate::task::save_tasks(&tasks, &data_file)?;

        tasks.clone()
    };

    Ok(tasks)
}

#[tauri::command]
pub async fn update_task(
    state: State<'_, AppState>,
    id: i32,
    description: String,
    start_date: Option<String>,
    due_date: String,
    group: String,
    details: String,
    notification_minutes: Option<i32>,
    dependencies: Option<Vec<i32>>,
) -> Result<Vec<Task>, String> {
    let tasks = {
        let mut tasks = state.tasks.lock().unwrap();

        if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
            // Reset notified flag if due_date or notification settings change
            let due_date_changed = task.due_date != due_date;
            let notification_changed = task.notification_minutes != notification_minutes;

            task.description = description;
            task.start_date = start_date;
            task.due_date = due_date;
            task.group = group;
            task.details = details;
            task.notification_minutes = notification_minutes;
            task.dependencies = dependencies;

            // Reset notified flag if relevant fields changed
            if due_date_changed || notification_changed {
                task.notified = false;
            }
        }

        // Save to JSON file
        let data_file = state.data_file.lock().unwrap();
        crate::task::save_tasks(&tasks, &data_file)?;

        tasks.clone()
    };

    Ok(tasks)
}

#[tauri::command]
pub async fn delete_task(state: State<'_, AppState>, id: i32) -> Result<Vec<Task>, String> {
    let tasks = {
        let mut tasks = state.tasks.lock().unwrap();
        tasks.retain(|t| t.id != id);

        // Save to JSON file
        let data_file = state.data_file.lock().unwrap();
        crate::task::save_tasks(&tasks, &data_file)?;

        tasks.clone()
    };

    Ok(tasks)
}

#[tauri::command]
pub async fn complete_task(state: State<'_, AppState>, id: i32) -> Result<Vec<Task>, String> {
    let tasks = {
        let mut tasks = state.tasks.lock().unwrap();

        if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
            task.completed = !task.completed;
        }

        // Save to JSON file
        let data_file = state.data_file.lock().unwrap();
        crate::task::save_tasks(&tasks, &data_file)?;

        tasks.clone()
    };

    Ok(tasks)
}

// ========================================
// グループ関連コマンド
// ========================================

#[tauri::command]
pub fn get_groups(state: State<AppState>) -> Vec<String> {
    let groups = state.groups.lock().unwrap();
    groups.clone()
}

#[tauri::command]
pub async fn create_group(state: State<'_, AppState>, name: String) -> Result<Vec<String>, String> {
    let groups = {
        let mut groups = state.groups.lock().unwrap();
        if !groups.contains(&name) && !name.trim().is_empty() {
            groups.push(name);

            // Save to JSON file
            let groups_file = state.groups_file.lock().unwrap();
            crate::task::save_groups(&groups, &groups_file)?;
        }
        groups.clone()
    };

    Ok(groups)
}

#[tauri::command]
pub async fn delete_group(state: State<'_, AppState>, name: String) -> Result<Vec<String>, String> {
    let (groups, _updated_tasks) = {
        let mut groups = state.groups.lock().unwrap();
        let mut tasks = state.tasks.lock().unwrap();

        if let Some(pos) = groups.iter().position(|g| *g == name) {
            groups.remove(pos);

            // Update tasks with this group
            let mut tasks_modified = false;
            for task in tasks.iter_mut() {
                if task.group == name {
                    task.group = String::new();
                    tasks_modified = true;
                }
            }

            // Save groups
            let groups_file = state.groups_file.lock().unwrap();
            crate::task::save_groups(&groups, &groups_file)?;

            // Save tasks if modified
            if tasks_modified {
                let data_file = state.data_file.lock().unwrap();
                crate::task::save_tasks(&tasks, &data_file)?;
            }
        }
        (groups.clone(), Vec::<Task>::new())
    };

    Ok(groups)
}

// ========================================
// メール設定関連コマンド
// ========================================

#[tauri::command]
pub fn get_mail_settings(state: State<AppState>) -> MailSettings {
    let settings = state.mail_settings.lock().unwrap();
    settings.clone()
}

#[tauri::command]
pub async fn save_mail_settings(
    state: State<'_, AppState>,
    settings: MailSettings,
) -> Result<MailSettings, String> {
    {
        let mut current_settings = state.mail_settings.lock().unwrap();
        *current_settings = settings.clone();

        // Save to JSON file
        let settings_file = state.mail_settings_file.lock().unwrap();
        crate::settings::save_settings(&settings, &settings_file)?;
    }

    Ok(settings)
}

#[tauri::command]
pub async fn send_test_email(state: State<'_, AppState>) -> Result<String, String> {
    let settings = state.mail_settings.lock().unwrap().clone();

    send_email(
        &settings,
        &settings.email,
        "Test Email from Tauri Todo",
        "This is a test email to verify your settings.",
    )
    .map(|_| "Email sent successfully".to_string())
}

// ========================================
// 通知関連コマンド
// ========================================

#[tauri::command]
pub async fn check_notifications(state: State<'_, AppState>) -> Result<String, String> {
    let settings = {
        let s = state.mail_settings.lock().unwrap();
        s.clone()
    };

    if settings.email.is_empty() || settings.app_password.is_empty() {
        return Err("Email settings not configured".to_string());
    }

    let mut debug_info = Vec::new();
    let mut tasks_to_notify = Vec::new();
    let now = Local::now();
    debug_info.push(format!("Current time: {}", now.format("%Y-%m-%d %H:%M:%S")));
    debug_info.push(format!(
        "Global notification threshold: {} minutes",
        settings.notification_minutes
    ));

    let _tasks_to_update: Vec<Task> = {
        let mut tasks = state.tasks.lock().unwrap();
        let mut changed = false;
        let mut updated = Vec::new();

        debug_info.push(format!("Total tasks: {}", tasks.len()));

        for task in tasks.iter_mut() {
            let task_threshold = task
                .notification_minutes
                .unwrap_or(settings.notification_minutes);

            if task.completed {
                debug_info.push(format!("Task '{}': SKIPPED (completed)", task.description));
                continue;
            }

            if task.notified {
                debug_info.push(format!(
                    "Task '{}': SKIPPED (already notified)",
                    task.description
                ));
                continue;
            }

            // Try parsing as DateTime first, then fall back to Date
            let due_time_result = NaiveDateTime::parse_from_str(&task.due_date, "%Y-%m-%d %H:%M");
            let minutes_until_due = if let Ok(due_dt) = due_time_result {
                let due_time = Local.from_local_datetime(&due_dt).unwrap();
                let duration = due_time.signed_duration_since(now);
                duration.num_minutes()
            } else {
                // Fall back to date-only parsing
                let date_str = task
                    .due_date
                    .split_whitespace()
                    .next()
                    .unwrap_or(&task.due_date);
                if let Ok(due_date) = NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
                    let due_midnight = Local
                        .from_local_datetime(&due_date.and_hms_opt(0, 0, 0).unwrap())
                        .unwrap();
                    let duration = due_midnight.signed_duration_since(now);
                    duration.num_minutes()
                } else {
                    debug_info.push(format!(
                        "Task '{}': ERROR parsing date '{}': invalid format",
                        task.description, task.due_date
                    ));
                    continue;
                }
            };

            debug_info.push(format!(
                "Task '{}': due_date={}, minutes_until_due={}, threshold={}, will_notify={}",
                task.description,
                task.due_date,
                minutes_until_due,
                task_threshold,
                minutes_until_due <= task_threshold as i64 && minutes_until_due >= 0
            ));

            if minutes_until_due <= task_threshold as i64 && minutes_until_due >= 0 {
                tasks_to_notify.push(task.clone());
                task.notified = true;
                updated.push(task.clone());
                changed = true;
            }
        }

        if changed {
            debug_info.push("Tasks updated".to_string());
            // Save to JSON file
            let data_file = state.data_file.lock().unwrap();
            let _ = crate::task::save_tasks(&tasks, &data_file);
        }
        updated
    };

    let count = tasks_to_notify.len();
    for task in &tasks_to_notify {
        let subject = format!("[Todo App] Task Due: {}", task.description);
        let body = format!(
            "Your task '{}' is due on {}.\n\nDetails: {}\nGroup: {}",
            task.description, task.due_date, task.details, task.group
        );

        match send_email(&settings, &settings.email, &subject, &body) {
            Ok(_) => debug_info.push(format!("✓ Email sent for task '{}'", task.description)),
            Err(e) => debug_info.push(format!(
                "✗ Failed to send email for task '{}': {}",
                task.description, e
            )),
        }
    }

    let result = format!(
        "Notification check complete.\n\nSent {} email(s).\n\n--- Debug Info ---\n{}",
        count,
        debug_info.join("\n")
    );

    Ok(result)
}

// ========================================
// サブタスク関連コマンド
// ========================================

#[tauri::command]
pub async fn add_subtask(
    state: State<'_, AppState>,
    task_id: i32,
    description: String,
) -> Result<Vec<Task>, String> {
    let tasks = {
        let mut tasks = state.tasks.lock().unwrap();

        if let Some(task) = tasks.iter_mut().find(|t| t.id == task_id) {
            let subtask_id = task.next_subtask_id();
            let subtask = Subtask::new(subtask_id, description);
            task.subtasks.push(subtask);

            // Save to JSON file
            let data_file = state.data_file.lock().unwrap();
            crate::task::save_tasks(&tasks, &data_file)?;
        }

        tasks.clone()
    };

    Ok(tasks)
}

#[tauri::command]
pub async fn update_subtask(
    state: State<'_, AppState>,
    task_id: i32,
    subtask_id: i32,
    description: String,
    completed: bool,
) -> Result<Vec<Task>, String> {
    let tasks = {
        let mut tasks = state.tasks.lock().unwrap();

        if let Some(task) = tasks.iter_mut().find(|t| t.id == task_id) {
            if let Some(subtask) = task.subtasks.iter_mut().find(|s| s.id == subtask_id) {
                subtask.description = description;
                subtask.completed = completed;

                // Save to JSON file
                let data_file = state.data_file.lock().unwrap();
                crate::task::save_tasks(&tasks, &data_file)?;
            }
        }

        tasks.clone()
    };

    Ok(tasks)
}

#[tauri::command]
pub async fn delete_subtask(
    state: State<'_, AppState>,
    task_id: i32,
    subtask_id: i32,
) -> Result<Vec<Task>, String> {
    let tasks = {
        let mut tasks = state.tasks.lock().unwrap();

        if let Some(task) = tasks.iter_mut().find(|t| t.id == task_id) {
            task.subtasks.retain(|s| s.id != subtask_id);

            // Save to JSON file
            let data_file = state.data_file.lock().unwrap();
            crate::task::save_tasks(&tasks, &data_file)?;
        }

        tasks.clone()
    };

    Ok(tasks)
}

#[tauri::command]
pub async fn toggle_subtask(
    state: State<'_, AppState>,
    task_id: i32,
    subtask_id: i32,
) -> Result<Vec<Task>, String> {
    let tasks = {
        let mut tasks = state.tasks.lock().unwrap();

        if let Some(task) = tasks.iter_mut().find(|t| t.id == task_id) {
            if let Some(subtask) = task.subtasks.iter_mut().find(|s| s.id == subtask_id) {
                subtask.completed = !subtask.completed;

                // Save to JSON file
                let data_file = state.data_file.lock().unwrap();
                crate::task::save_tasks(&tasks, &data_file)?;
            }
        }

        tasks.clone()
    };

    Ok(tasks)
}
