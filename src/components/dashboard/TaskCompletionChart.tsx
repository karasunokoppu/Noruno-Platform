// 週間タスク完了チャートコンポーネント

import React from "react";

interface ChartData {
  day: string;
  count: number;
  date: string;
}

interface TaskCompletionChartProps {
  data: ChartData[];
}

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="task-completion-chart">
      <div className="chart-bars">
        {data.map((item, index) => (
          <div key={index} className="chart-bar-container">
            <div className="chart-bar-wrapper">
              <div
                className="chart-bar"
                style={{ height: `${(item.count / maxCount) * 100}%` }}
              >
                {item.count > 0 && (
                  <span className="chart-bar-value">{item.count}</span>
                )}
              </div>
            </div>
            <div className="chart-bar-label">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskCompletionChart;
