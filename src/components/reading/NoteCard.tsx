import { ReadingNote } from "../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NoteCardProps {
    note: ReadingNote;
    onEdit: () => void;
    onDelete: () => void;
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="note-card">
            <div className="note-card-header">
                {note.page_number ? (
                    <span className="page-number">p.{note.page_number}</span>
                ) : (
                    <span>ページなし</span>
                )}
                <span className="note-date">{formatDate(note.created_at)}</span>
            </div>

            {note.quote && (
                <div className="note-quote">
                    <span className="quote-icon">❝</span>
                    <p>{note.quote}</p>
                </div>
            )}

            <div className="note-comment markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {note.comment}
                </ReactMarkdown>
            </div>

            <div className="note-actions">
                <button onClick={onEdit} className="edit-btn">
                    編集
                </button>
                <button onClick={onDelete} className="delete-btn">
                    削除
                </button>
            </div>
        </div>
    );
}

export default NoteCard;
