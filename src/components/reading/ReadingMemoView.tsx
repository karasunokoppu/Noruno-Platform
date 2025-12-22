import { useState, useEffect } from "react";
import BookList from "./BookList";
import BookDetail from "./BookDetail";
import NotesAndSessionsPanel from "./NotesAndSessionsPanel";
import { ReadingBook, ReadingStatus } from "../../types";
import {
  createReadingBooks,
  deleteReadingBooks,
  getReadingBooks,
  updateReadingBooks,
} from "../../tauri/reading_api";

function ReadingMemoView() {
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<ReadingBook | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | "all">(
    "all",
  );

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      const currentBookId = selectedBook?.id;
      const loadedBooks = await getReadingBooks();
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
      const updatedBooks = await createReadingBooks(title);
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
      const updatedBooks = await updateReadingBooks(
        book.id,
        book.title,
        book.author || null,
        book.isbn || null,
        book.publisher || null,
        book.published_year || null,
        book.cover_image_url || null,
        book.genres,
        book.status,
        book.start_date || null,
        book.finish_date || null,
        book.total_pages || null,
        book.current_page || null,
        book.rating || null,
        book.summary,
        book.tags,
      );
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
      const updatedBooks = await deleteReadingBooks(id);
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
