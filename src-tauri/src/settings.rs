use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MailSettings {
    pub email: String,
    pub app_password: String,
    pub notification_minutes: i32,
}

impl Default for MailSettings {
    fn default() -> Self {
        MailSettings {
            email: String::new(),
            app_password: String::new(),
            notification_minutes: 1440,
        }
    }
}

pub fn load_settings(file_path: &PathBuf) -> MailSettings {
    if let Ok(content) = fs::read_to_string(file_path) {
        if let Ok(settings) = serde_json::from_str(&content) {
            return settings;
        }
    }
    MailSettings::default()
}

pub fn save_settings(settings: &MailSettings, file_path: &PathBuf) {
    let json = serde_json::to_string_pretty(settings).unwrap_or_default();
    if let Some(parent) = file_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let _ = fs::write(file_path, json);
}
