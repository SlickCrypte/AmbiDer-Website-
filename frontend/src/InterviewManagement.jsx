import "./InterviewManagement.css";
import DashboardLayout from "./DashboardLayout";

import { useState } from "react";

import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaMapMarkerAlt,
  FaUserTie,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf
} from "react-icons/fa";

function InterviewManagement() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const interviews = [

    {
      id: 1,
      candidate: "Nishant Yadav",
      role: "Frontend Developer",
      interviewer: "Rahul Sharma",
      date: "15 July 2026",
      time: "10:30 AM",
      mode: "Online",
      location: "Google Meet",
      status: "Upcoming"
    },

    {
      id: 2,
      candidate: "Priya Sharma",
      role: "UI/UX Designer",
      interviewer: "Aman Verma",
      date: "15 July 2026",
      time: "02:00 PM",
      mode: "Offline",
      location: "Gurugram Office",
      status: "Today"
    },

    {
      id: 3,
      candidate: "Rahul Verma",
      role: "Backend Developer",
      interviewer: "Vikas Mehta",
      date: "12 July 2026",
      time: "11:00 AM",
      mode: "Online",
      location: "Microsoft Teams",
      status: "Completed"
    },

    {
      id: 4,
      candidate: "Aman Singh",
      role: "Full Stack Developer",
      interviewer: "Sneha Kapoor",
      date: "11 July 2026",
      time: "04:00 PM",
      mode: "Offline",
      location: "Noida Office",
      status: "Cancelled"
    }

  ];

  const filteredInterviews = interviews.filter((item) => {

    const matchesSearch =
      item.candidate.toLowerCase().includes(search.toLowerCase()) ||
      item.role.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || item.status === filter;

    return matchesSearch && matchesFilter;

  });

  return (

    <DashboardLayout role="recruiter">

      <div className="interview-page">

        <div className="interview-header">

          <div>

            <h1>Interview Management</h1>

            <p>
              Schedule, monitor and manage candidate interviews efficiently.
            </p>

          </div>

          <button className="interview-header-btn">

            <FaCalendarAlt />

            Schedule Interview

          </button>

        </div>

        <div className="interview-toolbar">

          <div className="interview-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="interview-filters">

            <button
              className={filter === "All" ? "active" : ""}
              onClick={() => setFilter("All")}
            >
              All
            </button>

            <button
              className={filter === "Today" ? "active" : ""}
              onClick={() => setFilter("Today")}
            >
              Today
            </button>

            <button
              className={filter === "Upcoming" ? "active" : ""}
              onClick={() => setFilter("Upcoming")}
            >
              Upcoming
            </button>

            <button
              className={filter === "Completed" ? "active" : ""}
              onClick={() => setFilter("Completed")}
            >
              Completed
            </button>

            <button
              className={filter === "Cancelled" ? "active" : ""}
              onClick={() => setFilter("Cancelled")}
            >
              Cancelled
            </button>

            <button>

              <FaFilter />

              More Filters

            </button>

          </div>

        </div>

        <div className="interview-grid">

          {filteredInterviews.map((item) => (

            <div
              className="interview-card"
              key={item.id}
            >

              <div className="interview-card-header">

                <div>

                  <h2>{item.candidate}</h2>

                  <h3>{item.role}</h3>

                </div>

                <span
                  className={`interview-status ${item.status.toLowerCase()}`}
                >
                  {item.status}
                </span>

              </div>

                            <div className="interview-meta">

                <span>

                  <FaCalendarAlt />

                  {item.date}

                </span>

                <span>

                  <FaClock />

                  {item.time}

                </span>

                <span>

                  <FaUserTie />

                  {item.interviewer}

                </span>

              </div>

              <div className="interview-details">

                <div className="interview-detail">

                  <FaVideo />

                  <div>

                    <h4>Mode</h4>

                    <p>{item.mode}</p>

                  </div>

                </div>

                <div className="interview-detail">

                  <FaMapMarkerAlt />

                  <div>

                    <h4>Location</h4>

                    <p>{item.location}</p>

                  </div>

                </div>

              </div>

              <div className="interview-actions">

                <button className="interview-view-btn">

                  <FaUsers />

                  View Candidate

                </button>

                <button className="interview-join-btn">

                  <FaVideo />

                  Join

                </button>

              </div>

              <div className="interview-actions">

                <button className="interview-reschedule-btn">

                  <FaCalendarAlt />

                  Reschedule

                </button>

                <button className="interview-cancel-btn">

                  <FaTimesCircle />

                  Cancel

                </button>

              </div>

            </div>

          ))}

        </div>

                {filteredInterviews.length === 0 && (

          <div className="interview-empty">

            <FaSearch className="interview-empty-icon" />

            <h2>No Interviews Found</h2>

            <p>
              No interviews match your current search or selected filters.
            </p>

            <button
              className="interview-reset-btn"
              onClick={() => {
                setSearch("");
                setFilter("All");
              }}
            >
              Reset Filters
            </button>

          </div>

        )}

        <div className="interview-summary">

          <div className="interview-summary-card">

            <h3>Total Interviews</h3>

            <h2>{interviews.length}</h2>

            <p>Scheduled interviews</p>

          </div>

          <div className="interview-summary-card">

            <h3>Today's Interviews</h3>

            <h2>
              {
                interviews.filter(
                  (item) => item.status === "Today"
                ).length
              }
            </h2>

            <p>Scheduled for today</p>

          </div>

          <div className="interview-summary-card">

            <h3>Upcoming</h3>

            <h2>
              {
                interviews.filter(
                  (item) => item.status === "Upcoming"
                ).length
              }
            </h2>

            <p>Upcoming interviews</p>

          </div>

          <div className="interview-summary-card">

            <h3>Completed</h3>

            <h2>
              {
                interviews.filter(
                  (item) => item.status === "Completed"
                ).length
              }
            </h2>

            <p>Successfully completed</p>

          </div>

        </div>

        <div className="interview-insights">

          <div className="interview-activity">

            <h2>Recent Activity</h2>

            <div className="interview-activity-card">

              <div className="interview-dot blue"></div>

              <div>

                <h4>Interview Scheduled</h4>

                <p>Frontend Developer interview created.</p>

                <span>15 minutes ago</span>

              </div>

            </div>

            <div className="interview-activity-card">

              <div className="interview-dot green"></div>

              <div>

                <h4>Interview Completed</h4>

                <p>Rahul Verma completed Technical Round.</p>

                <span>Today</span>

              </div>

            </div>

            <div className="interview-activity-card">

              <div className="interview-dot orange"></div>

              <div>

                <h4>Interview Rescheduled</h4>

                <p>Priya Sharma interview moved to tomorrow.</p>

                <span>Yesterday</span>

              </div>

            </div>

          </div>

          <div className="interview-performance">

            <h2>Interview Statistics</h2>

            <div className="interview-performance-card">

              <h3>Completion Rate</h3>

              <div className="interview-progress">

                <div
                  className="interview-progress-fill"
                  style={{ width: "84%" }}
                ></div>

              </div>

              <p>84% Completed</p>

            </div>

            <div className="interview-performance-card">

              <h3>Average Interview Duration</h3>

              <h1>45 Min</h1>

              <p>Average per candidate</p>

            </div>

          </div>

        </div>

              </div>

    </DashboardLayout>

  );

}

export default InterviewManagement;