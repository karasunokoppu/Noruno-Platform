export interface MailSettings {
  email: string;
  app_password: string;
  notification_minutes: number;
}

// Minimal Task type used where convenient — existing App exports its own Task
export interface MinimalTask {
  id: number | string;
  description?: string;
  start_date?: string | null;
  due_date?: string | null;
  group?: string | null;
}

export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  subtaskId: number | null;
  subtaskDescription: string;
  subtaskCompleted: boolean;
}

//Task
export interface Task {
  id: number;
  description: string;
  start_date?: string;
  due_date: string;
  group: string;
  details: string;
  completed: boolean;
  notification_minutes?: number;
  subtasks: Subtask[];
  dependencies?: number[];
}

export interface Subtask {
  id: number;
  description: string;
  completed: boolean;
}

//Dashboard
export interface DashboardViewProps {
  tasks: Task[];
  readingBooks: ReadingBook[];
}

interface ChartData {
  day: string;
  count: number;
  date: string;
}

export interface TaskCompletionChartProps {
  data: ChartData[];
}

//Calender
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_datetime: string;
  end_datetime?: string;
  all_day: boolean;
  color?: string;
  recurrence_rule?: string;
  reminder_minutes?: number;
  created_at: string;
  updated_at: string;
}


//Memos
export interface Memo {
  id: string;
  title: string;
  content: string;
  folder_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
}

//Reading Memos
// export interface ReadingBook {
//   id: string;
//   title: string;
//   status: string;
//   reading_sessions: {
//     duration_minutes?: number;
//     pages_read: number;
//   }[];
// }

// TypeScript型定義
export type ReadingStatus = "want_to_read" | "reading" | "finished" | "paused";

export interface ReadingNote {
  id: string;
  page_number?: number;
  quote?: string;
  comment: string;
  created_at: string;
}

export interface ReadingSession {
  id: string;
  session_date: string;
  start_page?: number;
  end_page?: number;
  pages_read: number;
  duration_minutes?: number;
  memo?: string;
}

export interface ReadingBook {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  published_year?: number;
  cover_image_url?: string;
  genres: string[];
  status: ReadingStatus;
  start_date?: string;
  finish_date?: string;
  progress_percent?: number;
  total_pages?: number;
  current_page?: number;
  rating?: number;
  summary: string;
  notes: ReadingNote[];
  reading_sessions: ReadingSession[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default {};
