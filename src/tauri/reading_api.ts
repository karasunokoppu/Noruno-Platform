import { invoke } from "@tauri-apps/api/core";
import type { ReadingBook, ReadingStatus } from "../types";
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
