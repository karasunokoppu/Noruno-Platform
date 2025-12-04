// 統計カードコンポーネント

import React from "react";

interface StatsCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: "green" | "blue" | "red" | "orange" | "purple" | "gray";
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, color }) => {
    return (
        <div className={`stats-card stats-card-${color}`}>
            <div className="stats-card-icon">{icon}</div>
            <div className="stats-card-content">
                <div className="stats-card-title">{title}</div>
                <div className="stats-card-value">{value}</div>
                <div className="stats-card-subtitle">{subtitle}</div>
            </div>
        </div>
    );
};

export default StatsCard;
