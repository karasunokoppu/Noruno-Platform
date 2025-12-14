#[cfg(test)]
pub mod test_utils {
    use crate::database::init_db;
    use sqlx::SqlitePool;
    use std::path::PathBuf;
    use tempfile::TempDir;

    pub struct TestDb {
        pub pool: SqlitePool,
        pub _temp_dir: TempDir, // Keep alive to prevent deletion
    }

    pub async fn setup_test_db() -> TestDb {
        let temp_dir = TempDir::new().expect("Failed to create temp dir");
        let path = temp_dir.path().to_path_buf();
        let pool = init_db(&path).await.expect("Failed to init db");

        TestDb {
            pool,
            _temp_dir: temp_dir,
        }
    }
}
