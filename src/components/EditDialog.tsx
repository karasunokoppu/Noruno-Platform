import React, { useState } from 'react';
import { Task } from '../App';
import CustomDatePicker from './CustomDatePicker';
import CustomDropdown from './CustomDropdown';

interface EditDialogProps {
    task: Task;
    existingGroups: string[];
    allTasks?: Task[]; // Make optional to avoid breaking if not passed immediately, but we passed it
    onSave: (task: Task) => void;
    onCancel: () => void;
}

const EditDialog: React.FC<EditDialogProps> = ({ task, existingGroups, allTasks = [], onSave, onCancel }) => {
    const [description, setDescription] = useState(task.description);
    const [date, setDate] = useState(task.due_date);
    const [startDate, setStartDate] = useState(task.start_date || "");
    const [group, setGroup] = useState(task.group);
    const [details, setDetails] = useState(task.details);
    const [dependencies, setDependencies] = useState<number[]>(task.dependencies || []);

    // Convert task notification_minutes to days/hours/minutes for display
    const totalMinutes = task.notification_minutes || 0;
    const [notifyDays, setNotifyDays] = useState<string>(Math.floor(totalMinutes / 1440).toString());
    const [notifyHours, setNotifyHours] = useState<string>(Math.floor((totalMinutes % 1440) / 60).toString());
    const [notifyMinutes, setNotifyMinutes] = useState<string>((totalMinutes % 60).toString());

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);

    const handleSave = () => {
        // Convert days/hours/minutes to total minutes
        const calculatedMinutes =
            (parseInt(notifyDays) || 0) * 1440 +
            (parseInt(notifyHours) || 0) * 60 +
            (parseInt(notifyMinutes) || 0);

        onSave({
            ...task,
            description,
            due_date: date,
            start_date: startDate || undefined,
            group,
            details,
            notification_minutes: calculatedMinutes > 0 ? calculatedMinutes : undefined,
            dependencies: dependencies.length > 0 ? dependencies : undefined,
        });
    };

    const toggleDependency = (targetId: number) => {
        setDependencies(prev => {
            if (prev.includes(targetId)) {
                return prev.filter(id => id !== targetId);
            } else {
                return [...prev, targetId];
            }
        });
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h2>Edit Task</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Start Date</label>
                            <button
                                className="secondary"
                                onClick={() => setShowStartDatePicker(true)}
                                style={{ width: '100%', textAlign: 'left' }}
                            >
                                {startDate ? startDate.replace(/-/g, '/') : "Select Start Date"}
                            </button>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Due Date</label>
                            <button
                                className="secondary"
                                onClick={() => setShowDatePicker(true)}
                                style={{ width: '100%', textAlign: 'left' }}
                            >
                                {date ? date.replace(/-/g, '/') : "Select Date"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Group</label>
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

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Details</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            style={{
                                width: '100%',
                                height: '100px',
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

                    {/* Dependencies Section */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Dependencies (Predecessors)</label>
                        <div style={{
                            maxHeight: '100px',
                            overflowY: 'auto',
                            border: '1px solid #3a3a3a',
                            borderRadius: '6px',
                            padding: '5px',
                            backgroundColor: '#2a2a2a'
                        }}>
                            {allTasks
                                .filter(t => t.id !== task.id) // Exclude self
                                .map(t => (
                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
                                        <input
                                            type="checkbox"
                                            checked={dependencies.includes(t.id)}
                                            onChange={() => toggleDependency(t.id)}
                                            style={{ marginRight: '8px' }}
                                        />
                                        <span style={{ fontSize: '12px', color: '#ddd' }}>{t.description}</span>
                                    </div>
                                ))
                            }
                            {allTasks.length <= 1 && <div style={{ fontSize: '12px', color: '#666', padding: '5px' }}>No other tasks available</div>}
                        </div>
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#aaa' }}>Notify before (optional)</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="number"
                                value={notifyDays}
                                onChange={(e) => setNotifyDays(e.target.value)}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                                min="0"
                            />
                            <small style={{ display: 'block', marginTop: '2px', color: '#888' }}>Days</small>
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="number"
                                value={notifyHours}
                                onChange={(e) => setNotifyHours(e.target.value)}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                                min="0"
                                max="23"
                            />
                            <small style={{ display: 'block', marginTop: '2px', color: '#888' }}>Hours</small>
                        </div>
                        <div style={{ flex: 1 }}>
                            <input
                                type="number"
                                value={notifyMinutes}
                                onChange={(e) => setNotifyMinutes(e.target.value)}
                                style={{ width: '100%', boxSizing: 'border-box' }}
                                min="0"
                                max="59"
                            />
                            <small style={{ display: 'block', marginTop: '2px', color: '#888' }}>Minutes</small>
                        </div>
                    </div>
                </div>
                <div className="dialog-buttons">
                    <button className="secondary" onClick={onCancel}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>

            {
                showDatePicker && (
                    <CustomDatePicker
                        value={date}
                        onChange={setDate}
                        onClose={() => setShowDatePicker(false)}
                    />
                )
            }
            {
                showStartDatePicker && (
                    <CustomDatePicker
                        value={startDate}
                        onChange={setStartDate}
                        onClose={() => setShowStartDatePicker(false)}
                    />
                )
            }
        </div >
    );
};

export default EditDialog;
