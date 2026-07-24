import "./JobManagement.css";
import DashboardLayout from "./DashboardLayout";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ConfirmDialog from "./components/ConfirmDialog/ConfirmDialog";

import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarAlt,
  FaBriefcase,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaClipboardList
} from "react-icons/fa";

function JobManagement() {

  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

const [jobToDelete, setJobToDelete] = useState(null);

  const jobs = [

    {
      id: 1,
      title: "Frontend Developer",
      company: "AmbiDer Technologies",
      location: "Gurugram",
      salary: "₹8 LPA",
      experience: "1-3 Years",
      applicants: 126,
      posted: "2 Days Ago",
      status: "Active"
    },

    {
      id: 2,
      title: "Backend Developer",
      company: "AmbiDer Technologies",
      location: "Noida",
      salary: "₹10 LPA",
      experience: "2-5 Years",
      applicants: 89,
      posted: "5 Days Ago",
      status: "Active"
    },

    {
      id: 3,
      title: "UI/UX Designer",
      company: "AmbiDer Technologies",
      location: "Delhi",
      salary: "₹7 LPA",
      experience: "1-2 Years",
      applicants: 64,
      posted: "1 Week Ago",
      status: "Closed"
    },

    {
      id: 4,
      title: "Data Analyst",
      company: "AmbiDer Technologies",
      location: "Remote",
      salary: "₹9 LPA",
      experience: "2+ Years",
      applicants: 42,
      posted: "Today",
      status: "Draft"
    }

  ];

  const openDeleteDialog = (job) => {
  setJobToDelete(job);
  setIsConfirmOpen(true);
};

const confirmDelete = () => {
  console.log("Delete Job:", jobToDelete);

  setJobToDelete(null);
  setIsConfirmOpen(false);
};

const cancelDelete = () => {
  setJobToDelete(null);
  setIsConfirmOpen(false);
};

  const filteredJobs = jobs.filter((job) => {

    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || job.status === filter;

    return matchesSearch && matchesFilter;

  });

  return (

    <DashboardLayout role="recruiter">

      <div className="job-page">

        <div className="job-header">

          <div>

            <h1>Job Management</h1>

            <p>
              Create, manage and monitor all your job postings from one place.
            </p>

          </div>

          <button
  className="job-create-btn"
  onClick={() => navigate("/create-job")}
>

            <FaPlus />

            Create New Job

          </button>

        </div>

        <div className="job-toolbar">

          <div className="job-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="job-filters">

            <button
              className={filter === "All" ? "active" : ""}
              onClick={() => setFilter("All")}
            >
              All
            </button>

            <button
              className={filter === "Active" ? "active" : ""}
              onClick={() => setFilter("Active")}
            >
              Active
            </button>

            <button
              className={filter === "Closed" ? "active" : ""}
              onClick={() => setFilter("Closed")}
            >
              Closed
            </button>

            <button
              className={filter === "Draft" ? "active" : ""}
              onClick={() => setFilter("Draft")}
            >
              Draft
            </button>

            <button>

              <FaFilter />

              More Filters

            </button>

          </div>

        </div>

        <div className="job-grid">

          {filteredJobs.map((job) => (

            <div
              className="job-card"
              key={job.id}
            >

              <div className="job-card-header">

                <div>

                  <h2>{job.title}</h2>

                  <h3>{job.company}</h3>

                </div>

                <span
                  className={`job-status ${job.status.toLowerCase()}`}
                >
                  {job.status}
                </span>

              </div>

                            <div className="job-meta">

                <span>

                  <FaMapMarkerAlt />

                  {job.location}

                </span>

                <span>

                  <FaMoneyBillWave />

                  {job.salary}

                </span>

                <span>

                  <FaBriefcase />

                  {job.experience}

                </span>

              </div>

              <div className="job-stats">

                <div className="job-stat">

                  <FaUsers />

                  <div>

                    <h4>{job.applicants}</h4>

                    <p>Applicants</p>

                  </div>

                </div>

                <div className="job-stat">

                  <FaCalendarAlt />

                  <div>

                    <h4>{job.posted}</h4>

                    <p>Posted</p>

                  </div>

                </div>

              </div>

              <div className="job-actions">

                <button className="job-view-btn">

                  <FaEye />

                  View

                </button>

                <button
  className="job-edit-btn"
  onClick={() => navigate("/edit-job")}
>

  <FaEdit />

  Edit

</button>

              </div>

              <div className="job-actions">

                <button
  className="job-applicants-btn"
  onClick={() => navigate("/applicants")}
>

  <FaClipboardList />

  Applicants

</button>

               <button
  className="job-delete-btn"
  onClick={() => openDeleteDialog(job)}
>

  <FaTrashAlt />

  Delete

</button>

              </div>

            </div>

          ))}

        </div>

                {filteredJobs.length === 0 && (

          <div className="job-empty">

            <FaSearch className="job-empty-icon" />

            <h2>No Jobs Found</h2>

            <p>
              No jobs match your current search or selected filters.
            </p>

            <button
              className="job-reset-btn"
              onClick={() => {
                setSearch("");
                setFilter("All");
              }}
            >
              Reset Filters
            </button>

          </div>

        )}

        <div className="job-summary">

          <div className="job-summary-card">

            <h3>Total Jobs</h3>

            <h2>{jobs.length}</h2>

            <p>Published job openings</p>

          </div>

          <div className="job-summary-card">

            <h3>Active Jobs</h3>

            <h2>

              {
                jobs.filter((job) => job.status === "Active").length
              }

            </h2>

            <p>Currently accepting applications</p>

          </div>

          <div className="job-summary-card">

            <h3>Total Applications</h3>

            <h2>

              {jobs.reduce((sum, job) => sum + job.applicants, 0)}

            </h2>

            <p>Applications received</p>

          </div>

          <div className="job-summary-card">

            <h3>Hiring Success</h3>

            <h2>91%</h2>

            <p>Above industry average</p>

          </div>

        </div>

        <div className="job-insights">

          <div className="job-activity">

            <h2>Recent Activity</h2>

            <div className="job-activity-card">

              <div className="job-dot blue"></div>

              <div>

                <h4>Frontend Developer Updated</h4>

                <p>Salary range was updated for this role.</p>

                <span>20 minutes ago</span>

              </div>

            </div>

            <div className="job-activity-card">

              <div className="job-dot green"></div>

              <div>

                <h4>New Applications Received</h4>

                <p>12 new candidates applied today.</p>

                <span>2 hours ago</span>

              </div>

            </div>

            <div className="job-activity-card">

              <div className="job-dot orange"></div>

              <div>

                <h4>Job Closed</h4>

                <p>UI/UX Designer position has been closed.</p>

                <span>Yesterday</span>

              </div>

            </div>

          </div>

          <div className="job-performance">

            <h2>Hiring Performance</h2>

            <div className="job-performance-card">

              <h3>Monthly Hiring Target</h3>

              <div className="job-progress">

                <div
                  className="job-progress-fill"
                  style={{ width: "82%" }}
                ></div>

              </div>

              <p>82% Completed</p>

            </div>

            <div className="job-performance-card">

              <h3>Average Time to Hire</h3>

              <h1>14 Days</h1>

              <p>2 days faster than last month</p>

            </div>

          </div>

        </div>

              </div>

              <ConfirmDialog
  isOpen={isConfirmOpen}
  title="Delete Job"
  message={`Are you sure you want to delete "${jobToDelete?.title || ""}"?`}
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>

    </DashboardLayout>

  );

}

export default JobManagement;