// メモ・フォルダ関連のTauriコマンド

use tauri::State;

use crate::memo::{save_folders, save_memos, Folder, Memo};
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
pub fn create_memo(
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
pub fn update_memo(
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
pub fn delete_memo(state: State<AppState>, id: String) -> Result<Vec<Memo>, String> {
    let mut memos = state.memos.lock().unwrap();
    memos.retain(|m| m.id != id);
    save_memos(&memos)?;
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
pub fn create_folder(
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
pub fn update_folder(
    state: State<AppState>,
    id: String,
    name: String,
) -> Result<Vec<Folder>, String> {
    let mut folders = state.folders.lock().unwrap();
    if let Some(folder) = folders.iter_mut().find(|f| f.id == id) {
        folder.name = name;
        save_folders(&folders)?;
    }
    Ok(folders.clone())
}

#[tauri::command]
pub fn delete_folder(state: State<AppState>, id: String) -> Result<Vec<Folder>, String> {
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
