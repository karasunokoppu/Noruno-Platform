import { invoke } from "@tauri-apps/api/core";
import type { MailSettings, Task, ReadingBook, ReadingStatus } from "../types";
import type { CalendarEvent } from "../types";

//Mail
export async function getMailSettings(): Promise<MailSettings> {
  try {
    return await invoke<MailSettings>("get_mail_settings");
  } catch (e) {
    console.error("getMailSettings failed", e);
    throw e;
  }
}

export async function saveMailSettings(settings: MailSettings): Promise<void> {
  try {
    await invoke("save_mail_settings", { settings });
  } catch (e) {
    console.error("saveMailSettings failed", e);
    throw e;
  }
}

export async function sendTestEmail(): Promise<string> {
  try {
    return await invoke<string>("send_test_email");
  } catch (e) {
    console.error("sendTestEmail failed", e);
    throw e;
  }
}

export async function checkNotifications(): Promise<string> {
  try {
    return await invoke<string>("check_notifications");
  } catch (e) {
    console.error("checkNotifications failed", e);
    throw e;
  }
}

//Task
export async function getTasks(): Promise<Task[]> {
  try {
    return await invoke<Task[]>("get_tasks");
  } catch (e) {
    console.error("getTasks failed", e);
    throw e;
  }
}

export async function addTask(
  description: string,
  startDate: string | undefined,
  dueDate: string,
  group: string,
  details: string,
  notificationMinutes: number | undefined,
  dependencies: null,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("add_task", {
      description: description,
      startDate: startDate,
      dueDate: dueDate,
      group: group,
      details: details,
      notificationMinutes: notificationMinutes,
      dependencies: dependencies,
    });
  } catch (e) {
    console.error("addTask failed", e);
    throw e;
  }
}

export async function updateTask(task: Task): Promise<Task[]> {
  try {
    return await invoke<Task[]>("update_task", {
      id: task.id,
      description: task.description,
      startDate: task.start_date || null,
      dueDate: task.due_date,
      group: task.group,
      details: task.details,
      notificationMinutes: task.notification_minutes || null,
      dependencies: task.dependencies || null,
    });
  } catch (e) {
    console.error("updateTask failed", e);
    throw e;
  }
}

export async function deleteTask(id: number): Promise<Task[]> {
  try {
    return await invoke<Task[]>("delete_task", { id });
  } catch (e) {
    console.error("deleteTask failed", e);
    throw e;
  }
}

export async function completeTask(id: number): Promise<Task[]> {
  try {
    return await invoke<Task[]>("complete_task", { id });
  } catch (e) {
    console.error("completeTask failed", e);
    throw e;
  }
}

//Task => Group

export async function getGroups(): Promise<string[]> {
  try {
    return await invoke<string[]>("get_groups");
  } catch (e) {
    console.error("getGroups failed", e);
    throw e;
  }
}

export async function createGroups(name: string): Promise<string[]> {
  try {
    return await invoke<string[]>("create_group", { name });
  } catch (e) {
    console.error("createGroups failed", e);
    throw e;
  }
}

export async function deleteGroups(name: string): Promise<string[]> {
  try {
    return await invoke<string[]>("delete_group", { name });
  } catch (e) {
    console.error("deleteGroups failed", e);
    throw e;
  }
}

export async function renameGroups(oldName: string, newName: string) {
  try {
    return await invoke<any>("rename_group", { oldName, newName });
  } catch (e) {
    console.error("deleteGroups failed", e);
    throw e;
  }
}

//Task => Subtask
export async function addSubtask(
  taskid: number,
  description: string,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("add_subtask", {
      taskId: taskid,
      description: description.trim(),
    });
  } catch (e) {
    console.error("addSubtask failed", e);
    throw e;
  }
}

export async function toggleSubtask(
  taskid: number,
  subTaskId: number,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("toggle_subtask", {
      taskId: taskid,
      subtaskId: subTaskId,
    });
  } catch (e) {
    console.error("toggleSubtask failed", e);
    throw e;
  }
}

export async function deleteSubtask(
  taskid: number,
  subTaskId: number,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("delete_subtask", {
      taskId: taskid,
      subtaskId: subTaskId,
    });
  } catch (e) {
    console.error("deleteSubtask failed", e);
    throw e;
  }
}

export async function updateSubtask(
  taskId: number,
  subtaskId: number,
  description: string,
  completed: boolean,
): Promise<Task[]> {
  try {
    return await invoke<Task[]>("update_subtask", {
      taskId,
      subtaskId,
      description,
      completed,
    });
  } catch (e) {
    console.error("updateSubtask failed", e);
    throw e;
  }
}

//Task => Folder
export async function getFolders(): Promise<any[]> {
  try {
    return await invoke<any[]>("get_folders");
  } catch (e) {
    console.error("getFolders failed", e);
    throw e;
  }
}

export async function deleteFolder(id: string): Promise<any[]> {
  try {
    return await invoke<any[]>("delete_folder", { id });
  } catch (e) {
    console.error("deleteFolder failed", e);
    throw e;
  }
}   


//Calender
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>("get_calendar_events");
  } catch (e) {
    console.error("getCalendarEvents failed", e);
    throw e;
  }
}

export async function updateCalendarEvents(
  eventData: any,
): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>("update_calendar_event", eventData);
  } catch (e) {
    console.error("updateSubtask failed", e);
    throw e;
  }
}

export async function createCalendarEvents(
  eventData: any,
): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>("create_calendar_event", eventData);
  } catch (e) {
    console.error("createCalendarEvents failed", e);
    throw e;
  }
}

export async function deleteCalendarEvents(
  id: string,
): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>("delete_calendar_event", { id });
  } catch (e) {
    console.error("deleteCalendarEvents failed", e);
    throw e;
  }
}

//Reading Memos

export async function getReadingBooks(): Promise<ReadingBook[]> {
  try {
    return await invoke<ReadingBook[]>("get_reading_books");
  } catch (e) {
    console.error("getReadingBooks failed", e);
    throw e;
  }
}

export async function createReadingBooks(
  title: string,
): Promise<ReadingBook[]> {
  try {
    return await invoke<ReadingBook[]>("create_reading_book", { title });
  } catch (e) {
    console.error("createReadingBooks failed", e);
    throw e;
  }
}

export async function updateReadingBooks(
  bookId: string,
  title: string,
  author: string | null,
  isbn: string | null,
  publisher: string | null,
  publishedYear: number | null,
  coverImageUrl: string | null,
  genres: string[],
  status: ReadingStatus,
  startDate: string | null,
  finishDate: string | null,
  totalPages: number | null,
  currentPage: number | null,
  rating: number | null,
  summary: string,
  tags: string[],
): Promise<ReadingBook[]> {
  try {
    return await invoke<ReadingBook[]>("update_reading_book", {
      id: bookId,
      title: title,
      author: author || null,
      isbn: isbn || null,
      publisher: publisher || null,
      publishedYear: publishedYear || null,
      coverImageUrl: coverImageUrl || null,
      genres: genres,
      status: status,
      startDate: startDate || null,
      finishDate: finishDate || null,
      totalPages: totalPages || null,
      currentPage: currentPage || null,
      rating: rating || null,
      summary: summary,
      tags: tags,
    });
  } catch (e) {
    console.error("createReadingBooks failed", e);
    throw e;
  }
}

export async function deleteReadingBooks(id: string) {
  try {
    return await invoke<ReadingBook[]>("delete_reading_book", { id });
  } catch (e) {
    console.error("deleteReadingBooks failed", e);
    throw e;
  }
}

//Reading Memos => sessions

export async function addReadingSession(
  bookId: string,
  sessionDate: string,
  startPage: number | undefined,
  endPage: number | undefined,
  pagesRead: number,
  durationMinutes: number | undefined,
  memo: string,
) {
  try {
    return await invoke("add_reading_session", {
      bookId: bookId,
      sessionDate: sessionDate,
      startPage: startPage || null,
      endPage: endPage || null,
      pagesRead,
      durationMinutes: durationMinutes || null,
      memo: memo || null,
    });
  } catch (e) {
    console.error("addReadingSession failed", e);
    throw e;
  }
}

export async function updateReadingSession(
  bookId: string,
  sessionId: string,
  sessionDate: string,
  startPage: number | undefined,
  endPage: number | undefined,
  pagesRead: number,
  durationMinutes: number | undefined,
  memo: string,
) {
  try {
    return await invoke("update_reading_session", {
      bookId: bookId,
      sessionId: sessionId,
      sessionDate: sessionDate,
      startPage: startPage || null,
      endPage: endPage || null,
      pagesRead,
      durationMinutes: durationMinutes || null,
      memo: memo || null,
    });
  } catch (e) {
    console.error("updateReadingSession failed", e);
    throw e;
  }
}

export async function deleteReadingSession(bookId: string, sessionId: string) {
  try {
    return await invoke("delete_reading_session", {
      bookId: bookId,
      sessionId,
    });
  } catch (e) {
    console.error("deleteReadingSession failed", e);
    throw e;
  }
}

//Reading Memos => reading notes
export async function addReadingNote(
  bookId: string,
  pageNumber: number | undefined,
  quote: string,
  comment: string,
) {
  try {
    return await invoke("add_reading_note", {
      bookId: bookId,
      pageNumber: pageNumber || null,
      quote: quote || null,
      comment,
    });
  } catch (e) {
    console.error("addReadingNote failed", e);
    throw e;
  }
}

export async function updateReadingNote(
  bookId: string,
  noteId: string,
  pageNumber: number | undefined,
  quote: string,
  comment: string,
) {
  try {
    return await invoke("update_reading_note", {
      bookId: bookId,
      noteId,
      pageNumber: pageNumber || null,
      quote: quote || null,
      comment,
    });
  } catch (e) {
    console.error("updateReadingNote failed", e);
    throw e;
  }
}

export async function deleteReadingNote(bookId: string, noteId: string) {
  try {
    return await invoke("delete_reading_note", {
      bookId: bookId,
      noteId,
    });
  } catch (e) {
    console.error("deleteReadingNote failed", e);
    throw e;
  }
}
