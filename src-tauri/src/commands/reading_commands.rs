// 読書記録関連のTauriコマンド

use chrono::{DateTime, Utc};
use tauri::State;

use crate::database;
use crate::reading_memo::{ReadingBook, ReadingNote, ReadingSession, ReadingStatus};
use crate::AppState;

// ========================================
// 読書書籍関連コマンド
// ========================================

#[tauri::command]
pub fn get_reading_books(state: State<AppState>) -> Vec<ReadingBook> {
    let books = state.reading_books.lock().unwrap();
    books.clone()
}

#[tauri::command]
pub async fn create_reading_book(
    state: State<'_, AppState>,
    title: String,
) -> Result<Vec<ReadingBook>, String> {
    let book = {
        let mut books = state.reading_books.lock().unwrap();
        let book = ReadingBook::new(title);
        books.push(book.clone());
        book
    };

    database::db_save_reading_book(&state.db, &book).await?;

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}

#[tauri::command]
pub async fn update_reading_book(
    state: State<'_, AppState>,
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
    let book_to_save = {
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
            Some(book.clone())
        } else {
            None
        }
    };

    if let Some(book) = book_to_save {
        database::db_save_reading_book(&state.db, &book).await?;
    }

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}

#[tauri::command]
pub async fn delete_reading_book(
    state: State<'_, AppState>,
    id: String,
) -> Result<Vec<ReadingBook>, String> {
    {
        let mut books = state.reading_books.lock().unwrap();
        books.retain(|b| b.id != id);
    }

    database::db_delete_reading_book(&state.db, &id).await?;

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}

// ========================================
// 読書メモ関連コマンド
// ========================================

#[tauri::command]
pub async fn add_reading_note(
    state: State<'_, AppState>,
    book_id: String,
    page_number: Option<u32>,
    quote: Option<String>,
    comment: String,
) -> Result<Vec<ReadingBook>, String> {
    let book_to_save = {
        let mut books = state.reading_books.lock().unwrap();
        if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
            let note = ReadingNote::new(page_number, quote, comment);
            book.notes.push(note);
            book.updated_at = Utc::now();
            Some(book.clone())
        } else {
            None
        }
    };

    if let Some(book) = book_to_save {
        database::db_save_reading_book(&state.db, &book).await?;
    }

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}

#[tauri::command]
pub async fn update_reading_note(
    state: State<'_, AppState>,
    book_id: String,
    note_id: String,
    page_number: Option<u32>,
    quote: Option<String>,
    comment: String,
) -> Result<Vec<ReadingBook>, String> {
    let book_to_save = {
        let mut books = state.reading_books.lock().unwrap();
        if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
            if let Some(note) = book.notes.iter_mut().find(|n| n.id == note_id) {
                note.page_number = page_number;
                note.quote = quote;
                note.comment = comment;
                book.updated_at = Utc::now();
            }
            Some(book.clone())
        } else {
            None
        }
    };

    if let Some(book) = book_to_save {
        database::db_save_reading_book(&state.db, &book).await?;
    }

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}

#[tauri::command]
pub async fn delete_reading_note(
    state: State<'_, AppState>,
    book_id: String,
    note_id: String,
) -> Result<Vec<ReadingBook>, String> {
    let book_to_save = {
        let mut books = state.reading_books.lock().unwrap();
        if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
            book.notes.retain(|n| n.id != note_id);
            book.updated_at = Utc::now();
            Some(book.clone())
        } else {
            None
        }
    };

    if let Some(book) = book_to_save {
        database::db_save_reading_book(&state.db, &book).await?;
    }

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}

// ========================================
// 読書セッション関連コマンド
// ========================================

#[tauri::command]
pub async fn add_reading_session(
    state: State<'_, AppState>,
    book_id: String,
    session_date: DateTime<Utc>,
    start_page: Option<u32>,
    end_page: Option<u32>,
    pages_read: u32,
    duration_minutes: Option<u32>,
    memo: Option<String>,
) -> Result<Vec<ReadingBook>, String> {
    let book_to_save = {
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
            Some(book.clone())
        } else {
            None
        }
    };

    if let Some(book) = book_to_save {
        database::db_save_reading_book(&state.db, &book).await?;
    }

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}

#[tauri::command]
pub async fn update_reading_session(
    state: State<'_, AppState>,
    book_id: String,
    session_id: String,
    session_date: DateTime<Utc>,
    start_page: Option<u32>,
    end_page: Option<u32>,
    pages_read: u32,
    duration_minutes: Option<u32>,
    memo: Option<String>,
) -> Result<Vec<ReadingBook>, String> {
    let book_to_save = {
        let mut books = state.reading_books.lock().unwrap();
        if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
            if let Some(session) = book
                .reading_sessions
                .iter_mut()
                .find(|s| s.id == session_id)
            {
                session.session_date = session_date;
                session.start_page = start_page;
                session.end_page = end_page;
                session.pages_read = pages_read;
                session.duration_minutes = duration_minutes;
                session.memo = memo;
                book.updated_at = Utc::now();
            }
            Some(book.clone())
        } else {
            None
        }
    };

    if let Some(book) = book_to_save {
        database::db_save_reading_book(&state.db, &book).await?;
    }

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}

#[tauri::command]
pub async fn delete_reading_session(
    state: State<'_, AppState>,
    book_id: String,
    session_id: String,
) -> Result<Vec<ReadingBook>, String> {
    let book_to_save = {
        let mut books = state.reading_books.lock().unwrap();
        if let Some(book) = books.iter_mut().find(|b| b.id == book_id) {
            book.reading_sessions.retain(|s| s.id != session_id);
            book.updated_at = Utc::now();
            Some(book.clone())
        } else {
            None
        }
    };

    if let Some(book) = book_to_save {
        database::db_save_reading_book(&state.db, &book).await?;
    }

    let books = state.reading_books.lock().unwrap();
    Ok(books.clone())
}
