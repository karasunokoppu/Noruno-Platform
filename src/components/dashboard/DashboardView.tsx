// 統計ダッシュボードコンポーネント

import React, { useMemo } from "react";
import { Task } from "../../App";
import StatsCard from "./StatsCard";
import TaskCompletionChart from "./TaskCompletionChart";

interface ReadingBook {
    id: string;
    title: string;
    status: string;
    reading_sessions: {
        duration_minutes?: number;
        pages_read: number;
    }[];
}

interface DashboardViewProps {
    tasks: Task[];
    readingBooks: ReadingBook[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, readingBooks }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // タスク統計
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // サブタスク統計
        const allSubtasks = tasks.flatMap(t => t.subtasks || []);
        const totalSubtasks = allSubtasks.length;
        const completedSubtasks = allSubtasks.filter(s => s.completed).length;

        // 期限切れタスク
        const overdueTasks = tasks.filter(t => {
            if (t.completed) return false;
            if (!t.due_date) return false;
            const dueDate = new Date(t.due_date.split(' ')[0]);
            return dueDate < today;
        }).length;

        // 今日期限のタスク
        const todayTasks = tasks.filter(t => {
            if (!t.due_date) return false;
            const dueDate = new Date(t.due_date.split(' ')[0]);
            return dueDate.toDateString() === today.toDateString();
        }).length;

        // 読書統計
        const finishedBooks = readingBooks.filter(b => b.status === 'finished').length;
        const readingNow = readingBooks.filter(b => b.status === 'reading').length;

        // 総読書時間（分）
        const totalReadingMinutes = readingBooks.reduce((total, book) => {
            return total + (book.reading_sessions?.reduce((sum, session) => {
                return sum + (session.duration_minutes || 0);
            }, 0) || 0);
        }, 0);
        const totalReadingHours = Math.round(totalReadingMinutes / 60);

        // 総ページ数
        const totalPagesRead = readingBooks.reduce((total, book) => {
            return total + (book.reading_sessions?.reduce((sum, session) => {
                return sum + session.pages_read;
            }, 0) || 0);
        }, 0);

        return {
            totalTasks,
            completedTasks,
            completionRate,
            totalSubtasks,
            completedSubtasks,
            overdueTasks,
            todayTasks,
            finishedBooks,
            readingNow,
            totalReadingHours,
            totalPagesRead,
            totalBooks: readingBooks.length,
        };
    }, [tasks, readingBooks]);

    // 週間完了データを計算
    const weeklyData = useMemo(() => {
        const days = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

            const completed = tasks.filter(t => {
                if (!t.completed) return false;
                if (!t.due_date) return false;
                return t.due_date.startsWith(dateStr);
            }).length;

            days.push({ day: dayName, count: completed, date: dateStr });
        }

        return days;
    }, [tasks]);

    return (
        <div className="dashboard-view">
            <h2>📊 ダッシュボード</h2>

            <div className="stats-grid">
                <StatsCard
                    title="タスク完了率"
                    value={`${stats.completionRate}%`}
                    subtitle={`${stats.completedTasks} / ${stats.totalTasks} タスク`}
                    icon="✅"
                    color="green"
                />
                <StatsCard
                    title="今日の期限"
                    value={stats.todayTasks.toString()}
                    subtitle="タスク"
                    icon="📅"
                    color="blue"
                />
                <StatsCard
                    title="期限切れ"
                    value={stats.overdueTasks.toString()}
                    subtitle="タスク"
                    icon="⚠️"
                    color={stats.overdueTasks > 0 ? "red" : "gray"}
                />
                <StatsCard
                    title="サブタスク"
                    value={`${stats.completedSubtasks}/${stats.totalSubtasks}`}
                    subtitle="完了/合計"
                    icon="📋"
                    color="purple"
                />
            </div>

            <div className="chart-section">
                <h3>週間タスク完了状況</h3>
                <TaskCompletionChart data={weeklyData} />
            </div>

            <h3>📚 読書統計</h3>
            <div className="stats-grid">
                <StatsCard
                    title="読了書籍"
                    value={stats.finishedBooks.toString()}
                    subtitle={`/ ${stats.totalBooks} 冊`}
                    icon="📖"
                    color="green"
                />
                <StatsCard
                    title="読書中"
                    value={stats.readingNow.toString()}
                    subtitle="冊"
                    icon="📚"
                    color="blue"
                />
                <StatsCard
                    title="総読書時間"
                    value={stats.totalReadingHours.toString()}
                    subtitle="時間"
                    icon="⏱️"
                    color="orange"
                />
                <StatsCard
                    title="総ページ数"
                    value={stats.totalPagesRead.toString()}
                    subtitle="ページ"
                    icon="📄"
                    color="purple"
                />
            </div>
        </div>
    );
};

export default DashboardView;
