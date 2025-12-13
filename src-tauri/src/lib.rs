// Tauri アプリケーションのエントリポイント

use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use chrono::{Local, NaiveDate, NaiveDateTime, TimeZone};
use tauri::Manager;

// モジュール宣言
mod commands;
mod database;
mod mail;
mod memo;
mod notification;
mod reading_memo;
mod settings;
mod task;

// 再エクスポート
use mail::send_email;
use memo::{Folder, Memo};
use reading_memo::ReadingBook;
use settings::MailSettings;
use task::Task;

// コマンドの使用
use commands::{
    // 読書記録関連
    add_reading_note,
    add_reading_session,
    // タスク関連
    add_subtask,
    add_task,
    check_notifications,
    complete_task,
    // メモ関連
    create_folder,
    create_group,
    create_memo,
    create_reading_book,
    delete_folder,
    delete_group,
    delete_memo,
    delete_reading_book,
    delete_reading_note,
    delete_reading_session,
    delete_subtask,
    delete_task,
    get_all_tags,
    get_folders,
    get_groups,
    get_mail_settings,
    get_memo,
    get_memos,
    get_reading_books,
    get_tasks,
    save_mail_settings,
    search_memos,
    send_test_email,
    toggle_subtask,
    update_folder,
    update_memo,
    update_reading_book,
    update_reading_note,
    update_reading_session,
    update_subtask,
    update_task,
};

use sqlx::SqlitePool;

/// アプリ内の状態を一括で管理している構造体
pub struct AppState {
    pub db: SqlitePool,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // アプリが既に起動している場合、既存のウィンドウをフォーカス
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
                let _ = window.unminimize();
            }
        }))
        .setup(|app| {
            // Resolve app data directory
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");

            // Ensure directory exists
            if !app_data_dir.exists() {
                let _ = fs::create_dir_all(&app_data_dir);
            }

            // Initialize database (blocking in setup)
            let db = tauri::async_runtime::block_on(async {
                database::init_db(&app_data_dir)
                    .await
                    .expect("Failed to initialize database")
            });

            // Load data from database
            let (tasks, groups, mail_settings, memos, folders, reading_books) =
                tauri::async_runtime::block_on(async {
                    let tasks = database::db_load_tasks(&db).await.unwrap_or_default();
                    let groups = database::db_load_groups(&db).await.unwrap_or_default();
                    let settings = database::db_load_settings(&db).await.unwrap_or_default();
                    let memos = database::db_load_memos(&db).await.unwrap_or_default();
                    let folders = database::db_load_folders(&db).await.unwrap_or_default();
                    let books = database::db_load_reading_books(&db)
                        .await
                        .unwrap_or_default();
                    (tasks, groups, settings, memos, folders, books)
                });

            let max_id = tasks.iter().map(|t| t.id).max().unwrap_or(0);

            // Initialize state (data_file and groups_file kept for backward compatibility during transition)
            let data_file = app_data_dir.join("tasks.json");
            let groups_file = app_data_dir.join("groups.json");
            let mail_settings_file = app_data_dir.join("settings.json");

            app.manage(AppState {
                db,
                tasks: Mutex::new(tasks),
                groups: Mutex::new(groups),
                next_id: Mutex::new(max_id + 1),
                data_file: Mutex::new(data_file),
                groups_file: Mutex::new(groups_file),
                mail_settings: Mutex::new(mail_settings),
                mail_settings_file: Mutex::new(mail_settings_file),
                memos: Mutex::new(memos),
                folders: Mutex::new(folders),
                reading_books: Mutex::new(reading_books),
            });

            // Background task for notifications
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(60));

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

                    let tasks_to_update: Vec<Task> = {
                        let mut tasks = state.tasks.lock().unwrap();
                        let mut updated = Vec::new();

                        for task in tasks.iter_mut() {
                            if task.completed || task.notified {
                                continue;
                            }

                            // Try parsing as DateTime first, then fall back to Date
                            let due_time_result =
                                NaiveDateTime::parse_from_str(&task.due_date, "%Y-%m-%d %H:%M");
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
                                if let Ok(due_date) =
                                    NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
                                {
                                    let due_midnight = Local
                                        .from_local_datetime(
                                            &due_date.and_hms_opt(0, 0, 0).unwrap(),
                                        )
                                        .unwrap();
                                    let duration = due_midnight.signed_duration_since(now);
                                    duration.num_minutes()
                                } else {
                                    continue;
                                }
                            };

                            let threshold = task
                                .notification_minutes
                                .unwrap_or(settings.notification_minutes);

                            if minutes_until_due <= threshold as i64 && minutes_until_due >= 0 {
                                tasks_to_notify.push(task.clone());
                                task.notified = true;
                                updated.push(task.clone());
                            }
                        }
                        updated
                    };

                    // Save updated tasks to database
                    for task in &tasks_to_update {
                        let _ = database::db_save_task(&state.db, task).await;
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
            delete_reading_session,
            add_subtask,
            update_subtask,
            delete_subtask,
            toggle_subtask
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
