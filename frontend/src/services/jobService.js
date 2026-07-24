import API from "./api";

export const getAllJobs = async () => {
  try {
    const response = await API.get("/jobs");
    return response.data;
  } catch (error) {
    console.error("Get Jobs Error:", error);

    throw new Error(
      error.response?.data?.message ||
      "Failed to load jobs."
    );
  }
};

export const getJobById = async (id) => {
  try {
    const response = await API.get(
      `/jobs/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Job Details Error:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to load job details."
    );
  }
};

export const createJob = async (
  jobData
) => {
  try {
    const response = await API.post(
      "/jobs",
      jobData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Create Job Error:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to create job."
    );
  }
};

export const updateJob = async (
  id,
  jobData
) => {
  try {
    const response = await API.put(
      `/jobs/${id}`,
      jobData
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update Job Error:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to update job."
    );
  }
};

export const deleteJob = async (
  id
) => {
  try {
    const response = await API.delete(
      `/jobs/${id}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Job Error:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to delete job."
    );
  }
};

export const searchJobs = async (
  keyword
) => {
  try {
    const response = await API.get(
      `/search/jobs?keyword=${keyword}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "Search Jobs Error:",
      error
    );

    throw new Error(
      error.response?.data?.message ||
      "Failed to search jobs."
    );
  }
};