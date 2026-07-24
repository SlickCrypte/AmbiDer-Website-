import "./Charts.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const userData = [
  {
    name: "Candidates",
    value: 78
  },
  {
    name: "Recruiters",
    value: 18
  },
  {
    name: "Admins",
    value: 4
  }
];

const COLORS = [
  "#2563eb",
  "#22c55e",
  "#f59e0b"
];

function UserDistributionChart() {

  return (

    <div className="chart-card">

      <div className="chart-header">

        <div>

          <h2>

            User Distribution

          </h2>

          <p>

            Platform users by role

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
              data={userData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={55}
              paddingAngle={3}
            >

              {userData.map((entry, index) => (

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

export default UserDistributionChart;