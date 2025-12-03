import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import BookList from "./BookList";
import BookDetail from "./BookDetail";
import NotesAndSessionsPanel from "./NotesAndSessionsPanel";

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

function ReadingMemoView() {
    const [books, setBooks] = useState<ReadingBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<ReadingBook | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ReadingStatus | "all">("all");

    useEffect(() => {
        loadBooks();
    }, []);

    async function loadBooks() {
        try {
            const currentBookId = selectedBook?.id;
            const loadedBooks = await invoke<ReadingBook[]>("get_reading_books");
            setBooks(loadedBooks);

            // 選択中の書籍があれば再選択（最新データに更新）
            if (currentBookId) {
                const updatedBook = loadedBooks.find((b) => b.id === currentBookId);
                if (updatedBook) {
                    setSelectedBook(updatedBook);
                }
            }
        } catch (error) {
            console.error("Failed to load reading books:", error);
        }
    }

    // フィルタリングと検索
    const filteredBooks = books.filter((book) => {
        // ステータスフィルタ
        if (statusFilter !== "all" && book.status !== statusFilter) {
            return false;
        }

        // 検索クエリ
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const titleMatch = book.title.toLowerCase().includes(query);
            const authorMatch = book.author?.toLowerCase().includes(query) || false;
            return titleMatch || authorMatch;
        }

        return true;
    });

    const handleCreateBook = async (title: string) => {
        try {
            const updatedBooks = await invoke<ReadingBook[]>("create_reading_book", {
                title,
            });
            setBooks(updatedBooks);
            // 新しく作成した本を選択
            if (updatedBooks.length > 0) {
                setSelectedBook(updatedBooks[updatedBooks.length - 1]);
                // フィルタをリセットして新規作成した本が表示されるようにする
                setSearchQuery("");
                setStatusFilter("all");
            }
        } catch (error) {
            console.error("Failed to create book:", error);
        }
    };

    const handleUpdateBook = async (book: ReadingBook) => {
        try {
            const updatedBooks = await invoke<ReadingBook[]>("update_reading_book", {
                id: book.id,
                title: book.title,
                author: book.author || null,
                isbn: book.isbn || null,
                publisher: book.publisher || null,
                publishedYear: book.published_year || null,
                coverImageUrl: book.cover_image_url || null,
                genres: book.genres,
                status: book.status,
                startDate: book.start_date || null,
                finishDate: book.finish_date || null,
                totalPages: book.total_pages || null,
                currentPage: book.current_page || null,
                rating: book.rating || null,
                summary: book.summary,
                tags: book.tags,
            });
            setBooks(updatedBooks);
            // 更新された書籍を再選択
            const updated = updatedBooks.find((b) => b.id === book.id);
            if (updated) {
                setSelectedBook(updated);
            }
        } catch (error) {
            console.error("Failed to update book:", error);
        }
    };

    const handleDeleteBook = async (id: string) => {
        try {
            const updatedBooks = await invoke<ReadingBook[]>("delete_reading_book", {
                id,
            });
            setBooks(updatedBooks);
            if (selectedBook?.id === id) {
                setSelectedBook(null);
            }
        } catch (error) {
            console.error("Failed to delete book:", error);
        }
    };

    return (
        <div className="reading-memo-container">
            <BookList
                books={filteredBooks}
                selectedBook={selectedBook}
                onSelectBook={setSelectedBook}
                onCreateBook={handleCreateBook}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />
            <BookDetail
                book={selectedBook}
                onUpdateBook={handleUpdateBook}
                onDeleteBook={handleDeleteBook}
            />
            <NotesAndSessionsPanel book={selectedBook} onUpdateBook={loadBooks} />
        </div>
    );
}

export default ReadingMemoView;
