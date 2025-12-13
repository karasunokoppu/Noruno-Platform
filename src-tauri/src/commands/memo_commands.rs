// メモ・フォルダ関連のTauriコマンド

use tauri::State;

use crate::database;
use crate::memo::{Folder, Memo};
use crate::AppState;

// ========================================
// メモ関連コマンド
// ========================================

#[tauri::command]
pub fn get_memos(state: State<AppState>) -> Vec<Memo> {
    let memos = state.memos.lock().unwrap();
    memos.clone()
}

#[tauri::command]
pub fn get_memo(state: State<AppState>, id: String) -> Option<Memo> {
    let memos = state.memos.lock().unwrap();
    memos.iter().find(|m| m.id == id).cloned()
}

#[tauri::command]
pub async fn create_memo(
    state: State<'_, AppState>,
    title: String,
    content: String,
    folder_id: Option<String>,
    tags: Vec<String>,
) -> Result<Vec<Memo>, String> {
    let memo = {
        let mut memos = state.memos.lock().unwrap();
        let memo = Memo::new(title, content, folder_id, tags);
        memos.push(memo.clone());
        memo
    };

    database::db_save_memo(&state.db, &memo).await?;

    let memos = state.memos.lock().unwrap();
    Ok(memos.clone())
}

#[tauri::command]
pub async fn update_memo(
    state: State<'_, AppState>,
    id: String,
    title: String,
    content: String,
    folder_id: Option<String>,
    tags: Vec<String>,
) -> Result<Vec<Memo>, String> {
    let memo_to_save = {
        let mut memos = state.memos.lock().unwrap();
        if let Some(memo) = memos.iter_mut().find(|m| m.id == id) {
            memo.update(title, content, folder_id, tags);
            Some(memo.clone())
        } else {
            None
        }
    };

    if let Some(memo) = memo_to_save {
        database::db_save_memo(&state.db, &memo).await?;
    }

    let memos = state.memos.lock().unwrap();
    Ok(memos.clone())
}

#[tauri::command]
pub async fn delete_memo(state: State<'_, AppState>, id: String) -> Result<Vec<Memo>, String> {
    {
        let mut memos = state.memos.lock().unwrap();
        memos.retain(|m| m.id != id);
    }

    database::db_delete_memo(&state.db, &id).await?;

    let memos = state.memos.lock().unwrap();
    Ok(memos.clone())
}

#[tauri::command]
pub fn search_memos(state: State<AppState>, query: String) -> Vec<Memo> {
    let memos = state.memos.lock().unwrap();
    let query_lower = query.to_lowercase();
    memos
        .iter()
        .filter(|m| {
            m.title.to_lowercase().contains(&query_lower)
                || m.content.to_lowercase().contains(&query_lower)
                || m.tags
                    .iter()
                    .any(|t| t.to_lowercase().contains(&query_lower))
        })
        .cloned()
        .collect()
}

#[tauri::command]
pub fn get_all_tags(state: State<AppState>) -> Vec<String> {
    let memos = state.memos.lock().unwrap();
    let mut tags: Vec<String> = memos.iter().flat_map(|m| m.tags.clone()).collect();
    tags.sort();
    tags.dedup();
    tags
}

// ========================================
// フォルダ関連コマンド
// ========================================

#[tauri::command]
pub fn get_folders(state: State<AppState>) -> Vec<Folder> {
    let folders = state.folders.lock().unwrap();
    folders.clone()
}

#[tauri::command]
pub async fn create_folder(
    state: State<'_, AppState>,
    name: String,
    parent_id: Option<String>,
) -> Result<Vec<Folder>, String> {
    let folder = {
        let mut folders = state.folders.lock().unwrap();
        let folder = Folder::new(name, parent_id);
        folders.push(folder.clone());
        folder
    };

    database::db_save_folder(&state.db, &folder).await?;

    let folders = state.folders.lock().unwrap();
    Ok(folders.clone())
}

#[tauri::command]
pub async fn update_folder(
    state: State<'_, AppState>,
    id: String,
    name: String,
) -> Result<Vec<Folder>, String> {
    let folder_to_save = {
        let mut folders = state.folders.lock().unwrap();
        if let Some(folder) = folders.iter_mut().find(|f| f.id == id) {
            folder.name = name;
            Some(folder.clone())
        } else {
            None
        }
    };

    if let Some(folder) = folder_to_save {
        database::db_save_folder(&state.db, &folder).await?;
    }

    let folders = state.folders.lock().unwrap();
    Ok(folders.clone())
}

#[tauri::command]
pub async fn delete_folder(state: State<'_, AppState>, id: String) -> Result<Vec<Folder>, String> {
    let memos_to_update: Vec<Memo> = {
        let mut folders = state.folders.lock().unwrap();
        let mut memos = state.memos.lock().unwrap();

        // Remove folder
        folders.retain(|f| f.id != id);

        // Remove folder_id from memos in this folder
        let mut updated = Vec::new();
        for memo in memos.iter_mut() {
            if memo.folder_id.as_ref() == Some(&id) {
                memo.folder_id = None;
                updated.push(memo.clone());
            }
        }
        updated
    };

    // Delete folder from database
    database::db_delete_folder(&state.db, &id).await?;

    // Update affected memos in database
    for memo in &memos_to_update {
        let _ = database::db_save_memo(&state.db, memo).await;
    }

    let folders = state.folders.lock().unwrap();
    Ok(folders.clone())
}
