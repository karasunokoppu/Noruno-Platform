// 通知関連のロジック

use chrono::{Local, NaiveDate, NaiveDateTime, TimeZone};

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
