import "./Charts.css";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const hiringData = [
  {
    month: "Jan",
    hired: 12
  },
  {
    month: "Feb",
    hired: 18
  },
  {
    month: "Mar",
    hired: 26
  },
  {
    month: "Apr",
    hired: 21
  },
  {
    month: "May",
    hired: 33
  },
  {
    month: "Jun",
    hired: 29
  },
  {
    month: "Jul",
    hired: 38
  }
];

function MonthlyHiringChart() {

  return (

    <div className="chart-card">

      <div className="chart-header">

        <div>

          <h2>

            Monthly Hiring

          </h2>

          <p>

            Total successful hires in the last 7 months

          </p>

        </div>

      </div>

      <div className="chart-wrapper">

        <ResponsiveContainer
          width="100%"
          height={320}
        >

                  <BarChart
            data={hiringData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 10
            }}
          >

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748b",
                fontSize: 13
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748b",
                fontSize: 13
              }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,.12)"
              }}
            />

            <Bar
              dataKey="hired"
              fill="#2563eb"
              radius={[8, 8, 0, 0]}
              barSize={38}
            />

                      </BarChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}

export default MonthlyHiringChart;