use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

/// 読書ステータス
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ReadingStatus {
    WantToRead, // 未読（読みたい）
    Reading,    // 読書中
    Finished,   // 読了
    Paused,     // 中断
}

/// 読書メモ/引用
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingNote {
    pub id: String,
    pub page_number: Option<u32>,
    pub quote: Option<String>,
    pub comment: String,
    pub created_at: DateTime<Utc>,
}

impl ReadingNote {
    pub fn new(page_number: Option<u32>, quote: Option<String>, comment: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            page_number,
            quote,
            comment,
            created_at: Utc::now(),
        }
    }
}

/// 読書セッション（日毎の読書記録）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingSession {
    pub id: String,
    pub session_date: DateTime<Utc>,
    pub start_page: Option<u32>,
    pub end_page: Option<u32>,
    pub pages_read: u32,
    pub duration_minutes: Option<u32>,
    pub memo: Option<String>,
}

impl ReadingSession {
    pub fn new(
        session_date: DateTime<Utc>,
        start_page: Option<u32>,
        end_page: Option<u32>,
        pages_read: u32,
        duration_minutes: Option<u32>,
        memo: Option<String>,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            session_date,
            start_page,
            end_page,
            pages_read,
            duration_minutes,
            memo,
        }
    }
}

/// 読書書籍情報
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReadingBook {
    pub id: String,
    pub title: String,
    pub author: Option<String>,
    pub isbn: Option<String>,
    pub publisher: Option<String>,
    pub published_year: Option<i32>,
    pub cover_image_url: Option<String>,
    pub genres: Vec<String>,
    pub status: ReadingStatus,
    pub start_date: Option<DateTime<Utc>>,
    pub finish_date: Option<DateTime<Utc>>,
    pub progress_percent: Option<u8>,
    pub total_pages: Option<u32>,
    pub current_page: Option<u32>,
    pub rating: Option<u8>,
    pub summary: String,
    pub notes: Vec<ReadingNote>,
    pub reading_sessions: Vec<ReadingSession>,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl ReadingBook {
    /// 新規書籍を作成
    pub fn new(title: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            title,
            author: None,
            isbn: None,
            publisher: None,
            published_year: None,
            cover_image_url: None,
            genres: Vec::new(),
            status: ReadingStatus::WantToRead,
            start_date: None,
            finish_date: None,
            progress_percent: None,
            total_pages: None,
            current_page: None,
            rating: None,
            summary: String::new(),
            notes: Vec::new(),
            reading_sessions: Vec::new(),
            tags: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    /// 書籍情報を更新
    pub fn update(
        &mut self,
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
    ) {
        self.title = title;
        self.author = author;
        self.isbn = isbn;
        self.publisher = publisher;
        self.published_year = published_year;
        self.cover_image_url = cover_image_url;
        self.genres = genres;
        self.status = status;
        self.start_date = start_date;
        self.finish_date = finish_date;
        self.total_pages = total_pages;
        self.current_page = current_page;
        self.rating = rating;
        self.summary = summary;
        self.tags = tags;
        self.updated_at = Utc::now();

        // 進捗率を計算
        if let (Some(total), Some(current)) = (self.total_pages, self.current_page) {
            if total > 0 {
                self.progress_percent = Some(((current as f32 / total as f32) * 100.0) as u8);
            }
        }
    }
}

/// 読書書籍データのファイルパスを取得
pub fn get_reading_books_file_path() -> PathBuf {
    let app_data = dirs::data_local_dir().unwrap();
    app_data
        .join("com.noruno.platform")
        .join("reading_books.json")
}

/// 読書書籍データを読み込み
pub fn load_reading_books() -> Result<Vec<ReadingBook>, String> {
    let path = get_reading_books_file_path();
    if !path.exists() {
        return Ok(Vec::new());
    }

    let contents = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read reading_books file: {}", e))?;

    serde_json::from_str(&contents).map_err(|e| format!("Failed to parse reading_books: {}", e))
}

pub fn save_reading_books(books: &Vec<ReadingBook>) -> Result<(), String> {
    let path = get_reading_books_file_path();
    let json = serde_json::to_string_pretty(books).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| format!("Failed to save reading_books: {}", e))?;
    Ok(())
}
