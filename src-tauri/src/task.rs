// Task構造体とファイルI/O処理

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// サブタスク構造体
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Subtask {
    pub id: i32,
    pub description: String,
    pub completed: bool,
}

impl Subtask {
    pub fn new(id: i32, description: String) -> Self {
        Self {
            id,
            description,
            completed: false,
        }
    }
}

/// タスク構造体
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: i32,
    pub description: String,
    pub due_date: String,
    pub group: String,
    pub details: String,
    pub completed: bool,
    pub notified: bool,
    pub notification_minutes: Option<i32>,
    #[serde(default)]
    pub subtasks: Vec<Subtask>,
}

impl Task {
    /// サブタスク用の次のIDを取得
    pub fn next_subtask_id(&self) -> i32 {
        self.subtasks.iter().map(|s| s.id).max().unwrap_or(0) + 1
    }
}

/// タスクデータをファイルに保存

/// タスクデータをファイルから読み込み
pub fn load_tasks(file_path: &PathBuf) -> Vec<Task> {
    if let Ok(content) = fs::read_to_string(file_path) {
        if let Ok(tasks) = serde_json::from_str(&content) {
            return tasks;
        }
    }
    Vec::new()
}

/// グループデータをファイルに保存

/// グループデータをファイルから読み込み
pub fn load_groups(file_path: &PathBuf) -> Vec<String> {
    if let Ok(content) = fs::read_to_string(file_path) {
        if let Ok(groups) = serde_json::from_str(&content) {
            return groups;
        }
    }
    Vec::new()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::{db_delete_task, db_load_tasks, db_save_task};
    use crate::tests::test_utils::setup_test_db;

    #[tokio::test]
    async fn test_task_crud() {
        let test_db = setup_test_db().await;
        let pool = &test_db.pool;

        // Create
        let task = Task {
            id: 1,
            description: "Test Task".to_string(),
            due_date: "2023-01-01".to_string(),
            group: "Test Group".to_string(),
            details: "Details".to_string(),
            completed: false,
            notified: false,
            notification_minutes: None,
            subtasks: vec![],
        };
        db_save_task(pool, &task)
            .await
            .expect("Failed to save task");

        // Read
        let tasks = db_load_tasks(pool).await.expect("Failed to load tasks");
        assert_eq!(tasks.len(), 1);
        assert_eq!(tasks[0].description, "Test Task");

        // Update
        let mut task = tasks[0].clone();
        task.completed = true;
        db_save_task(pool, &task)
            .await
            .expect("Failed to update task");

        let tasks = db_load_tasks(pool).await.expect("Failed to load tasks");
        assert!(tasks[0].completed);

        // Delete
        db_delete_task(pool, 1)
            .await
            .expect("Failed to delete task");
        let tasks = db_load_tasks(pool).await.expect("Failed to load tasks");
        assert!(tasks.is_empty());
    }
}
