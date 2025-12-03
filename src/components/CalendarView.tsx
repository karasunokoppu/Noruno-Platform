import React, { useState } from 'react';
import { Task } from '../App';
import CustomDropdown from './CustomDropdown';

interface CalendarViewProps {
    tasks: Task[];
    groups: string[];
    onEdit: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, groups, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedGroup, setSelectedGroup] = useState<string>("");

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

    const renderCalendarDays = () => {
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-view-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => {
                const dateMatch = t.due_date.startsWith(dateStr);
                const groupMatch = selectedGroup === "" || t.group === selectedGroup;
                return dateMatch && groupMatch;
            });
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <div key={day} className={`calendar-view-day ${isToday ? 'today' : ''}`}>
                    <div className="day-number">{day}</div>
                    <div className="day-tasks">
                        {dayTasks.map(task => (
                            <div
                                key={task.id}
                                className={`day-task-item ${task.completed ? 'completed' : ''}`}
                                onClick={() => onEdit(task)}
                                title={task.description}
                            >
                                {task.description}
                            </div>
                        ))}
                    </div>
                </div>
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
                    <button onClick={handleToday} className="today-btn">Today</button>
                    <button onClick={handleToday} className="today-btn">Today</button>
                    <div style={{ width: '150px', marginLeft: '10px' }}>
                        <CustomDropdown
                            value={selectedGroup}
                            onChange={setSelectedGroup}
                            options={[
                                { value: "", label: "All Groups" },
                                ...groups.map(g => ({ value: g, label: g }))
                            ]}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
                <h2>{year}/{String(month + 1).padStart(2, '0')}</h2>
            </div>

            <div className="calendar-weekdays">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div className="calendar-view-grid">
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default CalendarView;
