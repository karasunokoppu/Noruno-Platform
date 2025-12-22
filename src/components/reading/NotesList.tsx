import { useState } from "react";
import { ReadingBook, ReadingNote } from "../../types";
import NoteCard from "./NoteCard";
import NoteEditor from "./NoteEditor";
import {
  addReadingNote,
  deleteReadingNote,
  updateReadingNote,
} from "../../tauri/reading_api";

interface NotesListProps {
  book: ReadingBook;
  onUpdateBook: () => void;
}

function NotesList({ book, onUpdateBook }: NotesListProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<ReadingNote | null>(null);

  const handleAddNote = async (
    pageNumber: number | undefined,
    quote: string,
    comment: string,
  ) => {
    try {
      await addReadingNote(book.id, pageNumber, quote, comment);
      onUpdateBook();
      setShowEditor(false);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleUpdateNote = async (
    noteId: string,
    pageNumber: number | undefined,
    quote: string,
    comment: string,
  ) => {
    try {
      await updateReadingNote(book.id, noteId, pageNumber, quote, comment);
      onUpdateBook();
      setEditingNote(null);
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("このメモを削除しますか？")) return;

    try {
      await deleteReadingNote(book.id, noteId);
      onUpdateBook();
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const startEdit = (note: ReadingNote) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  return (
    <div className="notes-list">
      <button className="add-note-btn" onClick={() => setShowEditor(true)}>
        + 新しいメモを追加
      </button>

      {showEditor && (
        <NoteEditor
          note={editingNote}
          onSave={
            editingNote
              ? (pn, q, c) => handleUpdateNote(editingNote.id, pn, q, c)
              : handleAddNote
          }
          onCancel={() => {
            setShowEditor(false);
            setEditingNote(null);
          }}
        />
      )}

      <div className="notes-items">
        {book.notes.length === 0 ? (
          <div className="empty-state">
            <p>まだメモがありません</p>
            <p>「+ 新しいメモを追加」から始めましょう</p>
          </div>
        ) : (
          book.notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => startEdit(note)}
              onDelete={() => handleDeleteNote(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default NotesList;
