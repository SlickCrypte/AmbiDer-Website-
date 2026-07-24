import "./Dashboard.css";
import DashboardLayout from "./DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getDashboardStats,
  getRecentActivities,
  getUpcomingInterviews,
} from "./services/dashboardService";

import {
  FaFileAlt,
  FaCalendarCheck,
  FaUserCheck,
  FaArrowRight,
  FaUserCircle,
  FaBriefcase,
  FaBell,
  FaChartLine
} from "react-icons/fa";

function Dashboard() {

const navigate = useNavigate();

const [stats, setStats] = useState([]);
const [recentActivity, setRecentActivity] = useState([]);
const [upcomingInterviews, setUpcomingInterviews] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadDashboard = async () => {
    try {
      const statsData = await getDashboardStats();
      const activityData = await getRecentActivities();
      const interviewData = await getUpcomingInterviews();

      setStats(statsData || []);
      setRecentActivity(activityData || []);
      setUpcomingInterviews(interviewData || []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);

const openPage=(route,message)=>{

toast.success(message);

navigate(route);

};

if (loading) {
  return (
    <DashboardLayout role="candidate">
      <div className="loading-container">
        <h2>Loading Dashboard...</h2>
      </div>
    </DashboardLayout>
  );
}

return(

<DashboardLayout role="candidate">

<div className="dashboard-page">

<div className="dashboard-header">

<div>

<h1>

Candidate Dashboard

</h1>

<p>

Welcome back. Here's an overview of your job search journey.

</p>

</div>

<div className="profile-summary">

<FaUserCircle className="profile-icon"/>

<div>

<h3>

Nishant Yadav

</h3>

<span>

Frontend Developer

</span>

</div>

</div>

</div>

<div className="stats-grid">

{stats.map((item,index)=>(

<div

className="stats-card"

key={index}

onClick={()=>openPage(item.route,item.title)}

>

<div className="stats-top">

<div className="stats-icon">

{item.icon}

</div>

<FaArrowRight className="arrow-icon"/>

</div>

<h2>

{item.count}

</h2>

<h4>

{item.title}

</h4>

<p>

{item.status}

</p>

</div>

))}

</div>

<div className="dashboard-sections">

<div className="left-panel">

<div className="section-card">

<div className="section-title">

<h2>

Recent Activity

</h2>

<FaChartLine/>

</div>

{recentActivity.map((item,index)=>(

<div
className="activity-card"
key={index}
>

<div>

<h3>

{item.title}

</h3>

<p>

{item.company}

</p>

</div>

<div className="activity-right">

<span>

{item.status}

</span>

<small>

{item.date}

</small>

</div>

</div>

))}

</div>

<div className="section-card">

<div className="section-title">

<h2>

Quick Actions

</h2>

</div>

<div className="quick-actions">

<button
onClick={()=>openPage("/resume","Resume Upload")}
>

Upload Resume

</button>

<button
onClick={()=>openPage("/jobs","Available Jobs")}
>

Browse Jobs

</button>

<button
onClick={()=>openPage("/candidate-profile","Profile")}
>

Update Profile

</button>

<button
onClick={()=>openPage("/my-applications","Applications")}
>

View Applications

</button>

</div>

</div>

</div>

<div className="right-panel">

<div className="section-card">

<div className="section-title">

<h2>

Upcoming Interviews

</h2>

</div>

{upcomingInterviews.map((item,index)=>(

<div
className="interview-card"
key={index}
>

<h3>

{item.company}

</h3>

<p>

{item.role}

</p>

<div className="interview-info">

<span>

📅 {item.date}

</span>

<span>

🕒 {item.time}

</span>

</div>

</div>

))}

</div>

<div className="section-card">

<div className="section-title">

<h2>

Profile Completion

</h2>

</div>

<div className="progress-box">

<div className="progress-header">

<span>

80% Completed

</span>

<span>

4/5 Sections

</span>

</div>

<div className="progress-bar">

<div
className="progress-fill"
style={{width:"80%"}}
>

</div>

</div>

<p>

Complete your profile to improve job matching and recruiter visibility.

</p>

<button
className="complete-profile-btn"
onClick={()=>openPage("/candidate-profile","Profile")}
>

Complete Profile

</button>

</div>

</div>

</div>

</div>

</div>

</DashboardLayout>

);

}

export default Dashboard;