export interface MailSettings {
    email: string;
    app_password: string;
    notification_minutes: number;
}

export interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
}

// Minimal Task type used where convenient — existing App exports its own Task
export interface MinimalTask {
    id: number | string;
    description?: string;
    start_date?: string | null;
    due_date?: string | null;
    group?: string | null;
}

export default {};
