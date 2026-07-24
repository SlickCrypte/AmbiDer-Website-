import "./AdminDashboard.css";
import DashboardLayout from "./DashboardLayout";

import MonthlyHiringChart from "./charts/MonthlyHiringChart";
import UserDistributionChart from "./charts/UserDistributionChart";

import axios from "axios";
import { useEffect, useState } from "react";

import {
  FaUsers,
  FaUserTie,
  FaBriefcase,
  FaClipboardList,
  FaCalendarAlt,
  FaSearch,
  FaBell,
  FaPlus,
  FaArrowUp,
  FaChartLine,
  FaUserShield,
  FaBuilding
} from "react-icons/fa";

function AdminDashboard() {

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

const [recruiterData, setRecruiterData] = useState({
  name: "",
  email: "",
  phone: "",
  password: ""
});
const [recruiters, setRecruiters] = useState([]);

const [loadingRecruiters, setLoadingRecruiters] = useState(false);

// =========================
// FETCH RECRUITERS
// =========================

const fetchRecruiters = async () => {

  try {

    setLoadingRecruiters(true);

    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5000/api/admin/recruiters",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setRecruiters(res.data.recruiters);

  } catch (err) {

    console.error(err);

  } finally {

    setLoadingRecruiters(false);

  }

};

// =======================
// Load recruiters automatically
// =======================

useEffect(() => {

  fetchRecruiters();

}, []);

const stats = [

    {
      title: "Candidates",
      value: "2,486",
      icon: <FaUsers />,
      change: "+124 this month"
    },

    {
      title: "Recruiters",
      value: "148",
      icon: <FaUserTie />,
      change: "+8 this week"
    },

    {
      title: "Active Jobs",
      value: "362",
      icon: <FaBriefcase />,
      change: "+16 today"
    },

    {
      title: "Applications",
      value: "9,814",
      icon: <FaClipboardList />,
      change: "+214 today"
    }

  ];

  const recentUsers = [

    {
      name: "Nishant Yadav",
      role: "Candidate",
      company: "AmbiDer",
      status: "Active"
    },

    {
      name: "Priya Sharma",
      role: "Recruiter",
      company: "Infosys",
      status: "Active"
    },

    {
      name: "Rahul Verma",
      role: "Candidate",
      company: "TCS",
      status: "Pending"
    },

    {
      name: "Aman Singh",
      role: "Recruiter",
      company: "Google",
      status: "Verified"
    }

  ];
  const handleChange = (e) => {
  setRecruiterData({
    ...recruiterData,
    [e.target.name]: e.target.value
  });
};

const createRecruiter = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/admin/recruiters",
      recruiterData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Recruiter Created Successfully");

    setRecruiterData({
      name: "",
      email: "",
      phone: "",
      password: ""
    });

    setShowModal(false);

  } catch (err) {
    alert(err.response?.data?.message || "Failed to create recruiter");
  }
};

  return (

    <DashboardLayout role="admin">

      <div className="admin-page">

        <div className="admin-header">

          <div>

            <h1>

              Admin Dashboard

            </h1>

            <p>

              Monitor platform performance, recruiters, candidates and overall hiring activities.

            </p>

          </div>

          <div className="admin-actions">

            <div className="admin-search">

              <FaSearch />

              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

            <button className="admin-notification">

              <FaBell />

            </button>

            <button
  className="admin-add-btn"
  onClick={() => setShowModal(true)}
>

              <FaPlus />

              Add Recruiter

            </button>

          </div>

        </div>

        <div className="admin-stats">

          {stats.map((item, index) => (

            <div
              className="admin-stat-card"
              key={index}
            >

              <div className="admin-stat-icon">

                {item.icon}

              </div>

              <div className="admin-stat-content">

                <h2>

                  {item.value}

                </h2>

                <h4>

                  {item.title}

                </h4>

                <p>

                  <FaArrowUp />

                  {item.change}

                </p>

              </div>

            </div>

          ))}

        </div>

        <div className="admin-main">

          <div className="admin-analytics">

            <div className="section-header">

              <h2>

                <FaChartLine />

                Platform Analytics

              </h2>

            </div>

            <div className="admin-analytics-grid">

              <div className="admin-analytics-card">

                <h3>

                  Total Registrations

                </h3>

                <h1>

                  12,548

                </h1>

                <span>

                  +21% this month

                </span>

              </div>

              <div className="admin-analytics-card">

                <h3>

                  Hiring Success

                </h3>

                <h1>

                  89%

                </h1>

                <span>

                  Excellent Performance

                </span>

              </div>

              <div className="admin-analytics-card">

                <h3>

                  Companies

                </h3>

                <h1>

                  214

                </h1>

                <span>

                  Registered Companies

                </span>

              </div>

              <div className="admin-analytics-card">

                <h3>

                  Interviews

                </h3>

                <h1>

                  684

                </h1>

                <span>

                  Scheduled this month

                </span>

              </div>

              <div className="charts-grid">

  <MonthlyHiringChart />

  <UserDistributionChart />

</div>

            </div>

          </div>

                    <div className="admin-quick-actions">

            <div className="section-header">

              <h2>Quick Actions</h2>

            </div>

            <button className="admin-action-btn">

              <FaPlus />

              Add Recruiter

            </button>

            <button className="admin-action-btn">

              <FaUsers />

              Manage Candidates

            </button>

            <button className="admin-action-btn">

              <FaBriefcase />

              Manage Jobs

            </button>

            <button className="admin-action-btn">

              <FaCalendarAlt />

              View Interviews

            </button>

          </div>

        </div>

        <div className="admin-users-section">

          <div className="section-header">

            <h2>Recent Users</h2>

          </div>

          <div className="admin-users-list">

            {recentUsers.map((user, index) => (

              <div
                className="admin-user-card"
                key={index}
              >

                <div className="admin-user-left">

                  <div className="admin-user-avatar">

                    {user.name.charAt(0)}

                  </div>

                  <div>

                    <h3>{user.name}</h3>

                    <p>{user.role}</p>

                  </div>

                </div>

                <div className="admin-user-company">

                  <FaBuilding />

                  {user.company}

                </div>

                <div
                  className={`admin-user-status ${user.status.toLowerCase()}`}
                >

                  {user.status}

                </div>

                <button className="admin-view-btn">

                  <FaUserShield />

                  View

                </button>

              </div>

            ))}

          </div>

        </div>

                <div className="admin-insights">

          <div className="admin-activity">

            <div className="section-header">

              <h2>Platform Activity</h2>

            </div>

            <div className="admin-activity-card">

              <div className="admin-dot blue"></div>

              <div>

                <h4>New Recruiter Registered</h4>

                <p>Infosys HR Team joined the platform.</p>

                <span>20 minutes ago</span>

              </div>

            </div>

            <div className="admin-activity-card">

              <div className="admin-dot green"></div>

              <div>

                <h4>Job Published</h4>

                <p>Google posted a Software Engineer position.</p>

                <span>1 hour ago</span>

              </div>

            </div>

            <div className="admin-activity-card">

              <div className="admin-dot orange"></div>

              <div>

                <h4>Candidate Hired</h4>

                <p>Frontend Developer position successfully closed.</p>

                <span>Today</span>

              </div>

            </div>

            <div className="admin-activity-card">

              <div className="admin-dot red"></div>

              <div>

                <h4>System Backup Completed</h4>

                <p>Nightly database backup completed successfully.</p>

                <span>Yesterday</span>

              </div>

            </div>

          </div>

          <div className="admin-performance">

            <div className="section-header">

              <h2>System Health</h2>

            </div>

            <div className="admin-performance-card">

              <h3>Server Uptime</h3>

              <div className="admin-progress">

                <div
                  className="admin-progress-fill"
                  style={{ width: "99%" }}
                ></div>

              </div>

              <p>99% Uptime</p>

            </div>

            <div className="admin-performance-card">

              <h3>Database Health</h3>

              <h1>Healthy</h1>

              <p>All services running normally</p>

            </div>

            <div className="admin-performance-card">

              <h3>Storage Usage</h3>

              <h1>68%</h1>

              <p>Within safe limits</p>

            </div>

          </div>

        </div>

              </div>
              
              
{showModal && (
  <div className="modal-overlay">

    <div className="recruiter-modal">

      <h2>Create Recruiter</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={recruiterData.name}
        onChange={(e) =>
          setRecruiterData({
            ...recruiterData,
            name: e.target.value,
          })
        }
      />

      <input
        type="email"
        placeholder="Email"
        value={recruiterData.email}
        onChange={(e) =>
          setRecruiterData({
            ...recruiterData,
            email: e.target.value,
          })
        }
      />

      <input
        type="text"
        placeholder="Phone"
        value={recruiterData.phone}
        onChange={(e) =>
          setRecruiterData({
            ...recruiterData,
            phone: e.target.value,
          })
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={recruiterData.password}
        onChange={(e) =>
          setRecruiterData({
            ...recruiterData,
            password: e.target.value,
          })
        }
      />

      <div className="modal-buttons">

       <button
  className="save-btn"
  onClick={createRecruiter}
>
  Create Recruiter
</button>

        <button
          className="cancel-btn"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}              
    </DashboardLayout>

  );

}

export default AdminDashboard;