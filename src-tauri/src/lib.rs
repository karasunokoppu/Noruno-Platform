use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use tauri::Manager;
use tauri::State;
use chrono::{DateTime, Local, NaiveDate, NaiveDateTime, TimeZone, Utc};

mod settings;
mod mail;
mod memo;
mod reading_memo;

use settings::{MailSettings, load_settings, save_settings};
use mail::send_email;
use memo::*;
use reading_memo::*;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: i32,
    pub description: String,
    pub due_date: String,
    pub group: String,
    pub details: String,
    pub completed: bool,
    #[serde(default)]
    pub notified: bool,
    #[serde(default)]
    pub notification_minutes: Option<i32>,  // Changed from notification_days
}

//アプリ内の状態を一括で管理している構造体
pub struct AppState {
    pub tasks: Mutex<Vec<Task>>,
    pub groups: Mutex<Vec<String>>,
    pub next_id: Mutex<i32>,
    pub data_file: Mutex<PathBuf>,
    pub groups_file: Mutex<PathBuf>,
    pub mail_settings: Mutex<MailSettings>,
    pub mail_settings_file: Mutex<PathBuf>,
    pub memos: Mutex<Vec<Memo>>,
    pub folders: Mutex<Vec<Folder>>,
    pub reading_books: Mutex<Vec<ReadingBook>>,
}

fn save_tasks(tasks: &Vec<Task>, file_path: &PathBuf) {
    let json = serde_json::to_string_pretty(tasks).unwrap_or_default();
    if let Some(parent) = file_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let _ = fs::write(file_path, json);
}

fn load_tasks(file_path: &PathBuf) -> Vec<Task> {
    if let Ok(content) = fs::read_to_string(file_path) {
        if let Ok(tasks) = serde_json::from_str(&content) {
            return tasks;
        }
    }
    Vec::new()
}

fn save_groups(groups: &Vec<String>, file_path: &PathBuf) {
    let json = serde_json::to_string_pretty(groups).unwrap_or_default();
    if let Some(parent) = file_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let _ = fs::write(file_path, json);
}

fn load_groups(file_path: &PathBuf) -> Vec<String> {
    if let Ok(content) = fs::read_to_string(file_path) {
        if let Ok(groups) = serde_json::from_str(&content) {
            return groups;
        }
    }
    Vec::new()
}

#[tauri::command]
fn get_tasks(state: State<AppState>) -> Vec<Task> {
    let tasks = state.tasks.lock().unwrap();
    tasks.clone()
}

#[tauri::command]
fn get_groups(state: State<AppState>) -> Vec<String> {
    let groups = state.groups.lock().unwrap();
    groups.clone()
}

#[tauri::command]
fn create_group(state: State<AppState>, name: String) -> Vec<String> {
    let mut groups = state.groups.lock().unwrap();
    let groups_file = state.groups_file.lock().unwrap();

    if !groups.contains(&name) && !name.trim().is_empty() {
        groups.push(name);
        save_groups(&groups, &groups_file);
    }
    groups.clone()
}

#[tauri::command]
fn delete_group(state: State<AppState>, name: String) -> Vec<String> {
    let mut groups = state.groups.lock().unwrap();
    let groups_file = state.groups_file.lock().unwrap();
    let mut tasks = state.tasks.lock().unwrap();
    let data_file = state.data_file.lock().unwrap();

    if let Some(pos) = groups.iter().position(|g| *g == name) {
        groups.remove(pos);
        save_groups(&groups, &groups_file);

        // Remove group from tasks
        let mut tasks_changed = false;
        for task in tasks.iter_mut() {
            if task.group == name {
                task.group = String::new();
                tasks_changed = true;
            }
        }
        if tasks_changed {
            save_tasks(&tasks, &data_file);
        }
    }
    groups.clone()
}

#[tauri::command]
fn add_task(
    state: State<AppState>,
    description: String,
    due_date: String,
    group: String,
    details: String,
    notification_minutes: Option<i32>,
) -> Vec<Task> {
    let mut tasks = state.tasks.lock().unwrap();
    let mut next_id = state.next_id.lock().unwrap();
    let data_file = state.data_file.lock().unwrap();

    let task = Task {
        id: *next_id,
        description,
        due_date,
        group,
        details,
        completed: false,
        notified: false,
        notification_minutes,
    };

    *next_id += 1;
    tasks.push(task);
    save_tasks(&tasks, &data_file);

    tasks.clone()
}

#[tauri::command]
fn update_task(
    state: State<AppState>,
    id: i32,
    description: String,
    due_date: String,
    group: String,
    details: String,
    notification_minutes: Option<i32>,
) -> Vec<Task> {
    let mut tasks = state.tasks.lock().unwrap();
    let data_file = state.data_file.lock().unwrap();

    if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
        // Reset notified flag if due_date or notification settings change
        let due_date_changed = task.due_date != due_date;
        let notification_changed = task.notification_minutes != notification_minutes;
        
        task.description = description;
        task.due_date = due_date;
        task.group = group;
        task.details = details;
        task.notification_minutes = notification_minutes;
        
        // Reset notified flag if relevant fields changed
        if due_date_changed || notification_changed {
            task.notified = false;
        }
        
        save_tasks(&tasks, &data_file);
    }
    tasks.clone()
}

#[tauri::command]
fn delete_task(state: State<AppState>, id: i32) -> Vec<Task> {
    let mut tasks = state.tasks.lock().unwrap();
    let data_file = state.data_file.lock().unwrap();

    tasks.retain(|t| t.id != id);
    save_tasks(&tasks, &data_file);
    tasks.clone()
}

#[tauri::command]
fn complete_task(state: State<AppState>, id: i32) -> Vec<Task> {
    let mut tasks = state.tasks.lock().unwrap();
    let data_file = state.data_file.lock().unwrap();

    if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
        task.completed = !task.completed;
        save_tasks(&tasks, &data_file);
    }
    tasks.clone()
}

#[tauri::command]
fn get_mail_settings(state: State<AppState>) -> MailSettings {
    let settings = state.mail_settings.lock().unwrap();
    settings.clone()
}

#[tauri::command]
fn save_mail_settings(state: State<AppState>, settings: MailSettings) -> MailSettings {
    let mut current_settings = state.mail_settings.lock().unwrap();
    let file_path = state.mail_settings_file.lock().unwrap();
    
    *current_settings = settings.clone();
    save_settings(&settings, &file_path);
    
    settings
}

#[tauri::command]
async fn send_test_email(state: State<'_, AppState>) -> Result<String, String> {
    let settings = state.mail_settings.lock().unwrap().clone();
    
    send_email(
        &settings,
        &settings.email,
        "Test Email from Tauri Todo",
        "This is a test email to verify your settings."
    ).map(|_| "Email sent successfully".to_string())
}

#[tauri::command]
async fn check_notifications(state: State<'_, AppState>) -> Result<String, String> {
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
    debug_info.push(format!("Global notification threshold: {} minutes", settings.notification_minutes));
    
    {
        let mut tasks = state.tasks.lock().unwrap();
        let data_file = state.data_file.lock().unwrap();
        let mut changed = false;
        
        debug_info.push(format!("Total tasks: {}", tasks.len()));

        for task in tasks.iter_mut() {
            let task_threshold = task.notification_minutes.unwrap_or(settings.notification_minutes);
            
            if task.completed {
                debug_info.push(format!("Task '{}': SKIPPED (completed)", task.description));
                continue;
            }
            
            if task.notified {
                debug_info.push(format!("Task '{}': SKIPPED (already notified)", task.description));
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
                let date_str = task.due_date.split_whitespace().next().unwrap_or(&task.due_date);
                if let Ok(due_date) = NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
                    let due_midnight = Local.from_local_datetime(&due_date.and_hms_opt(0, 0, 0).unwrap()).unwrap();
                    let duration = due_midnight.signed_duration_since(now);
                    duration.num_minutes()
                } else {
                    debug_info.push(format!("Task '{}': ERROR parsing date '{}': invalid format", task.description, task.due_date));
                    continue;
                }
            };
            
            debug_info.push(format!(
                "Task '{}': due_date={}, minutes_until_due={}, threshold={}, will_notify={}",
                task.description, task.due_date, minutes_until_due, task_threshold,
                minutes_until_due <= task_threshold as i64 && minutes_until_due >= 0
            ));
            
            if minutes_until_due <= task_threshold as i64 && minutes_until_due >= 0 {
                tasks_to_notify.push(task.clone());
                task.notified = true;
                changed = true;
            }
        }
        
        if changed {
            save_tasks(&tasks, &data_file);
            debug_info.push("Tasks updated and saved".to_string());
        }
    }

    let count = tasks_to_notify.len();
    for task in &tasks_to_notify {
        let subject = format!("[Todo App] Task Due: {}", task.description);
        let body = format!(
            "Your task '{}' is due on {}.\n\nDetails: {}\nGroup: {}",
            task.description, task.due_date, task.details, task.group
        );
        
        match send_email(&settings, &settings.email, &subject, &body) {
            Ok(_) => debug_info.push(format!("✓ Email sent for task '{}'", task.description)),
            Err(e) => debug_info.push(format!("✗ Failed to send email for task '{}': {}", task.description, e)),
        }
    }
    
    let result = format!(
        "Notification check complete.\n\nSent {} email(s).\n\n--- Debug Info ---\n{}",
        count, debug_info.join("\n")
    );
    
    Ok(result)
}

// Memo Commands
#[tauri::command]
fn get_memos(state: State<AppState>) -> Vec<Memo> {
    let memos = state.memos.lock().unwrap();
    memos.clone()
}

#[tauri::command]
fn get_memo(state: State<AppState>, id: String) -> Option<Memo> {
    let memos = state.memos.lock().unwrap();
    memos.iter().find(|m| m.id == id).cloned()
}

#[tauri::command]
fn create_memo(
    state: State<AppState>,
    title: String,
    content: String,
    folder_id: Option<String>,
    tags: Vec<String>,
) -> Result<Vec<Memo>, String> {
    let mut memos = state.memos.lock().unwrap();
    let memo = Memo::new(title, content, folder_id, tags);
    memos.push(memo);
    save_memos(&memos)?;
    Ok(memos.clone())
}

#[tauri::command]
fn update_memo(
    state: State<AppState>,
    id: String,
    title: String,
    content: String,
    folder_id: Option<String>,
    tags: Vec<String>,
) -> Result<Vec<Memo>, String> {
    let mut memos = state.memos.lock().unwrap();
    if let Some(memo) = memos.iter_mut().find(|m| m.id == id) {
        memo.update(title, content, folder_id, tags);
        save_memos(&memos)?;
    }
    Ok(memos.clone())
}

#[tauri::command]
fn delete_memo(state: State<AppState>, id: String) -> Result<Vec<Memo>, String> {
    let mut memos = state.memos.lock().unwrap();
    memos.retain(|m| m.id != id);
    save_memos(&memos)?;
    Ok(memos.clone())
}

#[tauri::command]
fn search_memos(state: State<AppState>, query: String) -> Vec<Memo> {
    let memos = state.memos.lock().unwrap();
    let query_lower = query.to_lowercase();
    memos
        .iter()
        .filter(|m| {
            m.title.to_lowercase().contains(&query_lower)
                || m.content.to_lowercase().contains(&query_lower)
                || m.tags.iter().any(|t| t.to_lowercase().contains(&query_lower))
        })
        .cloned()
        .collect()
}

#[tauri::command]
fn get_all_tags(state: State<AppState>) -> Vec<String> {
    let memos = state.memos.lock().unwrap();
    let mut tags: Vec<String> = memos
        .iter()
        .flat_map(|m| m.tags.clone())
        .collect();
    tags.sort();
    tags.dedup();
    tags
}

// Folder Commands
#[tauri::command]
fn get_folders(state: State<AppState>) -> Vec<Folder> {
    let folders = state.folders.lock().unwrap();
    folders.clone()
}

#[tauri::command]
fn create_folder(
    state: State<AppState>,
    name: String,
    parent_id: Option<String>,
) -> Result<Vec<Folder>, String> {
    let mut folders = state.folders.lock().unwrap();
    let folder = Folder::new(name, parent_id);
    folders.push(folder);
    save_folders(&folders)?;
    Ok(folders.clone())
}

#[tauri::command]
fn update_folder(state: State<AppState>, id: String, name: String) -> Result<Vec<Folder>, String> {
    let mut folders = state.folders.lock().unwrap();
    if let Some(folder) = folders.iter_mut().find(|f| f.id == id) {
        folder.name = name;
        save_folders(&folders)?;
    }
    Ok(folders.clone())
}

#[tauri::command]
fn delete_folder(state: State<AppState>, id: String) -> Result<Vec<Folder>, String> {
    let mut folders = state.folders.lock().unwrap();
    let mut memos = state.memos.lock().unwrap();
    
    // Remove folder
    folders.retain(|f| f.id != id);
    
    // Remove folder_id from memos in this folder
    for memo in memos.iter_mut() {
        if memo.folder_id.as_ref() == Some(&id) {
            memo.folder_id = None;
        }
    }
    
    save_folders(&folders)?;
    save_memos(&memos)?;
    Ok(folders.clone())
}

// Reading Book Commands
#[tauri::command]
fn get_reading_books(state: State<AppState>) -> Vec<ReadingBook> {
    let books = state.reading_books.lock().unwrap();
    books.clone()
}

#[tauri::command]
fn create_reading_book(
    state: State<AppState>,
    title: String,
) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    let book = ReadingBook::new(title);
    books.push(book);
    save_reading_books(&books)?;
    Ok(books.clone())
}

#[tauri::command]
fn update_reading_book(
    state: State<AppState>,
    id: String,
    title: String,
    author: Option<String>,
    isbn: Option<String>,
    publisher: Option<String>,
    published_year: Option<i32>,
    cover_image_url: Option<String>,
    genres: Vec<String>,
    status: ReadingStatus,
    start_date: Option<DateTime<Utc>>,
    finish_date: Option<DateTime<Utc>>,
    total_pages: Option<u32>,
    current_page: Option<u32>,
    rating: Option<u8>,
    summary: String,
    tags: Vec<String>,
) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    if let Some(book) = books.iter_mut().find(|b| b.id == id) {
        book.update(
            title,
            author,
            isbn,
            publisher,
            published_year,
            cover_image_url,
            genres,
            status,
            start_date,
            finish_date,
            total_pages,
            current_page,
            rating,
            summary,
            tags,
        );
        save_reading_books(&books)?;
    }
    Ok(books.clone())
}

#[tauri::command]
fn delete_reading_book(state: State<AppState>, id: String) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    books.retain(|b| b.id != id);
    save_reading_books(&books)?;
    Ok(books.clone())
}

// Reading Note Commands
#[tauri::command]
fn add_reading_note(
    state: State<AppState>,
    book_id: String,
    page_number: Option<u32>,
    quote: Option<String>,
    comment: String,
) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
        let note = ReadingNote::new(page_number, quote, comment);
        book.notes.push(note);
        book.updated_at = Utc::now();
        save_reading_books(&books)?;
    }
    Ok(books.clone())
}

#[tauri::command]
fn update_reading_note(
    state: State<AppState>,
    book_id: String,
    note_id: String,
    page_number: Option<u32>,
    quote: Option<String>,
    comment: String,
) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
        if let Some(note) = book.notes.iter_mut().find(|n| n.id == note_id) {
            note.page_number = page_number;
            note.quote = quote;
            note.comment = comment;
            book.updated_at = Utc::now();
            save_reading_books(&books)?;
        }
    }
    Ok(books.clone())
}

#[tauri::command]
fn delete_reading_note(
    state: State<AppState>,
    book_id: String,
    note_id: String,
) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
        book.notes.retain(|n| n.id != note_id);
        book.updated_at = Utc::now();
        save_reading_books(&books)?;
    }
    Ok(books.clone())
}

// Reading Session Commands
#[tauri::command]
fn add_reading_session(
    state: State<AppState>,
    book_id: String,
    session_date: DateTime<Utc>,
    start_page: Option<u32>,
    end_page: Option<u32>,
    pages_read: u32,
    duration_minutes: Option<u32>,
    memo: Option<String>,
) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
        let session = ReadingSession::new(
            session_date,
            start_page,
            end_page,
            pages_read,
            duration_minutes,
            memo,
        );
        book.reading_sessions.push(session);
        book.updated_at = Utc::now();
        save_reading_books(&books)?;
    }
    Ok(books.clone())
}

#[tauri::command]
fn update_reading_session(
    state: State<AppState>,
    book_id: String,
    session_id: String,
    session_date: DateTime<Utc>,
    start_page: Option<u32>,
    end_page: Option<u32>,
    pages_read: u32,
    duration_minutes: Option<u32>,
    memo: Option<String>,
) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
        if let Some(session) = book.reading_sessions.iter_mut().find(|s| s.id == session_id) {
            session.session_date = session_date;
            session.start_page = start_page;
            session.end_page = end_page;
            session.pages_read = pages_read;
            session.duration_minutes = duration_minutes;
            session.memo = memo;
            book.updated_at = Utc::now();
            save_reading_books(&books)?;
        }
    }
    Ok(books.clone())
}

#[tauri::command]
fn delete_reading_session(
    state: State<AppState>,
    book_id: String,
    session_id: String,
) -> Result<Vec<ReadingBook>, String> {
    let mut books = state.reading_books.lock().unwrap();
    if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
        book.reading_sessions.retain(|s| s.id != session_id);
        book.updated_at = Utc::now();
        save_reading_books(&books)?;
    }
    Ok(books.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Resolve app data directory
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            let data_file = app_data_dir.join("tasks.json");
            let groups_file = app_data_dir.join("groups.json");

            let mail_settings_file = app_data_dir.join("settings.json");

            // Ensure directory exists
            if !app_data_dir.exists() {
                let _ = fs::create_dir_all(&app_data_dir);
            }

            // Load tasks and groups
            let tasks = load_tasks(&data_file);
            let groups = load_groups(&groups_file);
            let mail_settings = load_settings(&mail_settings_file);
            let max_id = tasks.iter().map(|t| t.id).max().unwrap_or(0);

            // Initialize state
            app.manage(AppState {
                tasks: Mutex::new(tasks),
                groups: Mutex::new(groups),
                next_id: Mutex::new(max_id + 1),
                data_file: Mutex::new(data_file),
                groups_file: Mutex::new(groups_file),
                mail_settings: Mutex::new(mail_settings),
                mail_settings_file: Mutex::new(mail_settings_file),
                memos: Mutex::new(load_memos().unwrap_or_default()),
                folders: Mutex::new(load_folders().unwrap_or_default()),
                reading_books: Mutex::new(load_reading_books().unwrap_or_default()),
            });

            // Background task for notifications
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60)); // Check every 60 seconds for testing
                
                loop {
                    interval.tick().await;
                    
                    let state = app_handle.state::<AppState>();
                    let settings = {
                        let s = state.mail_settings.lock().unwrap();
                        s.clone()
                    };
                    
                    if settings.email.is_empty() || settings.app_password.is_empty() {
                        continue;
                    }
                    
                    let mut tasks_to_notify = Vec::new();
                    let now = Local::now();
                    
                    {
                        let mut tasks = state.tasks.lock().unwrap();
                        let data_file = state.data_file.lock().unwrap();
                        let mut changed = false;

                        for task in tasks.iter_mut() {
                            if task.completed || task.notified {
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
                                let date_str = task.due_date.split_whitespace().next().unwrap_or(&task.due_date);
                                if let Ok(due_date) = NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
                                    let due_midnight = Local.from_local_datetime(&due_date.and_hms_opt(0, 0, 0).unwrap()).unwrap();
                                    let duration = due_midnight.signed_duration_since(now);
                                    duration.num_minutes()
                                } else {
                                    continue;
                                }
                            };
                            
                            let threshold = task.notification_minutes.unwrap_or(settings.notification_minutes);
                            
                            if minutes_until_due <= threshold as i64 && minutes_until_due >= 0 {
                                tasks_to_notify.push(task.clone());
                                task.notified = true;
                                changed = true;
                            }
                        }
                        
                        if changed {
                            save_tasks(&tasks, &data_file);
                        }
                    }

                    for task in tasks_to_notify {
                        let subject = format!("[Todo App] Task Due: {}", task.description);
                        let body = format!(
                            "Your task '{}' is due on {}.\n\nDetails: {}\nGroup: {}",
                            task.description, task.due_date, task.details, task.group
                        );
                        
                        let _ = send_email(&settings, &settings.email, &subject, &body);
                    }
                }
            });

            // Set window icon for Linux/Ubuntu
            #[cfg(target_os = "linux")]
            {
                if let Some(window) = app.get_webview_window("main") {
                    // Embed the icon at compile time
                    let icon_bytes = include_bytes!("../icons/icon.png");

                    if let Ok(img) = image::load_from_memory(icon_bytes) {
                        let rgba = img.to_rgba8();
                        let (width, height) = rgba.dimensions();
                        let icon = tauri::image::Image::new(rgba.as_raw(), width, height);
                        let _ = window.set_icon(icon);
                    }
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_tasks,
            get_groups,
            create_group,
            delete_group,
            add_task,
            update_task,
            delete_task,
            complete_task,
            get_mail_settings,
            save_mail_settings,
            send_test_email,
            check_notifications,
            get_memos,
            get_memo,
            create_memo,
            update_memo,
            delete_memo,
            search_memos,
            get_all_tags,
            get_folders,
            create_folder,
            update_folder,
            delete_folder,
            get_reading_books,
            create_reading_book,
            update_reading_book,
            delete_reading_book,
            add_reading_note,
            update_reading_note,
            delete_reading_note,
            add_reading_session,
            update_reading_session,
            delete_reading_session
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
