import "./Applicants.css";
import DashboardLayout from "./DashboardLayout";
import toast from "react-hot-toast";

import { useEffect, useState } from "react";
import {
  getApplications,
  updateApplicationStatus,
} from "./services/applicationService";

import {
  FaSearch,
  FaFilePdf,
  FaUserCheck,
  FaTimesCircle,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";

function Applicants() {
  // Backend will populate this later
  const [applicants, setApplicants] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

const [error, setError] = useState("");

  const filteredApplicants = applicants.filter((application) =>
  application.candidate?.name
    ?.toLowerCase()
    .includes(search.toLowerCase())
);

useEffect(() => {
  loadApplications();
}, []);

const loadApplications = async () => {
  try {
    setLoading(true);

    const data = await getApplications();

    setApplicants(data);

  } catch (error) {

    console.error(error);

    setError("Unable to load applications.");

  } finally {

    setLoading(false);

  }
};

  const handleViewResume = (resumeUrl) => {

  if (!resumeUrl) {

    toast.error("Resume not available");

    return;

  }

  window.open(
    `http://localhost:5000${resumeUrl}`,
    "_blank"
  );

};

const handleShortlist = async (id) => {
  try {
    await updateApplicationStatus(id, "Screened");
    toast.success("Candidate shortlisted");
    loadApplications();
  } catch (error) {
    toast.error("Unable to update status");
  }
};

const handleInterview = async (id) => {
  try {
    await updateApplicationStatus(id, "Interview");
    toast.success("Interview scheduled");
    loadApplications();
  } catch (error) {
    toast.error("Unable to update status");
  }
};
const handleHire = async (id) => {
  try {

    await updateApplicationStatus(
      id,
      "Hired"
    );

    toast.success(
      "Candidate hired"
    );

    loadApplications();

  } catch (error) {

    toast.error(
      "Unable to update status"
    );

  }
};

const handleReject = async (id) => {
  try {
    await updateApplicationStatus(id, "Rejected");
    toast.success("Candidate rejected");
    loadApplications();
  } catch (error) {
    toast.error("Unable to update status");
  }
  const handleHire = async (id) => {
  try {

    await updateApplicationStatus(
      id,
      "Hired"
    );

    toast.success(
      "Candidate hired"
    );

    loadApplications();

  } catch (error) {

    toast.error(
      "Unable to update status"
    );

  }
};
};


if (loading) {
  return (
    <DashboardLayout role="recruiter">
      <div className="applicants-page">
        <h2>Loading...</h2>
      </div>
    </DashboardLayout>
  );
}

if (error) {
  return (
    <DashboardLayout role="recruiter">
      <div className="applicants-page">
        <h2>{error}</h2>
      </div>
    </DashboardLayout>
  );
}
  return (
    <DashboardLayout role="recruiter">
      <div className="applicants-page">

        {/* Header */}

        <div className="applicants-header">

          <div>

            <h1>Applicants</h1>

            <p>
              Review and manage candidates who applied for this job.
            </p>

          </div>

          <div className="applicant-count">

            <FaUsers />

            <span>{filteredApplicants.length} Applicants</span>

          </div>

        </div>

        {/* Search */}

        <div className="applicants-toolbar">

          <div className="applicants-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

        </div>

        {/* Empty State */}

        {filteredApplicants.length === 0 ? (

          <div className="empty-applicants">

            <FaUsers className="empty-icon" />

            <h2>No Applicants Yet</h2>

            <p>
              No candidate has applied for this job yet.
            </p>

          </div>

        ) : (

          <div className="applicants-list">

            {filteredApplicants.map((candidate) => (

              <div
                className="applicant-card"
                key={candidate._id}
              >

                <div className="applicant-left">

                  <div className="avatar">

                    {candidate.candidate?.name?.charAt(0)}

                  </div>

                  <div>

                    <h2>{candidate.candidate?.name}</h2>

                    <p>{candidate.candidate?.email}</p>

                    <span>{candidate.candidate?.phone}</span>

                    <p>
  <strong>Matching:</strong>{" "}
  {candidate.matchingPercentage}%
</p>

<p>
  <strong>Status:</strong>{" "}
  {candidate.status}
</p>

<p>
  <strong>Matched Skills:</strong>{" "}
  {candidate.matchedSkills?.join(", ") || "N/A"}
</p>

                  </div>

                </div>

                <div className="applicant-actions">

                  <button
  className="resume-btn"
  onClick={() =>
    handleViewResume(candidate.candidate?.resumeUrl)
  }
>
  <FaFilePdf />
  Resume
</button>

                 <button
  className="shortlist-btn"
  onClick={() =>
    handleShortlist(candidate._id)
  }
>

                    <FaUserCheck />

                    Shortlist

                  </button>

                 <button
  className="interview-btn"
  onClick={() =>
    handleInterview(candidate._id)
  }
>

                    <FaCalendarAlt />

                    Interview

                  </button>
                  <button
  className="hire-btn"
  onClick={() =>
    handleHire(candidate._id)
  }
>
  <FaCheckCircle />
  Hire
</button>

                 <button
  className="reject-btn"
  onClick={() =>
    handleReject(candidate._id)
  }
>

                    <FaTimesCircle />

                    Reject

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </DashboardLayout>
  );
}

export default Applicants;