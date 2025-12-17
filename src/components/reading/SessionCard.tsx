import { ReadingSession } from "../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SessionCardProps {
    session: ReadingSession;
    onEdit: () => void;
    onDelete: () => void;
}

function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPageRange = () => {
        if (session.start_page && session.end_page) {
            return `p.${session.start_page} → p.${session.end_page} `;
        } else if (session.start_page) {
            return `p.${session.start_page} から`;
        } else if (session.end_page) {
            return `p.${session.end_page} まで`;
        }
        return null;
    };

    return (
        <div className="session-card">
            <div className="session-card-header">
                <span className="session-date">{formatDate(session.session_date)}</span>
                {session.duration_minutes && (
                    <span className="session-duration">
                        ⏱️ {session.duration_minutes}分
                    </span>
                )}
            </div>

            <div className="session-progress">
                <div className="pages-read">
                    <strong>{session.pages_read}ページ</strong>読了
                </div>
                {formatPageRange() && (
                    <div className="page-range">{formatPageRange()}</div>
                )}
            </div>

            {session.memo && (
                <div className="session-memo markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {session.memo}
                    </ReactMarkdown>
                </div>
            )}

            <div className="session-actions">
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

export default SessionCard;
