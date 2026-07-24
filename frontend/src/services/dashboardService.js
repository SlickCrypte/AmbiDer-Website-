import API from "./api";

export const getDashboardStats = async () => {
  const response = await API.get("/dashboard/stats");

  const d = response.data;

  return [
    {
      title: "Total Applications",
      count: d.total,
      status: "Applications",
      route: "/my-applications",
      icon: null,
    },
    {
      title: "Applied",
      count: d.applied,
      status: "Applied Jobs",
      route: "/my-applications",
      icon: null,
    },
    {
      title: "Interview",
      count: d.interview,
      status: "Interviews",
      route: "/interviews",
      icon: null,
    },
    {
      title: "Hired",
      count: d.hired,
      status: "Selected",
      route: "/my-applications",
      icon: null,
    },
    {
      title: "Rejected",
      count: d.rejected,
      status: "Rejected",
      route: "/my-applications",
      icon: null,
    },
    {
      title: "Screened",
      count: d.screened,
      status: "Shortlisted",
      route: "/my-applications",
      icon: null,
    },
  ];
};