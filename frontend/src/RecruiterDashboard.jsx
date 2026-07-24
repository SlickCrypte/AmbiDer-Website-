import "./RecruiterDashboard.css";
import DashboardLayout from "./DashboardLayout";

import ApplicationsChart from "./charts/ApplicationsChart";
import HiringStatusChart from "./charts/HiringStatusChart";

import { useState, useEffect } from "react";

import {
  getDashboardStats
} from "./services/dashboardService";

import { useNavigate } from "react-router-dom";

import {
  FaBriefcase,
  FaUsers,
  FaCalendarAlt,
  FaSearch,
  FaBell,
  FaPlus,
  FaArrowUp,
  FaChartLine,
  FaClipboardList,
  FaEye,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

function RecruiterDashboard() {
  const [search, setSearch] = useState("");

  const navigate = useNavigate();


                // TODO: Replace with API response after backend integration

  const [dashboardStats, setDashboardStats] =
useState(null);

const [loading, setLoading] =
useState(true);
const recentApplications = [];
const stats = [

{
title:"Total Candidates",
value:dashboardStats?.total || 0,
icon:<FaUsers/>,
change:"Registered"
},

{
title:"Applied",
value:dashboardStats?.applied || 0,
icon:<FaClipboardList/>,
change:"Applications"
},

{
title:"Interview",
value:dashboardStats?.interview || 0,
icon:<FaCalendarAlt/>,
change:"Interview Stage"
},

{
title:"Hired",
value:dashboardStats?.hired || 0,
icon:<FaCheckCircle/>,
change:"Selected"
}

];
useEffect(() => {

  const fetchStats = async () => {

    try {

      const data =
        await getDashboardStats();

      setDashboardStats(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  fetchStats();

}, []);

if (loading) {
  return (
    <DashboardLayout role="recruiter">
      <h2>Loading Dashboard...</h2>
    </DashboardLayout>
  );
}  

  return (
    <DashboardLayout role="recruiter">
      <div className="recruiter-page">

        {/* ================= HEADER ================= */}

        <div className="recruiter-dashboard-header">

          <div className="header-left">

            <h1>Recruiter Dashboard</h1>

            <p>
              Manage jobs, candidates, interviews and hiring activities from one
              place.
            </p>

          </div>

          <div className="dashboard-actions">

            <div className="search-bar">

              <FaSearch />

              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

            <button className="notification-btn">

              <FaBell />

            </button>

            <button className="post-job-btn">

              <FaPlus />

              <span>Post Job</span>

            </button>

          </div>

        </div>

        {/* ================= STATS ================= */}

        <div className="recruiter-stats-grid">

          {stats.map((item, index) => (

            <div className="stat-card" key={index}>

              <div className="stat-icon">

                {item.icon}

              </div>

              <div className="stat-content">

                <h2>{item.value}</h2>

                <h4>{item.title}</h4>

                <p>

                  <FaArrowUp />

                  {item.change}

                </p>

              </div>

            </div>

          ))}

        </div>

        {/* ================= MAIN GRID ================= */}

        <div className="recruiter-dashboard-main">

                  {/* ================= LEFT SIDE ================= */}

          <div className="dashboard-left">

            <div className="analytics-section">

              <div className="section-header">

                <h2>

                  <FaChartLine />

                  Hiring Analytics

                </h2>

              </div>

              <div className="analytics-grid">

                <div className="analytics-card">

                  <h3>Applications Received</h3>
<h1>{dashboardStats?.applied || 0}</h1>
<span>Current Applications</span>

                </div>

                <div className="charts-grid">

    <ApplicationsChart />

    <HiringStatusChart />

</div>

                <div className="analytics-card">

                  <h3>Candidates Screened</h3>
<h1>{dashboardStats?.screened || 0}</h1>
<span>Screening Completed</span>

                </div>

                <div className="analytics-card">

                 <h3>Candidates Hired</h3>
<h1>{dashboardStats?.hired || 0}</h1>
<span>Successfully Selected</span>

                </div>

                <div className="analytics-card">

                 <h3>Rejected</h3>
<h1>{dashboardStats?.rejected || 0}</h1>
<span>Rejected Candidates</span>

                </div>

              </div>

            </div>

            {/* ===== Recent Applications ===== */}

            <div className="applications-card">

              <div className="section-header">

                <h2>

                  <FaClipboardList />

                  Recent Applications

                </h2>

              </div>

              {recentApplications.map((candidate) => (

                <div
                  className="candidate-row"
                  key={candidate.id}
                >

                  <div className="candidate-info">

                    <div className="candidate-avatar">

                      {candidate.name.charAt(0)}

                    </div>

                    <div>

                      <h3>

                        {candidate.name}

                      </h3>

                      <p>

                        {candidate.role}

                      </p>

                    </div>

                  </div>

                  <div className="candidate-exp">

                    {candidate.experience}

                  </div>

                  <div
                    className={`candidate-status ${candidate.status.toLowerCase()}`}
                  >

                    {candidate.status === "Shortlisted" && (
                      <FaCheckCircle />
                    )}

                    {candidate.status === "Interview" && (
                      <FaCalendarAlt />
                    )}

                    {candidate.status === "Applied" && (
                      <FaClock />
                    )}

                    {candidate.status === "Reviewing" && (
                      <FaEye />
                    )}

                    <span>

                      {candidate.status}

                    </span>

                  </div>

                  <button className="view-profile-btn">

                    <FaEye />

                    View Profile

                  </button>

                </div>

              ))}

            </div>

          </div>

          {/* ================= RIGHT SIDE ================= */}

          <div className="dashboard-right">

                       <div className="quick-actions-card">

              <div className="section-header">

                <h2>

                  Quick Actions

                </h2>

              </div>

              <button
  className="action-btn"
  onClick={() => navigate("/create-job")}
>

  <FaPlus />

  <span>Create New Job</span>

</button>

  

              <button
  className="action-btn"
  onClick={() => navigate("/interview-management")}
>

  <FaCalendarAlt />

  <span>Schedule Interview</span>

</button>


            </div>

            <div className="interview-card">

              <div className="section-header">

                <h2>

                  Upcoming Interviews

                </h2>

              </div>

              <div className="interview-item">

                <div>

                  <h3>Nishant Yadav</h3>

                  <p>Frontend Developer</p>

                </div>

                <span>10:30 AM</span>

              </div>

              <div className="interview-item">

                <div>

                  <h3>Priya Sharma</h3>

                  <p>UI/UX Designer</p>

                </div>

                <span>01:00 PM</span>

              </div>

              <div className="interview-item">

                <div>

                  <h3>Rahul Verma</h3>

                  <p>Backend Developer</p>

                </div>

                <span>03:30 PM</span>

              </div>

            </div>

            <div className="activity-card">

              <div className="section-header">

                <h2>

                  Recent Activity

                </h2>

              </div>

              <div className="activity-item">

                <div className="activity-dot blue"></div>

                <div>

                  <h4>New Job Posted</h4>

                  <p>Frontend Developer position has been published.</p>

                  <span>20 minutes ago</span>

                </div>

              </div>

              <div className="activity-item">

                <div className="activity-dot green"></div>

                <div>

                  <h4>Candidate Shortlisted</h4>

                  <p>Nishant Yadav moved to Interview Round.</p>

                  <span>1 hour ago</span>

                </div>

              </div>

              <div className="activity-item">

                <div className="activity-dot orange"></div>

                <div>

                  <h4>Interview Scheduled</h4>

                  <p>Interview scheduled with Rahul Verma.</p>

                  <span>Today</span>

                </div>

              </div>

            </div>

            <div className="performance-card">

              <div className="section-header">

                <h2>

                  Recruiter Performance

                </h2>

              </div>

              <h3>Monthly Hiring Target</h3>

              <div className="performance-progress">

                <div
                  className="performance-fill"
                  style={{ width: "78%" }}
                ></div>

              </div>

              <p>78% Completed</p>

              <h3 className="mt-30">

                Average Hiring Time

              </h3>

              <h1>

                12 Days

              </h1>

              <p>

                ↓ 3 days faster than last month

              </p>

            </div>

          </div>

                    {/* ===== Dashboard Footer ===== */}

          <div className="dashboard-footer">

            <div className="footer-card">

              <h3>

                Open Positions

              </h3>

              <h1>

                {dashboardStats?.total || 0}

              </h1>

              <p>

                Across all departments

              </p>

            </div>

            <div className="footer-card">

              <h3>

                Offer Acceptance

              </h3>

              <h1>

               {dashboardStats?.total || 0}

              </h1>

              <p>

                Excellent conversion rate

              </p>

            </div>

            <div className="footer-card">

              <h3>

                Average Experience

              </h3>

              <h1>

                {dashboardStats?.total || 0}

              </h1>

              <p>

                Average candidate experience

              </p>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

}

export default RecruiterDashboard;
