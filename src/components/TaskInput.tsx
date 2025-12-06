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

    const inputClass = "p-2.5 rounded-md border border-border-primary bg-bg-tertiary text-text-primary text-sm focus:outline-none focus:border-accent-primary focus:bg-bg-secondary transition-colors";
    const buttonClass = "p-2.5 rounded-md border-none bg-accent-primary text-text-primary text-sm font-bold cursor-pointer transition-colors hover:bg-accent-hover";
    const secondaryButtonClass = "bg-bg-active hover:bg-bg-hover";

    // Small numeric input style
    const numInputClass = "w-[60px] p-1.5 text-center rounded border border-border-primary bg-bg-tertiary text-text-primary text-sm focus:outline-none focus:border-accent-primary";
    const labelClass = "text-[10px] text-text-tertiary text-center block mt-0.5";

    return (
        <div className="bg-bg-secondary p-4 rounded-xl shadow-[0_4px_6px_var(--shadow)] mb-5">
            <div className="flex gap-2.5 mb-2.5">
                <input
                    type="text"
                    placeholder="Task description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`${inputClass} flex-[2]`}
                />
                <button
                    className={`${buttonClass} ${secondaryButtonClass} min-w-[120px] border border-border-primary`}
                    onClick={() => setShowDatePicker(true)}
                >
                    {date ? date.replace(/-/g, '/') : "Select Date"}
                </button>
                <div className="flex-1">
                    <CustomDropdown
                        value={group}
                        onChange={setGroup}
                        options={[
                            { value: "", label: "No Group" },
                            ...existingGroups.map(g => ({ value: g, label: g }))
                        ]}
                        // Passing CSS variable style for now if CustomDropdown needs it, or handled by className if supported?
                        // Assuming CustomDropdown is untouched but accepts style. 
                        style={{ width: '100%' }}
                    />
                </div>
                <button className={buttonClass} onClick={handleSubmit}>Add Task</button>
            </div>

            <div className="flex gap-2.5 mb-2.5">
                <input
                    type="text"
                    placeholder="Details (optional)..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`${inputClass} w-full flex-[3]`}
                />
            </div>

            <div className="flex gap-2.5 mt-2.5 items-center">
                <label className="text-sm text-text-secondary mr-2.5 min-w-fit">Notify before:</label>
                <div className="flex gap-2 max-w-[400px]">
                    <div>
                        <input
                            type="number"
                            placeholder="0"
                            value={notifyDays}
                            onChange={(e) => setNotifyDays(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={numInputClass}
                            min="0"
                        />
                        <small className={labelClass}>Days</small>
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="0"
                            value={notifyHours}
                            onChange={(e) => setNotifyHours(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={numInputClass}
                            min="0"
                            max="23"
                        />
                        <small className={labelClass}>Hours</small>
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="0"
                            value={notifyMinutes}
                            onChange={(e) => setNotifyMinutes(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={numInputClass}
                            min="0"
                            max="59"
                        />
                        <small className={labelClass}>Minutes</small>
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
