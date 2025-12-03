import React, { useState } from 'react';
import CustomDatePicker from './CustomDatePicker';
import CustomDropdown from "./CustomDropdown";

interface TaskInputProps {
    onAddTask: (desc: string, date: string, group: string, details: string, notificationMinutes?: number) => void;
    existingGroups: string[];
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask, existingGroups }) => {
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [group, setGroup] = useState("");
    const [details, setDetails] = useState("");
    const [notifyDays, setNotifyDays] = useState<string>("");
    const [notifyHours, setNotifyHours] = useState<string>("");
    const [notifyMinutes, setNotifyMinutes] = useState<string>("");
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSubmit = () => {
        if (!description.trim()) return;

        // Convert days/hours/minutes to total minutes
        const totalMinutes =
            (parseInt(notifyDays) || 0) * 1440 +
            (parseInt(notifyHours) || 0) * 60 +
            (parseInt(notifyMinutes) || 0);

        onAddTask(description, date, group, details, totalMinutes > 0 ? totalMinutes : undefined);
        setDescription("");
        setDate("");
        setGroup("");
        setDetails("");
        setNotifyDays("");
        setNotifyHours("");
        setNotifyMinutes("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="task-input">
            <div className="input-row">
                <input
                    type="text"
                    placeholder="Task description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ flex: 2 }}
                />
                <button
                    className="secondary"
                    onClick={() => setShowDatePicker(true)}
                    style={{ minWidth: "120px" }}
                >
                    {date ? date.replace(/-/g, '/') : "Select Date"}
                </button>
                <CustomDropdown
                    value={group}
                    onChange={setGroup}
                    options={[
                        { value: "", label: "No Group" },
                        ...existingGroups.map(g => ({ value: g, label: g }))
                    ]}
                    style={{ flex: 1 }}
                />
                <button onClick={handleSubmit}>Add Task</button>
            </div>
            <div className="input-row">
                <input
                    type="text"
                    placeholder="Details (optional)..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{ width: "100%", flex: 3 }}
                />
            </div>
            <div className="input-row" style={{ marginTop: '10px' }}>
                <label style={{ fontSize: '14px', color: 'var(--text-secondary)', marginRight: '10px', minWidth: 'fit-content' }}>Notify before:</label>
                <div style={{ display: 'flex', gap: '8px', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <input
                            type="number"
                            placeholder="0"
                            value={notifyDays}
                            onChange={(e) => setNotifyDays(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ width: '60px', padding: '6px', textAlign: 'center' }}
                            min="0"
                        />
                        <small style={{ fontSize: '10px', color: '#888', textAlign: 'center' }}>Days</small>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <input
                            type="number"
                            placeholder="0"
                            value={notifyHours}
                            onChange={(e) => setNotifyHours(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ width: '60px', padding: '6px', textAlign: 'center' }}
                            min="0"
                            max="23"
                        />
                        <small style={{ fontSize: '10px', color: '#888', textAlign: 'center' }}>Hours</small>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <input
                            type="number"
                            placeholder="0"
                            value={notifyMinutes}
                            onChange={(e) => setNotifyMinutes(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ width: '60px', padding: '6px', textAlign: 'center' }}
                            min="0"
                            max="59"
                        />
                        <small style={{ fontSize: '10px', color: '#888', textAlign: 'center' }}>Minutes</small>
                    </div>
                </div>
            </div>

            {showDatePicker && (
                <CustomDatePicker
                    value={date}
                    onChange={setDate}
                    onClose={() => setShowDatePicker(false)}
                />
            )}
        </div>
    );
};

export default TaskInput;
