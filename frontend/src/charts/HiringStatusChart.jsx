import "./Charts.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const hiringData = [
  {
    name: "Selected",
    value: 28
  },
  {
    name: "Interview",
    value: 35
  },
  {
    name: "Pending",
    value: 22
  },
  {
    name: "Rejected",
    value: 15
  }
];

const COLORS = [
  "#22c55e",
  "#f59e0b",
  "#3b82f6",
  "#ef4444"
];

function HiringStatusChart() {

  return (

    <div className="chart-card">

      <div className="chart-header">

        <div>

          <h2>

            Hiring Status

          </h2>

          <p>

            Candidate hiring pipeline overview

          </p>

        </div>

      </div>

      <div className="chart-wrapper">

        <ResponsiveContainer
          width="100%"
          height={320}
        >

                  <PieChart>

            <Pie
              data={hiringData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={55}
              paddingAngle={3}
            >

              {hiringData.map((entry, index) => (

                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />

              ))}

            </Pie>

            <Tooltip

              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,.12)"
              }}

            />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "14px"
              }}
            />

                      </PieChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}

export default HiringStatusChart;