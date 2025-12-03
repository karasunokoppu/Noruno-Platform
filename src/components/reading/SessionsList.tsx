import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ReadingBook, ReadingSession } from "./ReadingMemoView";
import SessionCard from "./SessionCard";
import SessionEditor from "./SessionEditor";
import ProgressChart from "./ProgressChart";

interface SessionsListProps {
    book: ReadingBook;
    onUpdateBook: () => void;
}

function SessionsList({ book, onUpdateBook }: SessionsListProps) {
    const [showEditor, setShowEditor] = useState(false);
    const [editingSession, setEditingSession] = useState<ReadingSession | null>(
        null
    );

    const handleAddSession = async (
        sessionDate: string,
        startPage: number | undefined,
        endPage: number | undefined,
        pagesRead: number,
        durationMinutes: number | undefined,
        memo: string
    ) => {
        try {
            await invoke("add_reading_session", {
                bookId: book.id,
                sessionDate: new Date(sessionDate).toISOString(),
                startPage: startPage || null,
                endPage: endPage || null,
                pagesRead,
                durationMinutes: durationMinutes || null,
                memo: memo || null,
            });
            onUpdateBook();
            setShowEditor(false);
        } catch (error) {
            console.error("Failed to add session:", error);
        }
    };

    const handleUpdateSession = async (
        sessionId: string,
        sessionDate: string,
        startPage: number | undefined,
        endPage: number | undefined,
        pagesRead: number,
        durationMinutes: number | undefined,
        memo: string
    ) => {
        try {
            await invoke("update_reading_session", {
                bookId: book.id,
                sessionId,
                sessionDate: new Date(sessionDate).toISOString(),
                startPage: startPage || null,
                endPage: endPage || null,
                pagesRead,
                durationMinutes: durationMinutes || null,
                memo: memo || null,
            });
            onUpdateBook();
            setEditingSession(null);
        } catch (error) {
            console.error("Failed to update session:", error);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm("この読書ログを削除しますか？")) return;

        try {
            await invoke("delete_reading_session", {
                bookId: book.id,
                sessionId,
            });
            onUpdateBook();
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    const startEdit = (session: ReadingSession) => {
        setEditingSession(session);
        setShowEditor(true);
    };

    // セッションを日付順にソート（新しい順）
    const sortedSessions = [...book.reading_sessions].sort(
        (a, b) =>
            new Date(b.session_date).getTime() - new Date(a.session_date).getTime()
    );

    return (
        <div className="sessions-list">
            {book.reading_sessions.length > 0 && (
                <ProgressChart sessions={book.reading_sessions} />
            )}

            <button
                className="add-session-btn"
                onClick={() => setShowEditor(true)}
            >
                + 今日の読書を記録
            </button>

            {showEditor && (
                <SessionEditor
                    session={editingSession}
                    onSave={
                        editingSession
                            ? (sd, sp, ep, pr, dm, m) =>
                                handleUpdateSession(editingSession.id, sd, sp, ep, pr, dm, m)
                            : handleAddSession
                    }
                    onCancel={() => {
                        setShowEditor(false);
                        setEditingSession(null);
                    }}
                />
            )}

            <div className="sessions-items">
                {sortedSessions.length === 0 ? (
                    <div className="empty-state">
                        <p>まだ読書ログがありません</p>
                        <p>「+ 今日の読書を記録」から始めましょう</p>
                    </div>
                ) : (
                    sortedSessions.map((session) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            onEdit={() => startEdit(session)}
                            onDelete={() => handleDeleteSession(session.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default SessionsList;
