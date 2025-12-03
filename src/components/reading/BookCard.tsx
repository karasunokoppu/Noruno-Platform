import { ReadingBook } from "./ReadingMemoView";

interface BookCardProps {
    book: ReadingBook;
    isSelected: boolean;
    onClick: () => void;
}

const STATUS_LABELS: Record<string, string> = {
    want_to_read: "未読",
    reading: "読書中",
    finished: "読了",
    paused: "中断",
};

const STATUS_ICONS: Record<string, string> = {
    want_to_read: "📖",
    reading: "📚",
    finished: "✅",
    paused: "⏸️",
};

function BookCard({ book, isSelected, onClick }: BookCardProps) {
    return (
        <div
            className={`book-card ${isSelected ? "selected" : ""}`}
            onClick={onClick}
        >
            <div className="book-card-header">
                <span className="status-icon">{STATUS_ICONS[book.status]}</span>
                <span className="status-label">{STATUS_LABELS[book.status]}</span>
            </div>
            <h3 className="book-title">{book.title}</h3>
            {book.author && <p className="book-author">{book.author}</p>}
            {book.progress_percent !== undefined && (
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${book.progress_percent}%` }}
                    />
                    <span className="progress-text">{book.progress_percent}%</span>
                </div>
            )}
        </div>
    );
}

export default BookCard;
