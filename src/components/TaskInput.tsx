import React, { useState } from 'react';
import CustomDatePicker from './CustomDatePicker';
import CustomDropdown from "./CustomDropdown";

interface TaskInputProps {
    onAddTask: (desc: string, date: string, group: string, details: string, notificationMinutes?: number, startDate?: string) => void;
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

        onAddTask(description, date, group, details, totalMinutes > 0 ? totalMinutes : undefined, startDate || undefined);
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
                    onFocus={() => setIsExpanded(true)}
                />
                <button className={buttonClass} onClick={handleSubmit}>Add Task</button>
            </div>

            <div className={`flex flex-col gap-2.5 overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px] opacity-100 mt-2.5" : "max-h-0 opacity-0"}`}>
                <div className="flex gap-2.5">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-text-secondary">Due Date</label>
                        <button
                            className={`${buttonClass} ${secondaryButtonClass} border border-border-primary w-full text-left`}
                            onClick={() => setShowDatePicker(true)}
                        >
                            {date ? date.replace(/-/g, '/') : "Select Due Date"}
                        </button>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-text-secondary">Start Date</label>
                        <button
                            className={`${buttonClass} ${secondaryButtonClass} border border-border-primary w-full text-left`}
                            onClick={() => setShowStartDatePicker(true)}
                        >
                            {startDate ? startDate.replace(/-/g, '/') : "Select Start Date"}
                        </button>
                    </div>
                </div>

                <div className="flex gap-2.5">
                    <div className="flex-1">
                        <CustomDropdown
                            value={group}
                            onChange={setGroup}
                            options={[
                                { value: "", label: "No Group" },
                                ...existingGroups.map(g => ({ value: g, label: g }))
                            ]}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <div className="flex gap-2.5">
                    <input
                        type="text"
                        placeholder="Details (optional)..."
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`${inputClass} w-full`}
                    />
                </div>

                <div className="flex gap-2.5 items-center">
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
