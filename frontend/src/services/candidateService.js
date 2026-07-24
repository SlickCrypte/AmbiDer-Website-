import API from "./api";

/* ===============================
   Candidate Profile
================================= */

export const getCandidateProfile = async (candidateId) => {
  try {
    const response = await API.get(`/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error("Get Candidate Profile Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to load candidate profile."
    );
  }
};

export const updateCandidateProfile = async (
  candidateId,
  profileData
) => {
  try {
    const response = await API.put(
      `/candidates/${candidateId}`,
      profileData
    );

    return response.data;
  } catch (error) {
    console.error("Update Candidate Profile Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to update profile."
    );
  }
};

/* ===============================
   Resume
================================= */

export const uploadResume = async (formData) => {
  try {
    const response = await API.post(
      "/resume/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Upload Resume Error:", error);

    throw new Error(
      error.response?.data?.message || "Resume upload failed."
    );
  }
};

export const getResume = async () => {
  try {
    const response = await API.get("/resume");
    return response.data;
  } catch (error) {
    console.error("Get Resume Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to load resume."
    );
  }
};

export const downloadResume = async () => {
  try {
    const response = await API.get("/resume/download", {
      responseType: "blob",
    });

    return response;
  } catch (error) {
    console.error("Download Resume Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to download resume."
    );
  }
};

/* ===============================
   Applications
================================= */

export const getMyApplications = async () => {
  try {
    const candidateId = localStorage.getItem("userId");

    const response = await API.get(
      `/applications/candidate/${candidateId}`
    );

    return response.data;
  } catch (error) {
    console.error("Get Applications Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to load applications."
    );
  }
};

export const applyForJob = async (jobId) => {
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

/* ===============================
   Recruiter
================================= */
export const getCandidateApplications = async (candidateId) => {
  try {
    const response = await API.get(
      `/applications/candidate/${candidateId}`
    );

    return response.data;
  } catch (error) {
    console.error("Get Candidate Applications Error:", error);

    throw new Error(
      error.response?.data?.message ||
      "Failed to load candidate applications."
    );
  }
};
export const getAllCandidates = async () => {
  try {
    const response = await API.get("/candidates");
    return response.data;
  } catch (error) {
    console.error("Get Candidates Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to load candidates."
    );
  }
};

export const searchCandidates = async (
  name = "",
  skills = "",
  status = ""
) => {
  try {
    const response = await API.get("/candidates/search", {
      params: {
        name,
        skills,
        status,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Search Candidates Error:", error);

    throw new Error(
      error.response?.data?.message || "Failed to search candidates."
    );
  }
};