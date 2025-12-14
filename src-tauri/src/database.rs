// データベース接続とマイグレーション管理

use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use std::fs;
use std::path::PathBuf;

/// データベースプールを初期化
pub async fn init_db(data_dir: &PathBuf) -> Result<SqlitePool, String> {
    // ディレクトリが存在しない場合は作成
    if !data_dir.exists() {
        fs::create_dir_all(data_dir).map_err(|e| format!("Failed to create data dir: {}", e))?;
    }

    let db_path = data_dir.join("noruno.db");
    // Windows path handling: ensure we use forward slashes for the URL
    let db_path_str = db_path.to_string_lossy().replace('\\', "/");
    let db_url = format!("sqlite:{}?mode=rwc", db_path_str);

    // 接続プールを作成
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    // マイグレーションを実行
    run_migrations(&pool).await?;

    // 既存JSONデータからの移行をチェック
    migrate_from_json(&pool, data_dir).await?;

    Ok(pool)
}

/// SQLマイグレーションを実行
async fn run_migrations(pool: &SqlitePool) -> Result<(), String> {
    // 各マイグレーションファイルを順番に実行
    let migrations = [
        include_str!("../migrations/001_create_tasks.sql"),
        include_str!("../migrations/002_create_groups.sql"),
        include_str!("../migrations/003_create_settings.sql"),
        include_str!("../migrations/004_create_memos.sql"),
        include_str!("../migrations/005_create_folders.sql"),
        include_str!("../migrations/006_create_reading_books.sql"),
        include_str!("../migrations/007_create_calendar_events.sql"),
    ];

    for sql in migrations {
        // Split by semicolon to handle multiple statements
        for statement in sql.split(';') {
            let statement = statement.trim();
            if !statement.is_empty() {
                sqlx::raw_sql(statement)
                    .execute(pool)
                    .await
                    .map_err(|e| format!("Migration failed: {}", e))?;
            }
        }
    }

    Ok(())
}

/// 既存のJSONファイルからデータを移行
async fn migrate_from_json(pool: &SqlitePool, data_dir: &PathBuf) -> Result<(), String> {
    // マイグレーション済みフラグファイルをチェック
    let migration_flag = data_dir.join(".db_migrated");
    if migration_flag.exists() {
        return Ok(()); // 既に移行済み
    }

    // タスクの移行
    migrate_tasks(pool, data_dir).await?;

    // グループの移行
    migrate_groups(pool, data_dir).await?;

    // 設定の移行
    migrate_settings(pool, data_dir).await?;

    // メモの移行
    migrate_memos(pool, data_dir).await?;

    // フォルダの移行
    migrate_folders(pool, data_dir).await?;

    // 読書記録の移行
    migrate_reading_books(pool, data_dir).await?;

    // 移行完了フラグを作成
    fs::write(&migration_flag, "migrated")
        .map_err(|e| format!("Failed to write migration flag: {}", e))?;

    // 古いJSONファイルをバックアップ
    backup_json_files(data_dir)?;

    Ok(())
}

/// タスクデータの移行
async fn migrate_tasks(pool: &SqlitePool, data_dir: &PathBuf) -> Result<(), String> {
    use crate::task::{load_tasks, Task};

    let tasks_file = data_dir.join("tasks.json");
    if !tasks_file.exists() {
        return Ok(());
    }

    let tasks: Vec<Task> = load_tasks(&tasks_file);

    for task in tasks {
        let subtasks_json =
            serde_json::to_string(&task.subtasks).unwrap_or_else(|_| "[]".to_string());

        sqlx::query(
            r#"
            INSERT OR REPLACE INTO tasks (id, description, due_date, group_name, details, completed, notified, notification_minutes, subtasks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(task.id)
        .bind(&task.description)
        .bind(&task.due_date)
        .bind(&task.group)
        .bind(&task.details)
        .bind(task.completed)
        .bind(task.notified)
        .bind(task.notification_minutes)
        .bind(&subtasks_json)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to migrate task: {}", e))?;
    }

    Ok(())
}

/// グループデータの移行
async fn migrate_groups(pool: &SqlitePool, data_dir: &PathBuf) -> Result<(), String> {
    use crate::task::load_groups;

    let groups_file = data_dir.join("groups.json");
    if !groups_file.exists() {
        return Ok(());
    }

    let groups: Vec<String> = load_groups(&groups_file);

    for group in groups {
        sqlx::query("INSERT OR IGNORE INTO groups (name) VALUES (?)")
            .bind(&group)
            .execute(pool)
            .await
            .map_err(|e| format!("Failed to migrate group: {}", e))?;
    }

    Ok(())
}

/// 設定データの移行
async fn migrate_settings(pool: &SqlitePool, data_dir: &PathBuf) -> Result<(), String> {
    use crate::settings::load_settings;

    let settings_file = data_dir.join("settings.json");
    if !settings_file.exists() {
        return Ok(());
    }

    let settings = load_settings(&settings_file);

    // 設定をkey-value形式で保存
    let settings_json = serde_json::to_string(&settings).unwrap_or_else(|_| "{}".to_string());

    sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('mail_settings', ?)")
        .bind(&settings_json)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to migrate settings: {}", e))?;

    Ok(())
}

/// メモデータの移行
async fn migrate_memos(pool: &SqlitePool, _data_dir: &PathBuf) -> Result<(), String> {
    use crate::memo::{load_memos, Memo};

    let memos: Vec<Memo> = load_memos().unwrap_or_default();

    for memo in memos {
        let tags_json = serde_json::to_string(&memo.tags).unwrap_or_else(|_| "[]".to_string());

        sqlx::query(
            r#"
            INSERT OR REPLACE INTO memos (id, title, content, folder_id, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&memo.id)
        .bind(&memo.title)
        .bind(&memo.content)
        .bind(&memo.folder_id)
        .bind(&tags_json)
        .bind(memo.created_at.to_rfc3339())
        .bind(memo.updated_at.to_rfc3339())
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to migrate memo: {}", e))?;
    }

    Ok(())
}

/// フォルダデータの移行
async fn migrate_folders(pool: &SqlitePool, _data_dir: &PathBuf) -> Result<(), String> {
    use crate::memo::{load_folders, Folder};

    let folders: Vec<Folder> = load_folders().unwrap_or_default();

    for folder in folders {
        sqlx::query(
            r#"
            INSERT OR REPLACE INTO folders (id, name, parent_id)
            VALUES (?, ?, ?)
            "#,
        )
        .bind(&folder.id)
        .bind(&folder.name)
        .bind(&folder.parent_id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to migrate folder: {}", e))?;
    }

    Ok(())
}

/// 読書記録データの移行
async fn migrate_reading_books(pool: &SqlitePool, _data_dir: &PathBuf) -> Result<(), String> {
    use crate::reading_memo::{load_reading_books, ReadingBook, ReadingStatus};

    let books: Vec<ReadingBook> = load_reading_books().unwrap_or_default();

    for book in books {
        let genres_json = serde_json::to_string(&book.genres).unwrap_or_else(|_| "[]".to_string());
        let notes_json = serde_json::to_string(&book.notes).unwrap_or_else(|_| "[]".to_string());
        let sessions_json =
            serde_json::to_string(&book.reading_sessions).unwrap_or_else(|_| "[]".to_string());
        let tags_json = serde_json::to_string(&book.tags).unwrap_or_else(|_| "[]".to_string());

        let status_str = match book.status {
            ReadingStatus::WantToRead => "want_to_read",
            ReadingStatus::Reading => "reading",
            ReadingStatus::Finished => "finished",
            ReadingStatus::Paused => "paused",
        };

        sqlx::query(
            r#"
            INSERT OR REPLACE INTO reading_books (
                id, title, author, isbn, publisher, published_year, cover_image_url,
                genres, status, start_date, finish_date, progress_percent,
                total_pages, current_page, rating, summary, notes, reading_sessions, tags,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&book.id)
        .bind(&book.title)
        .bind(&book.author)
        .bind(&book.isbn)
        .bind(&book.publisher)
        .bind(book.published_year)
        .bind(&book.cover_image_url)
        .bind(&genres_json)
        .bind(status_str)
        .bind(book.start_date.map(|d| d.to_rfc3339()))
        .bind(book.finish_date.map(|d| d.to_rfc3339()))
        .bind(book.progress_percent.map(|p| p as i32))
        .bind(book.total_pages.map(|p| p as i32))
        .bind(book.current_page.map(|p| p as i32))
        .bind(book.rating.map(|r| r as i32))
        .bind(&book.summary)
        .bind(&notes_json)
        .bind(&sessions_json)
        .bind(&tags_json)
        .bind(book.created_at.to_rfc3339())
        .bind(book.updated_at.to_rfc3339())
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to migrate reading book: {}", e))?;
    }

    Ok(())
}

/// JSONファイルをバックアップ
fn backup_json_files(data_dir: &PathBuf) -> Result<(), String> {
    let files = [
        "tasks.json",
        "groups.json",
        "settings.json",
        "memos.json",
        "folders.json",
        "reading_books.json",
    ];

    for file in files {
        let src = data_dir.join(file);
        if src.exists() {
            let dst = data_dir.join(format!("{}.bak", file));
            fs::rename(&src, &dst).map_err(|e| format!("Failed to backup {}: {}", file, e))?;
        }
    }

    Ok(())
}

// ========================================
// データベース CRUD 関数
// ========================================

use crate::memo::{Folder, Memo};
use crate::reading_memo::{ReadingBook, ReadingStatus};
use crate::settings::MailSettings;
use crate::task::{Subtask, Task};
use chrono::{DateTime, Utc};
use sqlx::Row;

// --- Tasks ---

/// データベースから全タスクを読み込み
pub async fn db_load_tasks(pool: &SqlitePool) -> Result<Vec<Task>, String> {
    let rows = sqlx::query(
        "SELECT id, description, due_date, group_name, details, completed, notified, notification_minutes, subtasks FROM tasks"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to load tasks: {}", e))?;

    let mut tasks = Vec::new();
    for row in rows {
        let subtasks_json: String = row.get("subtasks");
        let subtasks: Vec<Subtask> = serde_json::from_str(&subtasks_json).unwrap_or_default();

        tasks.push(Task {
            id: row.get("id"),
            description: row.get("description"),
            due_date: row.get("due_date"),
            group: row.get("group_name"),
            details: row.get("details"),
            completed: row.get::<i32, _>("completed") != 0,
            notified: row.get::<i32, _>("notified") != 0,
            notification_minutes: row.get("notification_minutes"),
            subtasks,
        });
    }

    Ok(tasks)
}

/// タスクをデータベースに保存（upsert）
pub async fn db_save_task(pool: &SqlitePool, task: &Task) -> Result<(), String> {
    let subtasks_json = serde_json::to_string(&task.subtasks).unwrap_or_else(|_| "[]".to_string());

    sqlx::query(
        r#"
        INSERT INTO tasks (id, description, due_date, group_name, details, completed, notified, notification_minutes, subtasks, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            description = excluded.description,
            due_date = excluded.due_date,
            group_name = excluded.group_name,
            details = excluded.details,
            completed = excluded.completed,
            notified = excluded.notified,
            notification_minutes = excluded.notification_minutes,
            subtasks = excluded.subtasks,
            updated_at = CURRENT_TIMESTAMP
        "#,
    )
    .bind(task.id)
    .bind(&task.description)
    .bind(&task.due_date)
    .bind(&task.group)
    .bind(&task.details)
    .bind(task.completed)
    .bind(task.notified)
    .bind(task.notification_minutes)
    .bind(&subtasks_json)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to save task: {}", e))?;

    Ok(())
}

/// タスクを削除
pub async fn db_delete_task(pool: &SqlitePool, id: i32) -> Result<(), String> {
    sqlx::query("DELETE FROM tasks WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete task: {}", e))?;

    Ok(())
}

// --- Groups ---

/// 全グループを読み込み
pub async fn db_load_groups(pool: &SqlitePool) -> Result<Vec<String>, String> {
    let rows = sqlx::query("SELECT name FROM groups ORDER BY created_at")
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Failed to load groups: {}", e))?;

    Ok(rows.iter().map(|r| r.get("name")).collect())
}

/// グループを追加
pub async fn db_add_group(pool: &SqlitePool, name: &str) -> Result<(), String> {
    sqlx::query("INSERT OR IGNORE INTO groups (name) VALUES (?)")
        .bind(name)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to add group: {}", e))?;

    Ok(())
}

/// グループを削除
pub async fn db_delete_group(pool: &SqlitePool, name: &str) -> Result<(), String> {
    sqlx::query("DELETE FROM groups WHERE name = ?")
        .bind(name)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete group: {}", e))?;

    // タスクのグループ参照をクリア
    sqlx::query("UPDATE tasks SET group_name = '' WHERE group_name = ?")
        .bind(name)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to update tasks: {}", e))?;

    Ok(())
}

// --- Settings ---

/// 設定を読み込み
pub async fn db_load_settings(pool: &SqlitePool) -> Result<MailSettings, String> {
    let row = sqlx::query("SELECT value FROM settings WHERE key = 'mail_settings'")
        .fetch_optional(pool)
        .await
        .map_err(|e| format!("Failed to load settings: {}", e))?;

    match row {
        Some(r) => {
            let json: String = r.get("value");
            serde_json::from_str(&json).map_err(|e| format!("Failed to parse settings: {}", e))
        }
        None => Ok(MailSettings::default()),
    }
}

/// 設定を保存
pub async fn db_save_settings(pool: &SqlitePool, settings: &MailSettings) -> Result<(), String> {
    let json = serde_json::to_string(settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('mail_settings', ?)")
        .bind(&json)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to save settings: {}", e))?;

    Ok(())
}

// --- Memos ---

/// 全メモを読み込み
pub async fn db_load_memos(pool: &SqlitePool) -> Result<Vec<Memo>, String> {
    let rows = sqlx::query(
        "SELECT id, title, content, folder_id, tags, created_at, updated_at FROM memos",
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to load memos: {}", e))?;

    let mut memos = Vec::new();
    for row in rows {
        let tags_json: String = row.get("tags");
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();

        let created_at: String = row.get("created_at");
        let updated_at: String = row.get("updated_at");

        memos.push(Memo {
            id: row.get("id"),
            title: row.get("title"),
            content: row.get("content"),
            folder_id: row.get("folder_id"),
            tags,
            created_at: DateTime::parse_from_rfc3339(&created_at)
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
            updated_at: DateTime::parse_from_rfc3339(&updated_at)
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
        });
    }

    Ok(memos)
}

/// メモを保存
pub async fn db_save_memo(pool: &SqlitePool, memo: &Memo) -> Result<(), String> {
    let tags_json = serde_json::to_string(&memo.tags).unwrap_or_else(|_| "[]".to_string());

    sqlx::query(
        r#"
        INSERT INTO memos (id, title, content, folder_id, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            content = excluded.content,
            folder_id = excluded.folder_id,
            tags = excluded.tags,
            updated_at = excluded.updated_at
        "#,
    )
    .bind(&memo.id)
    .bind(&memo.title)
    .bind(&memo.content)
    .bind(&memo.folder_id)
    .bind(&tags_json)
    .bind(memo.created_at.to_rfc3339())
    .bind(memo.updated_at.to_rfc3339())
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to save memo: {}", e))?;

    Ok(())
}

/// メモを削除
pub async fn db_delete_memo(pool: &SqlitePool, id: &str) -> Result<(), String> {
    sqlx::query("DELETE FROM memos WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete memo: {}", e))?;

    Ok(())
}

// --- Folders ---

/// 全フォルダを読み込み
pub async fn db_load_folders(pool: &SqlitePool) -> Result<Vec<Folder>, String> {
    let rows = sqlx::query("SELECT id, name, parent_id FROM folders")
        .fetch_all(pool)
        .await
        .map_err(|e| format!("Failed to load folders: {}", e))?;

    Ok(rows
        .iter()
        .map(|row| Folder {
            id: row.get("id"),
            name: row.get("name"),
            parent_id: row.get("parent_id"),
        })
        .collect())
}

/// フォルダを保存
pub async fn db_save_folder(pool: &SqlitePool, folder: &Folder) -> Result<(), String> {
    sqlx::query(
        r#"
        INSERT INTO folders (id, name, parent_id)
        VALUES (?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            parent_id = excluded.parent_id
        "#,
    )
    .bind(&folder.id)
    .bind(&folder.name)
    .bind(&folder.parent_id)
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to save folder: {}", e))?;

    Ok(())
}

/// フォルダを削除
pub async fn db_delete_folder(pool: &SqlitePool, id: &str) -> Result<(), String> {
    sqlx::query("DELETE FROM folders WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete folder: {}", e))?;

    Ok(())
}

// --- Reading Books ---

/// 全読書記録を読み込み
pub async fn db_load_reading_books(pool: &SqlitePool) -> Result<Vec<ReadingBook>, String> {
    let rows = sqlx::query(
        r#"SELECT id, title, author, isbn, publisher, published_year, cover_image_url,
           genres, status, start_date, finish_date, progress_percent,
           total_pages, current_page, rating, summary, notes, reading_sessions, tags,
           created_at, updated_at FROM reading_books"#,
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to load reading books: {}", e))?;

    let mut books = Vec::new();
    for row in rows {
        let genres_json: String = row.get("genres");
        let notes_json: String = row.get("notes");
        let sessions_json: String = row.get("reading_sessions");
        let tags_json: String = row.get("tags");
        let status_str: String = row.get("status");

        let status = match status_str.as_str() {
            "reading" => ReadingStatus::Reading,
            "finished" => ReadingStatus::Finished,
            "paused" => ReadingStatus::Paused,
            _ => ReadingStatus::WantToRead,
        };

        let start_date: Option<String> = row.get("start_date");
        let finish_date: Option<String> = row.get("finish_date");
        let created_at: String = row.get("created_at");
        let updated_at: String = row.get("updated_at");

        books.push(ReadingBook {
            id: row.get("id"),
            title: row.get("title"),
            author: row.get("author"),
            isbn: row.get("isbn"),
            publisher: row.get("publisher"),
            published_year: row.get("published_year"),
            cover_image_url: row.get("cover_image_url"),
            genres: serde_json::from_str(&genres_json).unwrap_or_default(),
            status,
            start_date: start_date.and_then(|s| {
                DateTime::parse_from_rfc3339(&s)
                    .ok()
                    .map(|d| d.with_timezone(&Utc))
            }),
            finish_date: finish_date.and_then(|s| {
                DateTime::parse_from_rfc3339(&s)
                    .ok()
                    .map(|d| d.with_timezone(&Utc))
            }),
            progress_percent: row
                .get::<Option<i32>, _>("progress_percent")
                .map(|p| p as u8),
            total_pages: row.get::<Option<i32>, _>("total_pages").map(|p| p as u32),
            current_page: row.get::<Option<i32>, _>("current_page").map(|p| p as u32),
            rating: row.get::<Option<i32>, _>("rating").map(|r| r as u8),
            summary: row.get("summary"),
            notes: serde_json::from_str(&notes_json).unwrap_or_default(),
            reading_sessions: serde_json::from_str(&sessions_json).unwrap_or_default(),
            tags: serde_json::from_str(&tags_json).unwrap_or_default(),
            created_at: DateTime::parse_from_rfc3339(&created_at)
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
            updated_at: DateTime::parse_from_rfc3339(&updated_at)
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
        });
    }

    Ok(books)
}

/// 読書記録を保存
pub async fn db_save_reading_book(pool: &SqlitePool, book: &ReadingBook) -> Result<(), String> {
    let genres_json = serde_json::to_string(&book.genres).unwrap_or_else(|_| "[]".to_string());
    let notes_json = serde_json::to_string(&book.notes).unwrap_or_else(|_| "[]".to_string());
    let sessions_json =
        serde_json::to_string(&book.reading_sessions).unwrap_or_else(|_| "[]".to_string());
    let tags_json = serde_json::to_string(&book.tags).unwrap_or_else(|_| "[]".to_string());

    let status_str = match book.status {
        ReadingStatus::WantToRead => "want_to_read",
        ReadingStatus::Reading => "reading",
        ReadingStatus::Finished => "finished",
        ReadingStatus::Paused => "paused",
    };

    sqlx::query(
        r#"
        INSERT INTO reading_books (
            id, title, author, isbn, publisher, published_year, cover_image_url,
            genres, status, start_date, finish_date, progress_percent,
            total_pages, current_page, rating, summary, notes, reading_sessions, tags,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            author = excluded.author,
            isbn = excluded.isbn,
            publisher = excluded.publisher,
            published_year = excluded.published_year,
            cover_image_url = excluded.cover_image_url,
            genres = excluded.genres,
            status = excluded.status,
            start_date = excluded.start_date,
            finish_date = excluded.finish_date,
            progress_percent = excluded.progress_percent,
            total_pages = excluded.total_pages,
            current_page = excluded.current_page,
            rating = excluded.rating,
            summary = excluded.summary,
            notes = excluded.notes,
            reading_sessions = excluded.reading_sessions,
            tags = excluded.tags,
            updated_at = excluded.updated_at
        "#,
    )
    .bind(&book.id)
    .bind(&book.title)
    .bind(&book.author)
    .bind(&book.isbn)
    .bind(&book.publisher)
    .bind(book.published_year)
    .bind(&book.cover_image_url)
    .bind(&genres_json)
    .bind(status_str)
    .bind(book.start_date.map(|d| d.to_rfc3339()))
    .bind(book.finish_date.map(|d| d.to_rfc3339()))
    .bind(book.progress_percent.map(|p| p as i32))
    .bind(book.total_pages.map(|p| p as i32))
    .bind(book.current_page.map(|p| p as i32))
    .bind(book.rating.map(|r| r as i32))
    .bind(&book.summary)
    .bind(&notes_json)
    .bind(&sessions_json)
    .bind(&tags_json)
    .bind(book.created_at.to_rfc3339())
    .bind(book.updated_at.to_rfc3339())
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to save reading book: {}", e))?;

    Ok(())
}

/// 読書記録を削除
pub async fn db_delete_reading_book(pool: &SqlitePool, id: &str) -> Result<(), String> {
    sqlx::query("DELETE FROM reading_books WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete reading book: {}", e))?;

    Ok(())
}

// --- Calendar Events ---

use crate::calendar::CalendarEvent;

/// 全イベントを読み込み
pub async fn db_load_calendar_events(pool: &SqlitePool) -> Result<Vec<CalendarEvent>, String> {
    let rows = sqlx::query(
        "SELECT id, title, description, start_datetime, end_datetime, all_day, color, recurrence_rule, reminder_minutes, created_at, updated_at FROM calendar_events ORDER BY start_datetime"
    )
    .fetch_all(pool)
    .await
    .map_err(|e| format!("Failed to load calendar events: {}", e))?;

    let mut events = Vec::new();
    for row in rows {
        let created_at: String = row.get("created_at");
        let updated_at: String = row.get("updated_at");

        events.push(CalendarEvent {
            id: row.get("id"),
            title: row.get("title"),
            description: row.get("description"),
            start_datetime: row.get("start_datetime"),
            end_datetime: row.get("end_datetime"),
            all_day: row.get::<i32, _>("all_day") != 0,
            color: row.get("color"),
            recurrence_rule: row.get("recurrence_rule"),
            reminder_minutes: row.get("reminder_minutes"),
            created_at: DateTime::parse_from_rfc3339(&created_at)
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
            updated_at: DateTime::parse_from_rfc3339(&updated_at)
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now()),
        });
    }

    Ok(events)
}

/// イベントを保存
pub async fn db_save_calendar_event(
    pool: &SqlitePool,
    event: &CalendarEvent,
) -> Result<(), String> {
    sqlx::query(
        r#"
        INSERT INTO calendar_events (id, title, description, start_datetime, end_datetime, all_day, color, recurrence_rule, reminder_minutes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            start_datetime = excluded.start_datetime,
            end_datetime = excluded.end_datetime,
            all_day = excluded.all_day,
            color = excluded.color,
            recurrence_rule = excluded.recurrence_rule,
            reminder_minutes = excluded.reminder_minutes,
            updated_at = excluded.updated_at
        "#,
    )
    .bind(&event.id)
    .bind(&event.title)
    .bind(&event.description)
    .bind(&event.start_datetime)
    .bind(&event.end_datetime)
    .bind(event.all_day)
    .bind(&event.color)
    .bind(&event.recurrence_rule)
    .bind(event.reminder_minutes)
    .bind(event.created_at.to_rfc3339())
    .bind(event.updated_at.to_rfc3339())
    .execute(pool)
    .await
    .map_err(|e| format!("Failed to save calendar event: {}", e))?;

    Ok(())
}

/// イベントを削除
pub async fn db_delete_calendar_event(pool: &SqlitePool, id: &str) -> Result<(), String> {
    sqlx::query("DELETE FROM calendar_events WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await
        .map_err(|e| format!("Failed to delete calendar event: {}", e))?;

    Ok(())
}
