import { useState } from "react";
import { ReadingBook, ReadingStatus } from "../../types";
import BookCard from "./BookCard";

interface BookListProps {
  books: ReadingBook[];
  selectedBook: ReadingBook | null;
  onSelectBook: (book: ReadingBook) => void;
  onCreateBook: (title: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: ReadingStatus | "all";
  onStatusFilterChange: (status: ReadingStatus | "all") => void;
}

const STATUS_OPTIONS: { value: ReadingStatus | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "reading", label: "読書中" },
  { value: "want_to_read", label: "未読" },
  { value: "finished", label: "読了" },
  { value: "paused", label: "中断" },
];

function BookList({
  books,
  selectedBook,
  onSelectBook,
  onCreateBook,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: BookListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleAdd = () => {
    if (newTitle.trim()) {
      onCreateBook(newTitle.trim());
      setNewTitle("");
      setShowAddDialog(false);
    }
  };

  return (
    <div className="reading-book-list">
      <div className="list-header">
        <h2>📚 読書リスト</h2>
        <button className="add-book-btn" onClick={() => setShowAddDialog(true)}>
          + 追加
        </button>
      </div>

      <div className="search-filter-container">
        <input
          type="text"
          placeholder="タイトル・著者で検索..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        <div className="filter-chips">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-chip ${statusFilter === opt.value ? "active" : ""}`}
              onClick={() => onStatusFilterChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {showAddDialog && (
        <div className="add-book-dialog">
          <input
            type="text"
            placeholder="書籍タイトル"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setShowAddDialog(false);
                setNewTitle("");
              }
            }}
            autoFocus
          />
          <div className="dialog-buttons">
            <button onClick={handleAdd}>追加</button>
            <button
              onClick={() => {
                setShowAddDialog(false);
                setNewTitle("");
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <div className="books-list">
        {books.length === 0 ? (
          <div className="empty-state">
            <p>書籍が見つかりません</p>
          </div>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isSelected={selectedBook?.id === book.id}
              onClick={() => onSelectBook(book)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default BookList;
