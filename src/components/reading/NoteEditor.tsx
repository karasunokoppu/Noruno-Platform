import { useState } from "react";
import { ReadingNote } from "../../types";

interface NoteEditorProps {
    note: ReadingNote | null;
    onSave: (
        pageNumber: number | undefined,
        quote: string,
        comment: string
    ) => void;
    onCancel: () => void;
}

function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
    const [pageNumber, setPageNumber] = useState<string>(
        note?.page_number?.toString() || ""
    );
    const [quote, setQuote] = useState(note?.quote || "");
    const [comment, setComment] = useState(note?.comment || "");

    const handleSave = () => {
        if (!comment.trim()) {
            alert("コメントは必須です");
            return;
        }

        onSave(
            pageNumber ? parseInt(pageNumber) : undefined,
            quote.trim(),
            comment.trim()
        );
    };

    return (
        <div className="note-editor">
            <h4>{note ? "メモを編集" : "新しいメモ"}</h4>

            <div className="form-group">
                <label>ページ番号</label>
                <input
                    type="number"
                    placeholder="例: 123"
                    value={pageNumber}
                    onChange={(e) => setPageNumber(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>引用</label>
                <textarea
                    placeholder="本から引用したテキスト（任意）"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    rows={3}
                />
            </div>

            <div className="form-group">
                <label>コメント *</label>
                <textarea
                    placeholder="自分の考えやメモ"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                />
            </div>

            <div className="editor-actions">
                <button onClick={handleSave}>保存</button>
                <button onClick={onCancel} className="secondary">
                    キャンセル
                </button>
            </div>
        </div>
    );
}

export default NoteEditor;
