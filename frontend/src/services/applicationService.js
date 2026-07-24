import API from "./api";

// Apply for a Job
export const applyJob = async (jobId) => {
  try {
    const candidateId = localStorage.getItem("userId");

    if (!candidateId) {
      throw new Error("Candidate not logged in.");
    }

    const response = await API.post("/applications", {
      candidateId,
      jobId,
      coverLetter: "",
    });

    return response.data;
  } catch (error) {
    console.error("Apply Job Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to apply for job."
    );
  }
};

// Get All Applications
export const getApplications = async () => {
  try {
    const response = await API.get("/applications");
    return response.data;
  } catch (error) {
    console.error("Get Applications Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to fetch applications."
    );
  }
};

// Withdraw Application
export const withdrawApplication = async (applicationId) => {
  try {
    const response = await API.delete(`/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    console.error("Withdraw Application Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to withdraw application."
    );
  }
};

// Update Application Status
export const updateApplicationStatus = async (
  applicationId,
  status
) => {
  try {
    const response = await API.put(
      `/applications/${applicationId}/status`,
      {
        status,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Update Status Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to update application status."
    );
  }
};