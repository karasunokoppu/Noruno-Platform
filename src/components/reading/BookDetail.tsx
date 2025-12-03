import { useState } from "react";
import { ReadingBook, ReadingStatus } from "./ReadingMemoView";

interface BookDetailProps {
    book: ReadingBook | null;
    onUpdateBook: (book: ReadingBook) => void;
    onDeleteBook: (id: string) => void;
}

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
    { value: "want_to_read", label: "未読（読みたい）" },
    { value: "reading", label: "読書中" },
    { value: "finished", label: "読了" },
    { value: "paused", label: "中断" },
];

function BookDetail({ book, onUpdateBook, onDeleteBook }: BookDetailProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedBook, setEditedBook] = useState<ReadingBook | null>(null);

    if (!book) {
        return (
            <div className="reading-book-detail empty">
                <p>書籍を選択してください</p>
            </div>
        );
    }

    const startEdit = () => {
        setEditedBook({ ...book });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setEditedBook(null);
        setIsEditing(false);
    };

    const saveEdit = () => {
        if (editedBook) {
            onUpdateBook(editedBook);
            setIsEditing(false);
            setEditedBook(null);
        }
    };

    const handleDelete = () => {
        if (confirm(`「${book.title}」を削除しますか？`)) {
            onDeleteBook(book.id);
        }
    };

    const currentBook = isEditing && editedBook ? editedBook : book;

    return (
        <div className="reading-book-detail">
            <div className="detail-header">
                <h2>書籍詳細</h2>
                <div className="detail-actions">
                    {!isEditing ? (
                        <>
                            <button onClick={startEdit}>編集</button>
                            <button onClick={handleDelete} className="delete-btn">
                                削除
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={saveEdit}>保存</button>
                            <button onClick={cancelEdit}>キャンセル</button>
                        </>
                    )}
                </div>
            </div>

            <div className="detail-content">
                {/* タイトル */}
                <div className="form-group">
                    <label>タイトル *</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={currentBook.title}
                            onChange={(e) =>
                                setEditedBook({ ...currentBook, title: e.target.value })
                            }
                        />
                    ) : (
                        <p className="field-value">{currentBook.title}</p>
                    )}
                </div>

                {/* 著者 */}
                <div className="form-group">
                    <label>著者</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={currentBook.author || ""}
                            onChange={(e) =>
                                setEditedBook({
                                    ...currentBook,
                                    author: e.target.value || undefined,
                                })
                            }
                        />
                    ) : (
                        <p className="field-value">{currentBook.author || "—"}</p>
                    )}
                </div>

                {/* 出版社 */}
                <div className="form-group">
                    <label>出版社</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={currentBook.publisher || ""}
                            onChange={(e) =>
                                setEditedBook({
                                    ...currentBook,
                                    publisher: e.target.value || undefined,
                                })
                            }
                        />
                    ) : (
                        <p className="field-value">{currentBook.publisher || "—"}</p>
                    )}
                </div>

                {/* 出版年 */}
                <div className="form-group">
                    <label>出版年</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={currentBook.published_year || ""}
                            onChange={(e) =>
                                setEditedBook({
                                    ...currentBook,
                                    published_year: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                })
                            }
                        />
                    ) : (
                        <p className="field-value">{currentBook.published_year || "—"}</p>
                    )}
                </div>

                {/* ISBN */}
                <div className="form-group">
                    <label>ISBN</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={currentBook.isbn || ""}
                            onChange={(e) =>
                                setEditedBook({
                                    ...currentBook,
                                    isbn: e.target.value || undefined,
                                })
                            }
                        />
                    ) : (
                        <p className="field-value">{currentBook.isbn || "—"}</p>
                    )}
                </div>

                {/* ステータス */}
                <div className="form-group">
                    <label>ステータス</label>
                    {isEditing ? (
                        <select
                            value={currentBook.status}
                            onChange={(e) =>
                                setEditedBook({
                                    ...currentBook,
                                    status: e.target.value as ReadingStatus,
                                })
                            }
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p className="field-value">
                            {
                                STATUS_OPTIONS.find((opt) => opt.value === currentBook.status)
                                    ?.label
                            }
                        </p>
                    )}
                </div>

                {/* 総ページ数 */}
                <div className="form-group">
                    <label>総ページ数</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={currentBook.total_pages || ""}
                            onChange={(e) =>
                                setEditedBook({
                                    ...currentBook,
                                    total_pages: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                })
                            }
                        />
                    ) : (
                        <p className="field-value">{currentBook.total_pages || "—"}</p>
                    )}
                </div>

                {/* 現在のページ */}
                <div className="form-group">
                    <label>現在のページ</label>
                    {isEditing ? (
                        <input
                            type="number"
                            value={currentBook.current_page || ""}
                            onChange={(e) =>
                                setEditedBook({
                                    ...currentBook,
                                    current_page: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                })
                            }
                        />
                    ) : (
                        <p className="field-value">{currentBook.current_page || "—"}</p>
                    )}
                </div>

                {/* 感想/要約 */}
                <div className="form-group">
                    <label>全体的な感想・要約</label>
                    {isEditing ? (
                        <textarea
                            value={currentBook.summary}
                            onChange={(e) =>
                                setEditedBook({ ...currentBook, summary: e.target.value })
                            }
                            rows={8}
                        />
                    ) : (
                        <p className="field-value summary">
                            {currentBook.summary || "まだ感想がありません"}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookDetail;
