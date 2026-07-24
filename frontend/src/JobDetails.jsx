import "./JobDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getJobById } from "./services/jobService";
import { applyJob } from "./services/applicationService";

function JobDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);

        const data = await getJobById(id);

        if (data?.job) {
          setJob(data.job);
        } else if (data?.data) {
          setJob(data.data);
        } else {
          setJob(data);
        }
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "Unable to load job details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleApply = async () => {
  try {

    const candidateId =
      localStorage.getItem("userId");

    const token =
      localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/candidates/${candidateId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const candidate =
      await response.json();
      console.log("Candidate Response:", candidate);
console.log("Resume URL:", candidate.resumeUrl);
console.log("Response Status:", response.status);

    if (!candidate.resumeUrl) {

      toast.error(
        "Please upload your resume before applying"
      );

      navigate("/resume");

      return;
    }

    await applyJob(id);

    toast.success(
      "Application submitted successfully"
    );

    navigate("/my-applications");

  } catch (error) {

    toast.error(
      error.message ||
      "Application failed"
    );

  }
};
  if (loading) {
    return (
      <div className="details">
        <h2>Loading Job Details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details">
        <h2>{error}</h2>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="details">
        <h2>Job not found.</h2>
      </div>
    );
  }

  return (
    <div className="details">
      <div className="top">
        <div>
          <p className="small">
            {job.category || "Category"}
          </p>

          <h1>
            {job.title || "Untitled Job"}
          </h1>
        </div>

        <button onClick={handleApply}>
          Apply Now
        </button>
      </div>

      <div className="info">
        <span>
          📍 {job.location || "N/A"}
        </span>

        <span>
          💼{" "}
          {job.employmentType || "N/A"}
        </span>

        <span>
          💰 {job.salary || "N/A"}
        </span>
      </div>

      <div className="section">
        <h2>Job Description</h2>

        <p>
          {job.description ||
            "No description available."}
        </p>
      </div>

      <div className="section">
        <h2>Requirements</h2>

        <ul>
          {Array.isArray(
            job.requirements
          ) &&
          job.requirements.length > 0 ? (
            job.requirements.map(
              (item, index) => (
                <li key={index}>
                  {item}
                </li>
              )
            )
          ) : (
            <li>
              No requirements available.
            </li>
          )}
        </ul>
      </div>

      <div className="section">
        <h2>Benefits</h2>

        <ul>
          {Array.isArray(job.benefits) &&
          job.benefits.length > 0 ? (
            job.benefits.map(
              (item, index) => (
                <li key={index}>
                  {item}
                </li>
              )
            )
          ) : (
            <li>
              No benefits available.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default JobDetails;