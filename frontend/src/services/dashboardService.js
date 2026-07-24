import API from "./api";

export const getDashboardStats = async () => {
  const response = await API.get("/dashboard/stats");
  return response.data;
};

export const getRecentActivities = async () => {
  const response = await API.get("/dashboard/recent-activities");
  return response.data;
};

export const getUpcomingInterviews = async () => {
  const response = await API.get("/dashboard/upcoming-interviews");
  return response.data;
};