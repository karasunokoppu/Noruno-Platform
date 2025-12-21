// MemoEditor component
// Located in src/components/memo/MemoEditor.tsx
// This component provides a markdown editor for memos with auto‑save and tag management.

import React, { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Memo, Folder } from "../../types";
import CustomDropdown from "../CustomDropdown";
import { Link } from "react-router-dom";

interface MemoEditorProps {
  memo: Memo | null;
  folders: Folder[];
  allMemos: Memo[];
  onSave: (memo: Memo) => void;
  onDelete: (id: string) => void;
}

const MemoEditor: React.FC<MemoEditorProps> = ({
  memo,
  folders,
  allMemos,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    if (memo) {
      setTitle(memo.title);
      setContent(memo.content);
      setFolderId(memo.folder_id);
      setTags(memo.tags);
    } else {
      setTitle("");
      setContent("");
      setFolderId(null);
      setTags([]);
    }
  }, [memo]);

  const handleSave = useCallback(() => {
    if (memo) {
      const updated: Memo = {
        ...memo,
        title,
        content,
        folder_id: folderId,
        tags,
        updated_at: new Date().toISOString(),
      };
      onSave(updated);
      setLastSaved(new Date());
    }
  }, [memo, title, content, folderId, tags, onSave]);

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (
      memo &&
      (title !== memo.title ||
        content !== memo.content ||
        folderId !== memo.folder_id ||
        JSON.stringify(tags) !== JSON.stringify(memo.tags))
    ) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      const timer = setTimeout(() => {
        handleSave();
      }, 3000);
      setAutoSaveTimer(timer);
    }
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [title, content, folderId, tags]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleDelete = () => {
    if (memo && confirm(`Delete memo "${title}"?`)) {
      onDelete(memo.id);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Replace [[memo-title]] with clickable links
  const renderContentWithLinks = (text: string) => {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    return text.replace(linkRegex, (match, title) => {
      const linkedMemo = allMemos.find(
        (m) => m.title.toLowerCase() === title.toLowerCase(),
      );
      return linkedMemo ? `[${title}](#memo-${linkedMemo.id})` : match;
    });
  };

  // Find backlinks (memos that link to this one)
  const getBacklinks = () => {
    if (!memo) return [];
    return allMemos.filter(
      (m) => m.id !== memo.id && m.content.includes(`[[${memo.title}]]`),
    );
  };

  if (!memo) {
    return (
      <div className="memo-editor empty">
        <div className="empty-state">
          <p>Select a memo or create a new one to start editing</p>
        </div>
      </div>
    );
  }

  const backlinks = getBacklinks();

  return (
    <div className="memo-editor">
      <div className="memo-editor-header">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Memo title"
          className="memo-title-input"
        />
        <div className="memo-editor-actions">
          {lastSaved && (
            <span className="last-saved">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button onClick={handleSave}>Save</button>
          <button onClick={handleDelete} className="danger">
            Delete
          </button>
        </div>
      </div>

      <div className="memo-editor-meta">
        <div className="memo-folder-select">
          <label>Folder:</label>
          <CustomDropdown
            value={folderId || ""}
            onChange={(val) => setFolderId(val || null)}
            options={[
              { value: "", label: "No Folder" },
              ...folders.map((folder) => ({
                value: folder.id,
                label: folder.name,
              })),
            ]}
            style={{ minWidth: "150px" }}
          />
        </div>
        <div className="memo-tags">
          <label>Tags:</label>
          <div className="tag-list">
            {tags.map((tag) => (
              <span key={tag} className="tag-badge">
                {tag}
                <button onClick={() => handleRemoveTag(tag)}>×</button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="Add tag..."
              className="tag-input"
            />
          </div>
        </div>
      </div>

      <div className="memo-editor-content">
        <div className="memo-editor-pane">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your memo in Markdown... Use [[memo-title]] to link to other memos."
            className="memo-textarea"
          />
        </div>
        <div className="memo-preview-pane">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              a: ({ href, children, ...props }) => {
                if (href && (href.startsWith("http") || href.startsWith("https"))) {
                  return(
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  );
                }
                
                //TODO [ここをロジックを修正]
                // if(href&& href.startsWith("#memo-")){
                //   return(
                //   <Link to="/">{children}</Link>
                //   );
                // }

                return (<a href={href}>{children}</a>);
              },
            }}
          >
            {renderContentWithLinks(content)}
          </ReactMarkdown>
        </div>
      </div>

      {backlinks.length > 0 && (
        <div className="memo-backlinks">
          <h4>Linked from:</h4>
          <ul className="memo-backlinks-list">
            {backlinks.map((link) => (
              <li key={link.id}>{link.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MemoEditor;
