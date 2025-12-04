// 通知関連のロジック

use chrono::{Local, NaiveDate, NaiveDateTime, TimeZone};

use crate::mail::send_email;
use crate::settings::MailSettings;
use crate::task::{save_tasks, Task};
use std::path::PathBuf;
use std::sync::MutexGuard;

/// 日付文字列から期限までの分数を計算
///
/// DateTime形式（"%Y-%m-%d %H:%M"）またはDate形式（"%Y-%m-%d"）をサポート
#[allow(dead_code)]
pub fn calculate_minutes_until_due(due_date: &str) -> Option<i64> {
    let now = Local::now();

    // DateTime形式でパース
    if let Ok(due_dt) = NaiveDateTime::parse_from_str(due_date, "%Y-%m-%d %H:%M") {
        let due_time = Local.from_local_datetime(&due_dt).unwrap();
        return Some(due_time.signed_duration_since(now).num_minutes());
    }

    // Date形式でパース（時刻部分を除去してからパース）
    let date_str = due_date.split_whitespace().next().unwrap_or(due_date);
    if let Ok(due_date) = NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
        let due_midnight = Local
            .from_local_datetime(&due_date.and_hms_opt(0, 0, 0).unwrap())
            .unwrap();
        return Some(due_midnight.signed_duration_since(now).num_minutes());
    }

    None
}

/// バックグラウンドで通知をチェックして送信
#[allow(dead_code)]
pub fn check_and_send_notifications(
    tasks: &mut MutexGuard<Vec<Task>>,
    data_file: &MutexGuard<PathBuf>,
    settings: &MailSettings,
) {
    if settings.email.is_empty() || settings.app_password.is_empty() {
        return;
    }

    let mut tasks_to_notify = Vec::new();
    let mut changed = false;

    for task in tasks.iter_mut() {
        if task.completed || task.notified {
            continue;
        }

        let minutes_until_due = match calculate_minutes_until_due(&task.due_date) {
            Some(m) => m,
            None => continue,
        };

        let threshold = task
            .notification_minutes
            .unwrap_or(settings.notification_minutes);

        if minutes_until_due <= threshold as i64 && minutes_until_due >= 0 {
            tasks_to_notify.push(task.clone());
            task.notified = true;
            changed = true;
        }
    }

    if changed {
        save_tasks(tasks, data_file);
    }

    // 通知メールを送信
    for task in tasks_to_notify {
        let subject = format!("[Todo App] Task Due: {}", task.description);
        let body = format!(
            "Your task '{}' is due on {}.\n\nDetails: {}\nGroup: {}",
            task.description, task.due_date, task.details, task.group
        );

        let _ = send_email(settings, &settings.email, &subject, &body);
    }
}
