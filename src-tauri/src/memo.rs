use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Memo {
    pub id: String,
    pub title: String,
    pub content: String,
    pub folder_id: Option<String>,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
}

impl Memo {
    pub fn new(
        title: String,
        content: String,
        folder_id: Option<String>,
        tags: Vec<String>,
    ) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            title,
            content,
            folder_id,
            tags,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn update(
        &mut self,
        title: String,
        content: String,
        folder_id: Option<String>,
        tags: Vec<String>,
    ) {
        self.title = title;
        self.content = content;
        self.folder_id = folder_id;
        self.tags = tags;
        self.updated_at = Utc::now();
    }
}

impl Folder {
    pub fn new(name: String, parent_id: Option<String>) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            name,
            parent_id,
        }
    }
}

pub fn get_memos_file_path() -> PathBuf {
    let app_data = dirs::data_local_dir().unwrap();
    app_data.join("com.noruno.platform").join("memos.json")
}

pub fn get_folders_file_path() -> PathBuf {
    let app_data = dirs::data_local_dir().unwrap();
    app_data.join("com.noruno.platform").join("folders.json")
}

pub fn load_memos() -> Result<Vec<Memo>, String> {
    let path = get_memos_file_path();
    if !path.exists() {
        return Ok(Vec::new());
    }

    let contents =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read memos file: {}", e))?;

    serde_json::from_str(&contents).map_err(|e| format!("Failed to parse memos: {}", e))
}

pub fn load_folders() -> Result<Vec<Folder>, String> {
    let path = get_folders_file_path();
    if !path.exists() {
        return Ok(Vec::new());
    }

    let contents =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read folders file: {}", e))?;

    serde_json::from_str(&contents).map_err(|e| format!("Failed to parse folders: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::{db_delete_memo, db_load_memos, db_save_memo};
    use crate::tests::test_utils::setup_test_db;
    use chrono::Utc;

    #[tokio::test]
    async fn test_memo_crud() {
        let test_db = setup_test_db().await;
        let pool = &test_db.pool;

        // Create
        let memo = Memo {
            id: "memo-1".to_string(),
            title: "Test Memo".to_string(),
            content: "Content".to_string(),
            folder_id: None,
            tags: vec!["tag1".to_string()],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };
        db_save_memo(pool, &memo)
            .await
            .expect("Failed to save memo");

        // Read
        let memos = db_load_memos(pool).await.expect("Failed to load memos");
        assert_eq!(memos.len(), 1);
        assert_eq!(memos[0].title, "Test Memo");

        // Update
        let mut memo = memos[0].clone();
        memo.title = "Updated Memo".to_string();
        db_save_memo(pool, &memo)
            .await
            .expect("Failed to update memo");

        let memos = db_load_memos(pool).await.expect("Failed to load memos");
        assert_eq!(memos[0].title, "Updated Memo");

        // Delete
        db_delete_memo(pool, "memo-1")
            .await
            .expect("Failed to delete memo");
        let memos = db_load_memos(pool).await.expect("Failed to load memos");
        assert!(memos.is_empty());
    }
}
