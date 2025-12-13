import React, { useState } from 'react';
import CustomDatePicker from './CustomDatePicker';
import { CalendarEvent } from './CalendarView';

interface CalendarEventDialogProps {
    event?: CalendarEvent; // If passed, editing mode
    initialDate?: string; // e.g. "2023-12-01"
    onSave: (eventData: any) => void;
    onDelete?: (id: string) => void;
    onCancel: () => void;
}

const CalendarEventDialog: React.FC<CalendarEventDialogProps> = ({ event, initialDate, onSave, onDelete, onCancel }) => {
    // Initial values
    const [title, setTitle] = useState(event?.title || '');
    const [description, setDescription] = useState(event?.description || '');

    // Parse initial date/time
    // event.start_datetime format: "YYYY-MM-DD HH:MM" or "YYYY-MM-DD"
    const parseDateTime = (dtStr: string) => {
        const parts = dtStr.split(' ');
        if (parts.length >= 2) return { date: parts[0], time: parts[1] };
        return { date: dtStr, time: '09:00' };
    };

    const initialStart = event?.start_datetime
        ? parseDateTime(event.start_datetime)
        : { date: initialDate || new Date().toISOString().split('T')[0], time: '09:00' };

    const initialEnd = event?.end_datetime
        ? parseDateTime(event.end_datetime)
        : { date: initialDate || new Date().toISOString().split('T')[0], time: '10:00' };

    const [startDate, setStartDate] = useState(initialStart.date);
    const [startTime, setStartTime] = useState(initialStart.time);
    const [endDate, setEndDate] = useState(initialEnd.date);
    const [endTime, setEndTime] = useState(initialEnd.time);
    const [allDay, setAllDay] = useState(event?.all_day || false);
    const [color, setColor] = useState(event?.color || '#3b82f6'); // Default blue

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const handleSave = () => {
        if (!title.trim()) {
            alert("Title is required");
            return;
        }

        const start_datetime = allDay ? startDate : `${startDate} ${startTime}`;
        const end_datetime = allDay ? undefined : `${endDate} ${endTime}`;

        onSave({
            id: event?.id, // undefined if new
            title,
            description,
            startDatetime: start_datetime,
            endDatetime: end_datetime || null,
            allDay: allDay,
            color,
            recurrenceRule: event?.recurrence_rule || null,
            reminderMinutes: event?.reminder_minutes || null
        });
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog" style={{ maxWidth: '500px' }}>
                <h2>{event ? 'Edit Event' : 'New Event'}</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            placeholder="Event Title"
                            autoFocus
                        />
                    </div>

                    {/* All Day Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            id="allDay"
                            checked={allDay}
                            onChange={(e) => setAllDay(e.target.checked)}
                        />
                        <label htmlFor="allDay" style={{ fontSize: '14px', color: '#fff' }}>All Day</label>
                    </div>

                    {/* Time Range */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>Start</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button className="secondary" onClick={() => setShowStartDatePicker(true)} style={{ flex: 2 }}>
                                    {startDate.replace(/-/g, '/')}
                                </button>
                                {!allDay && (
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                )}
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>End</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button className="secondary" onClick={() => setShowEndDatePicker(true)} style={{ flex: 2 }}>
                                    {endDate.replace(/-/g, '/')}
                                </button>
                                {!allDay && (
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Color</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        backgroundColor: c,
                                        cursor: 'pointer',
                                        border: color === c ? '2px solid white' : '2px solid transparent',
                                        boxShadow: color === c ? '0 0 0 2px #333' : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{
                                width: '100%',
                                height: '80px',
                                boxSizing: 'border-box',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #3a3a3a',
                                backgroundColor: '#333',
                                color: 'white',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                </div>

                <div className="dialog-buttons" style={{ justifyContent: 'space-between' }}>
                    {event && onDelete ? (
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            style={{ backgroundColor: '#dc2626' }}
                            onClick={() => onDelete(event.id)}
                        >
                            Delete
                        </button>
                    ) : <div></div>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="secondary" onClick={onCancel}>Cancel</button>
                        <button onClick={handleSave}>Save</button>
                    </div>
                </div>
            </div>

            {showStartDatePicker && (
                <CustomDatePicker
                    value={startDate}
                    onChange={(d) => { setStartDate(d); if (d > endDate) setEndDate(d); }}
                    onClose={() => setShowStartDatePicker(false)}
                />
            )}

            {showEndDatePicker && (
                <CustomDatePicker
                    value={endDate}
                    onChange={setEndDate}
                    onClose={() => setShowEndDatePicker(false)}
                />
            )}
        </div>
    );
};

export default CalendarEventDialog;
