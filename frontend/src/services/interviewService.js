import API from "./api";

// Get all interviews
export const getAllInterviews = async () => {
  try {
    const response = await API.get("/interviews");
    return response.data;
  } catch (error) {
    console.error("Get Interviews Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to load interviews."
    );
  }
};

// Get single interview
export const getInterviewById = async (id) => {
  try {
    const response = await API.get(`/interviews/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get Interview Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to load interview."
    );
  }
};

// Schedule interview
export const scheduleInterview = async (interviewData) => {
  try {
    const response = await API.post("/interviews", interviewData);
    return response.data;
  } catch (error) {
    console.error("Schedule Interview Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to schedule interview."
    );
  }
};

// Update interview
export const updateInterview = async (id, interviewData) => {
  try {
    const response = await API.put(
      `/interviews/${id}`,
      interviewData
    );

    return response.data;
  } catch (error) {
    console.error("Update Interview Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to update interview."
    );
  }
};

// Cancel interview
export const cancelInterview = async (id) => {
  try {
    const response = await API.put(`/interviews/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Cancel Interview Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to cancel interview."
    );
  }
};

// Delete interview
export const deleteInterview = async (id) => {
  try {
    const response = await API.delete(`/interviews/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Interview Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to delete interview."
    );
  }
};