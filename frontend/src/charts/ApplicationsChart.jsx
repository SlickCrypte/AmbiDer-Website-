import "./Charts.css";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const applicationData = [
  {
    month: "Jan",
    applications: 42
  },
  {
    month: "Feb",
    applications: 58
  },
  {
    month: "Mar",
    applications: 76
  },
  {
    month: "Apr",
    applications: 92
  },
  {
    month: "May",
    applications: 108
  },
  {
    month: "Jun",
    applications: 126
  },
  {
    month: "Jul",
    applications: 149
  }
];

function ApplicationsChart() {

  return (

    <div className="chart-card">

      <div className="chart-header">

        <div>

          <h2>

            Applications Trend

          </h2>

          <p>

            Applications received over the last 7 months

          </p>

        </div>

      </div>

      <div className="chart-wrapper">

        <ResponsiveContainer
          width="100%"
          height={320}
        >

                  <LineChart
            data={applicationData}
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
              tick={{
                fill: "#64748b",
                fontSize: 13
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: "#64748b",
                fontSize: 13
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,.12)"
              }}
            />

                        <Line
              type="monotone"
              dataKey="applications"
              stroke="#2563eb"
              strokeWidth={4}
              dot={{
                r: 5,
                fill: "#2563eb",
                stroke: "#ffffff",
                strokeWidth: 2
              }}
              activeDot={{
                r: 8
              }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}

export default ApplicationsChart;