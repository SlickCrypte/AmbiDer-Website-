import "./Jobs.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import Pagination from "./components/Pagination/Pagination";
import { getAllJobs } from "./services/jobService";

function Jobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const jobsPerPage = 6;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const data = await getAllJobs();

        if (Array.isArray(data)) {
          setJobs(data);
        } else if (Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        } else if (Array.isArray(data.data)) {
          setJobs(data.data);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const keyword = search.toLowerCase();

    const skillsMatch = Array.isArray(job.requiredSkills)
      ? job.requiredSkills.some((skill) =>
          skill.toLowerCase().includes(keyword)
        )
      : job.requiredSkills
      ? job.requiredSkills.toLowerCase().includes(keyword)
      : false;

    return (
      job?.title?.toLowerCase()?.includes(keyword) ||
job?.location?.toLowerCase()?.includes(keyword) ||
job?.category?.toLowerCase()?.includes(keyword) ||
skillsMatch
    );
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  const currentJobs = filteredJobs.slice(
    indexOfFirstJob,
    indexOfLastJob
  );

  const totalPages = Math.ceil(
    filteredJobs.length / jobsPerPage
  );

  const handleViewDetails = (id) => {
    navigate(`/job-details/${id}`);
  };

  if (loading) {
    return (
      <div className="jobs">
        <h2>Loading jobs...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="jobs">
        <h2>Unable to load jobs.</h2>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="jobs">
        <h2>No jobs available.</h2>
      </div>
    );
  }

  return (
    <div className="jobs">
      <div className="jobs-header">
        <h1>Browse Jobs</h1>
      </div>

      <div className="search-container">
        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="job-grid">
        {currentJobs.map((job) => (
          <div className="job-card" key={job._id}>
            <p className="tag">
              {job.category || "General"}
            </p>

            <h2>{job.title}</h2>

            {job.companyName && (
              <p>
  <strong>Company:</strong>{" "}
  {job.companyName || job.company || "N/A"}
</p>
            )}

            {job.company && (
              <p>
  <strong>Company:</strong>{" "}
  {job.companyName || job.company || "N/A"}
</p>
            )}

            <p>
              <strong>Location:</strong>{" "}
              {job.location || "N/A"}
            </p>

            <p>
              <strong>Employment Type:</strong>{" "}
              {job.employmentType || "N/A"}
            </p>

            <p>
              <strong>Experience:</strong>{" "}
              {job.experience || "N/A"}
            </p>

            <p>
              <strong>Salary:</strong>{" "}
              {job.salary || "N/A"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {job.status}
            </p>

            <div className="info">
              <div>
                <FaMapMarkerAlt />
                <span>{job.location || "N/A"}</span>
              </div>

              <div>
                <FaBriefcase />
                <span>
                  {job.employmentType || "N/A"}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                handleViewDetails(job._id)
              }
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default Jobs;