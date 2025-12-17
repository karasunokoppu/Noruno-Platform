import { ReadingSession } from "../../types";

interface ProgressChartProps {
    sessions: ReadingSession[];
}

function ProgressChart({ sessions }: ProgressChartProps) {
    // 過去7日間のデータを集計
    const getLast7DaysData = () => {
        const data = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // その日のセッションを合計
            const pagesRead = sessions
                .filter(s => s.session_date.startsWith(dateStr))
                .reduce((sum, s) => sum + s.pages_read, 0);

            data.push({
                date: date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
                pages: pagesRead,
                fullDate: dateStr
            });
        }
        return data;
    };

    const data = getLast7DaysData();
    const maxPages = Math.max(...data.map(d => d.pages), 10); // 最低でも10ページを最大値とする

    return (
        <div className="progress-chart">
            <h4>📊 過去7日間の読書量</h4>
            <div className="chart-container">
                {data.map((d, index) => {
                    const heightPercent = (d.pages / maxPages) * 100;
                    return (
                        <div key={index} className="chart-bar-group">
                            <div className="bar-container">
                                <div
                                    className="chart-bar"
                                    style={{ height: `${heightPercent}%` }}
                                    title={`${d.fullDate}: ${d.pages}ページ`}
                                >
                                    {d.pages > 0 && <span className="bar-value">{d.pages}</span>}
                                </div>
                            </div>
                            <div className="bar-label">{d.date}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ProgressChart;
