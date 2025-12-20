import React, { useState } from "react";
import CustomDatePicker from "./CustomDatePicker";
import CustomDropdown from "./CustomDropdown";

interface TaskInputProps {
  onAddTask: (
    desc: string,
    date: string,
    group: string,
    details: string,
    notificationMinutes?: number,
    startDate?: string,
  ) => void;
  existingGroups: string[];
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, existingGroups }) => {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [group, setGroup] = useState("");
  const [details, setDetails] = useState("");
  const [notifyDays, setNotifyDays] = useState<string>("");
  const [notifyHours, setNotifyHours] = useState<string>("");
  const [notifyMinutes, setNotifyMinutes] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (!description.trim()) return;

    // Convert days/hours/minutes to total minutes
    const totalMinutes =
      (parseInt(notifyDays) || 0) * 1440 +
      (parseInt(notifyHours) || 0) * 60 +
      (parseInt(notifyMinutes) || 0);

    onAddTask(
      description,
      date,
      group,
      details,
      totalMinutes > 0 ? totalMinutes : undefined,
      startDate || undefined,
    );
    setDescription("");
    setDate("");
    setStartDate("");
    setGroup("");
    setDetails("");
    setNotifyDays("");
    setNotifyHours("");
    setNotifyMinutes("");
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="task-input-container">
      <div className="task-input-row">
        <input
          type="text"
          placeholder="Task description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          className="task-input"
          onFocus={() => setIsExpanded(true)}
        />
        <button className="task-add-btn" onClick={handleSubmit}>
          Add Task
        </button>
      </div>

      <div className={`task-expanded-section ${isExpanded ? "expanded" : "collapsed"}`}>
        <div className="task-date-row">
          <div className="task-date-col">
            <label className="task-date-label">Start Date</label>
            <button
              className="task-date-btn"
              onClick={() => setShowStartDatePicker(true)}
            >
              {startDate ? startDate.replace(/-/g, "/") : "Select Start Date"}
            </button>
          </div>
          <div className="task-date-col">
            <label className="task-date-label">Due Date</label>
            <button
              className="task-date-btn"
              onClick={() => setShowDatePicker(true)}
            >
              {date ? date.replace(/-/g, "/") : "Select Due Date"}
            </button>
          </div>
        </div>

        <div className="task-input-row">
          <CustomDropdown
            value={group}
            onChange={setGroup}
            options={[
              { value: "", label: "No Group" },
              ...existingGroups.map((g) => ({ value: g, label: g })),
            ]}
            style={{ width: "100%" }}
          />
        </div>

        <div className="task-input-row">
          <input
            type="text"
            placeholder="Details (optional)..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            onKeyDown={handleKeyDown}
            className="task-input-full"
          />
        </div>

        <div className="task-notify-row">
          <label className="task-notify-label">Notify before:</label>
          <div className="task-notify-inputs">
            <div className="task-notify-field">
              <input
                type="number"
                placeholder="0"
                value={notifyDays}
                onChange={(e) => setNotifyDays(e.target.value)}
                onKeyDown={handleKeyDown}
                className="task-notify-input"
                min="0"
              />
              <small className="task-notify-unit">Days</small>
            </div>
            <div className="task-notify-field">
              <input
                type="number"
                placeholder="0"
                value={notifyHours}
                onChange={(e) => setNotifyHours(e.target.value)}
                onKeyDown={handleKeyDown}
                className="task-notify-input"
                min="0"
                max="23"
              />
              <small className="task-notify-unit">Hours</small>
            </div>
            <div className="task-notify-field">
              <input
                type="number"
                placeholder="0"
                value={notifyMinutes}
                onChange={(e) => setNotifyMinutes(e.target.value)}
                onKeyDown={handleKeyDown}
                className="task-notify-input"
                min="0"
                max="59"
              />
              <small className="task-notify-unit">Minutes</small>
            </div>
          </div>
        </div>

        <div className="task-input-row">
          <button
            className="task-cancel-btn"
            onClick={() => setIsExpanded(false)}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>

      {showDatePicker && (
        <CustomDatePicker
          value={date}
          onChange={setDate}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {showStartDatePicker && (
        <CustomDatePicker
          value={startDate}
          onChange={setStartDate}
          onClose={() => setShowStartDatePicker(false)}
        />
      )}
    </div>
  );
};

export default TaskInput;
