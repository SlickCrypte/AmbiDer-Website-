import API from "./api";
import {
  FaFileAlt,
  FaCalendarCheck,
  FaUserCheck,
  FaTimesCircle,
  FaBriefcase,
  FaChartLine,
} from "react-icons/fa";
export const getDashboardStats = async () => {
  const response = await API.get("/dashboard/stats");

  const data = response.data;

  return [
    {
      title: "Total Applications",
      count: data.total,
      status: "Applications",
      route: "/my-applications",
      icon: <FaFileAlt />,
    },
    {
      title: "Applied",
      count: data.applied,
      status: "Applied Jobs",
      route: "/my-applications",
      icon: <FaBriefcase />,
    },
    {
      title: "Interview",
      count: data.interview,
      status: "Upcoming Interviews",
      route: "/interviews",
      icon: <FaCalendarCheck />,
    },
    {
      title: "Hired",
      count: data.hired,
      status: "Selected",
      route: "/my-applications",
      icon: <FaUserCheck />,
    },
    {
      title: "Rejected",
      count: data.rejected,
      status: "Rejected",
      route: "/my-applications",
      icon: <FaTimesCircle />,
    },
    {
      title: "Screened",
      count: data.screened,
      status: "Shortlisted",
      route: "/my-applications",
      icon: <FaChartLine />,
    },
  ];
};

// Temporary dummy data
export const getRecentActivities = async () => {
  return [
    {
      title: "Application Submitted",
      company: "AmbiDer Technologies",
      status: "Applied",
      date: "Today",
    },
  ];
};

export const getUpcomingInterviews = async () => {
  return [
    {
      company: "No Interviews Scheduled",
      role: "-",
      date: "-",
      time: "-",
    },
  ];
};