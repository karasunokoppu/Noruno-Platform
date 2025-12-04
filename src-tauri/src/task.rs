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
pub fn save_tasks(tasks: &Vec<Task>, file_path: &PathBuf) {
    let json = serde_json::to_string_pretty(tasks).unwrap_or_default();
    if let Some(parent) = file_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let _ = fs::write(file_path, json);
}

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
pub fn save_groups(groups: &Vec<String>, file_path: &PathBuf) {
    let json = serde_json::to_string_pretty(groups).unwrap_or_default();
    if let Some(parent) = file_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let _ = fs::write(file_path, json);
}

/// グループデータをファイルから読み込み
pub fn load_groups(file_path: &PathBuf) -> Vec<String> {
    if let Ok(content) = fs::read_to_string(file_path) {
        if let Ok(groups) = serde_json::from_str(&content) {
            return groups;
        }
    }
    Vec::new()
}
