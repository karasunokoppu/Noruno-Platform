#[cfg(test)]
mod test_utils {
    use crate::task::{load_tasks, save_tasks, Subtask, Task};
    use tempfile::tempdir;

    #[test]
    fn test_subtask_creation() {
        let subtask = Subtask::new(1, "Test Subtask".to_string());
        assert_eq!(subtask.id, 1);
        assert_eq!(subtask.description, "Test Subtask");
        assert_eq!(subtask.completed, false);
    }

    #[test]
    fn test_next_subtask_id() {
        let mut task = Task {
            id: 1,
            description: "Main Task".to_string(),
            start_date: None,
            due_date: "2023-12-31".to_string(),
            group: "Work".to_string(),
            details: "Details".to_string(),
            completed: false,
            notified: false,
            notification_minutes: None,
            subtasks: Vec::new(),
            dependencies: None,
        };

        // No subtasks
        assert_eq!(task.next_subtask_id(), 1);

        // Add subtasks
        task.subtasks.push(Subtask::new(1, "Subtask 1".to_string()));
        task.subtasks.push(Subtask::new(2, "Subtask 2".to_string()));
        assert_eq!(task.next_subtask_id(), 3);

        // Add non-sequential subtask
        task.subtasks.push(Subtask::new(5, "Subtask 5".to_string()));
        assert_eq!(task.next_subtask_id(), 6);
    }

    #[test]
    fn test_task_serialization() {
        let task = Task {
            id: 1,
            description: "Test Task".to_string(),
            start_date: Some("2023-01-01".to_string()),
            due_date: "2023-12-31".to_string(),
            group: "Work".to_string(),
            details: "Details".to_string(),
            completed: false,
            notified: false,
            notification_minutes: Some(30),
            subtasks: vec![Subtask::new(1, "Sub 1".to_string())],
            dependencies: Some(vec![2, 3]),
        };

        let serialized = serde_json::to_string(&task).expect("Serialization failed");
        let deserialized: Task = serde_json::from_str(&serialized).expect("Deserialization failed");

        assert_eq!(task.id, deserialized.id);
        assert_eq!(task.description, deserialized.description);
        assert_eq!(task.start_date, deserialized.start_date);
        assert_eq!(task.notification_minutes, deserialized.notification_minutes);
        assert_eq!(task.subtasks.len(), deserialized.subtasks.len());
        assert_eq!(task.dependencies, deserialized.dependencies);
    }

    #[test]
    fn test_save_and_load_tasks() {
        let dir = tempdir().expect("Failed to create temp dir");
        let file_path = dir.path().join("tasks.json");

        let tasks = vec![
            Task {
                id: 1,
                description: "Task 1".to_string(),
                start_date: None,
                due_date: "".to_string(),
                group: "".to_string(),
                details: "".to_string(),
                completed: false,
                notified: false,
                notification_minutes: None,
                subtasks: Vec::new(),
                dependencies: None,
            },
            Task {
                id: 2,
                description: "Task 2".to_string(),
                start_date: None,
                due_date: "".to_string(),
                group: "".to_string(),
                details: "".to_string(),
                completed: true,
                notified: false,
                notification_minutes: None,
                subtasks: Vec::new(),
                dependencies: None,
            },
        ];

        // Save tasks
        let save_result = save_tasks(&tasks, &file_path);
        assert!(save_result.is_ok());

        // Load tasks
        let loaded_tasks = load_tasks(&file_path);
        assert_eq!(loaded_tasks.len(), 2);
        assert_eq!(loaded_tasks[0].description, "Task 1");
        assert_eq!(loaded_tasks[1].completed, true);
    }

    #[test]
    fn test_load_nonexistent_file() {
        let dir = tempdir().expect("Failed to create temp dir");
        let file_path = dir.path().join("nonexistent.json");

        let tasks = load_tasks(&file_path);
        assert!(tasks.is_empty());
    }
}
