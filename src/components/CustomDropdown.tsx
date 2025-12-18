import React, { useState, useRef, useEffect } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  style?: React.CSSProperties;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  return (
    <div
      className="custom-dropdown"
      ref={dropdownRef}
      style={style}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div
        className={`custom-dropdown-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-dropdown-value">{displayText}</span>
        <span className="custom-dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className="custom-dropdown-menu">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`custom-dropdown-option ${
                option.value === value ? "selected" : ""
              } ${index === focusedIndex ? "focused" : ""}`}
              onClick={() => handleOptionClick(option.value)}
              onMouseEnter={() => setFocusedIndex(index)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
