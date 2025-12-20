import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    // clamp position to viewport after mount
    const el = ref.current;
    if (!el) {
      setPos({ left: x, top: y });
      return;
    }
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x;
    let top = y;
    if (left + rect.width > vw) left = Math.max(8, vw - rect.width - 8);
    if (top + rect.height > vh) top = Math.max(8, vh - rect.height - 8);
    setPos({ left, top });
  }, [x, y, items]);

  const handleItemClick = (it: ContextMenuItem) => {
    try {
      it.onClick();
    } catch (e) {
      console.error("ContextMenu item error", e);
    }
    onClose();
  };

  const menuContent = (
    <>
      <div
        ref={ref}
        className="context-menu"
        style={{
          position: "fixed",
          left: pos.left,
          top: pos.top,
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((it, idx) => (
          <div
            key={idx}
            onClick={() => handleItemClick(it)}
            className={it.danger ? "text-danger" : ""}
          >
            {it.label}
          </div>
        ))}
      </div>
      <div className="context-menu-overlay" onClick={onClose} />
    </>
  );

  // Use Portal to render at document.body level to avoid positioning issues
  return createPortal(menuContent, document.body);
};

export default ContextMenu;

