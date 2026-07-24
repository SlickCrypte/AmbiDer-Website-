import API from "./api";

export const getDashboardStats = async () => {
  const response = await API.get("/dashboard/stats");
  return response.data;
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