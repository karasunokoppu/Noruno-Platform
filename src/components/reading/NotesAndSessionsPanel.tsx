import { useState } from "react";
import { ReadingBook } from "./ReadingMemoView";
import NotesList from "./NotesList";
import SessionsList from "./SessionsList";

interface NotesAndSessionsPanelProps {
    book: ReadingBook | null;
    onUpdateBook: () => void;
}

function NotesAndSessionsPanel({
    book,
    onUpdateBook,
}: NotesAndSessionsPanelProps) {
    const [activeTab, setActiveTab] = useState<"notes" | "sessions">("notes");

    if (!book) {
        return (<div className="reading-notes-panel empty">
            <p>書籍を選択してください</p>
        </div>
        );
    }

    return (
        <div className="reading-notes-panel">
            <div className="panel-tabs">
                <button
                    className={`tab-button ${activeTab === "notes" ? "active" : ""}`}
                    onClick={() => setActiveTab("notes")}
                >
                    📝 メモ ({book.notes.length})
                </button>
                <button
                    className={`tab-button ${activeTab === "sessions" ? "active" : ""}`}
                    onClick={() => setActiveTab("sessions")}
                >
                    📊 読書ログ ({book.reading_sessions.length})
                </button>
            </div>

            <div className="panel-content">
                {activeTab === "notes" ? (
                    <NotesList book={book} onUpdateBook={onUpdateBook} />
                ) : (
                    <SessionsList book={book} onUpdateBook={onUpdateBook} />
                )}
            </div>
        </div>
    );
}

export default NotesAndSessionsPanel;
