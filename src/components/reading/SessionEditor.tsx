import { useState } from "react";
import { ReadingSession } from "../../types";
import CustomDatePicker from "../CustomDatePicker";

interface SessionEditorProps {
  session: ReadingSession | null;
  onSave: (
    sessionDate: string,
    startPage: number | undefined,
    endPage: number | undefined,
    pagesRead: number,
    durationMinutes: number | undefined,
    memo: string,
  ) => void;
  onCancel: () => void;
}

function SessionEditor({ session, onSave, onCancel }: SessionEditorProps) {
  const [sessionDate, setSessionDate] = useState<string>(
    session
      ? new Date(session.session_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startPage, setStartPage] = useState<string>(
    session?.start_page?.toString() || "",
  );
  const [endPage, setEndPage] = useState<string>(
    session?.end_page?.toString() || "",
  );
  const [durationMinutes, setDurationMinutes] = useState<string>(
    session?.duration_minutes?.toString() || "",
  );
  const [memo, setMemo] = useState(session?.memo || "");

  // 読んだページ数を自動計算
  const calculatePagesRead = (): number => {
    const start = parseInt(startPage);
    const end = parseInt(endPage);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      return end - start + 1;
    }
    return 0;
  };

  const pagesRead = calculatePagesRead();

  const handleSave = () => {
    const start = parseInt(startPage);
    const end = parseInt(endPage);

    if (!startPage || isNaN(start) || start <= 0) {
      alert("開始ページを入力してください");
      return;
    }

    if (!endPage || isNaN(end) || end <= 0) {
      alert("終了ページを入力してください");
      return;
    }

    if (end < start) {
      alert("終了ページは開始ページ以上である必要があります");
      return;
    }

    onSave(
      sessionDate,
      start,
      end,
      pagesRead,
      durationMinutes ? parseInt(durationMinutes) : undefined,
      memo.trim(),
    );
  };

  const handleDateSelect = (dateTimeStr: string) => {
    // "YYYY-MM-DD HH:mm" 形式から日付部分のみ取得
    const dateStr = dateTimeStr.split(" ")[0];
    setSessionDate(dateStr);
    setShowDatePicker(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="session-editor">
      <h4>{session ? "読書ログを編集" : "新しい読書ログ"}</h4>

      <div className="form-group">
        <label>読書日 *</label>
        <div className="date-input-wrapper">
          <input
            type="text"
            value={formatDate(sessionDate)}
            onClick={() => setShowDatePicker(true)}
            readOnly
            placeholder="日付を選択"
          />
        </div>
        {showDatePicker && (
          <CustomDatePicker
            value={`${sessionDate} 12:00`}
            onChange={handleDateSelect}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>開始ページ *</label>
          <input
            type="number"
            placeholder="例: 45"
            value={startPage}
            onChange={(e) => setStartPage(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>終了ページ *</label>
          <input
            type="number"
            placeholder="例: 98"
            value={endPage}
            onChange={(e) => setEndPage(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>読んだページ数</label>
        <input
          type="text"
          value={pagesRead > 0 ? `${pagesRead}ページ` : "—"}
          readOnly
          className="calculated-field"
        />
        <small style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
          自動計算: 終了ページ - 開始ページ + 1
        </small>
      </div>

      <div className="form-group">
        <label>読書時間（分）</label>
        <input
          type="number"
          placeholder="例: 60"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>メモ</label>
        <textarea
          placeholder="その日の感想など（任意）"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
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

export default SessionEditor;
