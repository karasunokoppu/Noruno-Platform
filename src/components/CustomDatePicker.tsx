import React, { useState } from 'react';

interface CustomDatePickerProps {
    value: string;
    onChange: (date: string) => void;
    onClose: () => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, onClose }) => {
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
    const [selectedDate, setSelectedDate] = useState(value ? value.split(' ')[0] : "");
    const [selectedTime, setSelectedTime] = useState(value && value.includes(' ') ? value.split(' ')[1] : "12:00");

    // Helper to get days in month
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Helper to get day of week for first day (0 = Sunday)
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

    const handleDateClick = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
    };

    const handleOk = () => {
        if (selectedDate) {
            onChange(`${selectedDate} ${selectedTime}`);
        }
        onClose();
    };

    const renderCalendarDays = () => {
        const days = [];
        // Empty slots for days before start of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateClick(day)}
                >
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog date-picker-dialog">
                <div className="calendar-header">
                    <button onClick={handlePrevMonth}>&lt;</button>
                    <h3>{year}/{String(month + 1).padStart(2, '0')}</h3>
                    <button onClick={handleNextMonth}>&gt;</button>
                </div>

                <div className="calendar-weekdays">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>

                <div className="calendar-grid">
                    {renderCalendarDays()}
                </div>

                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <label>Time:</label>
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        style={{ width: 'auto' }}
                    />
                </div>

                <div className="dialog-buttons">
                    <button className="secondary" onClick={onClose}>Cancel</button>
                    <button onClick={handleOk}>OK</button>
                </div>
            </div>
        </div>
    );
};

export default CustomDatePicker;
