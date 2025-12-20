import React, { useState, useEffect } from "react";
import { Task } from "./../types";
import CustomDropdown from "./CustomDropdown";
import CalendarEventDialog from "./CalendarEventDialog";
import {
  createCalendarEvents,
  deleteCalendarEvents,
  getCalendarEvents,
  updateCalendarEvents,
} from "../tauri/api";
import { CalendarEvent } from "../types";

interface CalendarViewProps {
  tasks: Task[];
  groups: string[];
  onEdit: (task: Task) => void;
  onAddTask: (date: string) => void; // Callback to open Task dialog from App.tsx
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  groups,
  onEdit,
  onAddTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Dialog states
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(
    undefined,
  );
  const [clickDate, setClickDate] = useState<string | undefined>(undefined);
  const [showTypeSelection, setShowTypeSelection] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await getCalendarEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const onDateClick = (dateStr: string) => {
    setClickDate(dateStr);
    setShowTypeSelection(true);
  };

  const handleEventSave = async (eventData: any) => {
    try {
      let updatedEvents;
      if (eventData.id) {
        // Update
        updatedEvents = await updateCalendarEvents(eventData);
      } else {
        // Create
        updatedEvents = await createCalendarEvents(eventData);
      }
      setEvents(updatedEvents);
      setShowEventDialog(false);
      setSelectedEvent(undefined);
    } catch (error) {
      console.error("Failed to save event:", error);
      alert(`Failed to save event: ${error}`);
    }
  };

  const handleEventDelete = async (id: string) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const updatedEvents = await deleteCalendarEvents(id);
      setEvents(updatedEvents);
      setShowEventDialog(false);
      setSelectedEvent(undefined);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-view-day empty"></div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      // Filter Tasks
      const dayTasks = tasks.filter((t) => {
        const dateMatch = t.due_date.startsWith(dateStr);
        const groupMatch = selectedGroup === "" || t.group === selectedGroup;
        return dateMatch && groupMatch;
      });

      // Filter Events
      const dayEvents = events.filter((e) => {
        // Simple date matching for start date.
        // Multi-day events logic would be more complex (check overlap),
        // but for now checking if start_datetime starts with dateStr is a good start to show the start.
        // Or if dateStr is within range? Simple start match for MVP.
        return e.start_datetime.startsWith(dateStr);
      });

      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`calendar-view-day ${isToday ? "today" : ""}`}
          onClick={(e) => {
            // Avoid triggering day click if clicking an item
            if (
              e.target === e.currentTarget ||
              (e.target as HTMLElement).classList.contains("day-number")
            ) {
              onDateClick(dateStr);
            }
          }}
        >
          <div className="day-number">{day}</div>
          <div className="day-tasks">
            {/* Tasks */}
            {dayTasks.map((task) => (
              <div
                key={task.id}
                className={`day-task-item ${task.completed ? "completed" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                title={`Task: ${task.description}`}
              >
                {task.description}
              </div>
            ))}
            {/* Events */}
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="day-task-item event-item"
                style={{
                  backgroundColor: event.color || "var(--accent-primary)",
                  borderLeft: "3px solid rgba(0,0,0,0.2)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setShowEventDialog(true);
                }}
                title={`Event: ${event.title}\n${event.description}`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>,
      );
    }
    return days;
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="header-left">
          <button onClick={handlePrevMonth}>&lt;</button>
          <button onClick={handleNextMonth}>&gt;</button>
          <button onClick={handleToday} className="today-btn">
            Today
          </button>
          <div style={{ width: "150px", marginLeft: "10px" }}>
            <CustomDropdown
              value={selectedGroup}
              onChange={setSelectedGroup}
              options={[
                { value: "", label: "All Groups" },
                ...groups.map((g) => ({ value: g, label: g })),
              ]}
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <h2>
          {year}/{String(month + 1).padStart(2, "0")}
        </h2>
      </div>

      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-view-grid">{renderCalendarDays()}</div>

      {/* Type Selection Dialog (Simple Overlay) */}
      {showTypeSelection && (
        <div
          className="dialog-overlay"
          onClick={() => setShowTypeSelection(false)}
        >
          <div
            className="dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "300px", textAlign: "center" }}
          >
            <h3>Add Item for {clickDate}</h3>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => {
                  setShowTypeSelection(false);
                  onAddTask(clickDate!);
                }}
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowTypeSelection(false);
                  setSelectedEvent(undefined);
                  setShowEventDialog(true);
                }}
              >
                Add Event/Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Dialog */}
      {showEventDialog && (
        <CalendarEventDialog
          event={selectedEvent}
          initialDate={clickDate}
          onSave={handleEventSave}
          onDelete={selectedEvent ? (id) => handleEventDelete(id) : undefined}
          onCancel={() => {
            setShowEventDialog(false);
            setSelectedEvent(undefined);
          }}
        />
      )}
      {/* We could add delete button inside dialog or handle it differently. 
                For now let's add a DELETE button to the dialog if editing? 
                Actually CalendarEventDialog doesn't have delete button. 
                I'll modify CalendarEventDialog or handle it here. 
                Wait, I can't pass onDelete to CalendarEventDialog comfortably if I didn't define it. 
                Let's stick to Save/Cancel there. 
                If I want to delete, maybe click-hold or separate button?
                Or I can add a small delete button in the event rendering?
                Or update CalendarEventDialog to support delete.
            */}
    </div>
  );
};

export default CalendarView;
