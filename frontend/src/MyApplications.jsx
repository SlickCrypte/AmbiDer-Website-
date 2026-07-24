import "./MyApplications.css";
import DashboardLayout from "./DashboardLayout";

import { useState, useEffect } from "react";

import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBuilding,
  FaEye,
  FaTimesCircle,
  FaCheckCircle,
  FaClock,
  FaBriefcase,
} from "react-icons/fa";

import { getCandidateApplications } from "./services/candidateService";

function MyApplications() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);

        const user = JSON.parse(
  localStorage.getItem("user")
);

const candidateId = user?.candidateId;

        const data =
          await getCandidateApplications(
            candidateId
          );

        if (Array.isArray(data)) {
          setApplications(data);
        } else if (Array.isArray(data.data)) {
          setApplications(data.data);
        } else if (
          Array.isArray(data.applications)
        ) {
          setApplications(data.applications);
        } else {
          setApplications([]);
        }
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load applications."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications =
    applications.filter((item) => {
      const company =
        item.company ||
        item.companyName ||
        item.job?.companyName ||
        "";

      const role =
        item.role ||
        item.jobTitle ||
        item.job?.title ||
        "";

      const matchesSearch =
        company
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        role
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        item.status === filter;

      return (
        matchesSearch && matchesFilter
      );
    });

  const interviewCount =
    applications.filter(
      (item) =>
        item.status === "Interview"
    ).length;

  const hiredCount =
    applications.filter(
      (item) => item.status === "Hired"
    ).length;

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="applications-page">
          <h2>
            Loading Applications...
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="candidate">
        <div className="applications-page">
          <h2>{error}</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="candidate">
      <div className="applications-page">
        <div className="applications-header">
          <div>
            <h1>My Applications</h1>

            <p>
              Track every job
              application and monitor
              your hiring progress.
            </p>
          </div>

          <div className="application-count">
            <h2>
              {
                filteredApplications.length
              }
            </h2>

            <span>
              Applications
            </span>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <FaSearch />

            <input
              type="text"
              placeholder="Search by company or job title..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />
          </div>

          <div className="filter-buttons">
            {[
              "All",
              "Applied",
              "Screened",
              "Interview",
              "Hired",
              "Rejected",
            ].map((status) => (
              <button
                key={status}
                className={
                  filter === status
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setFilter(status)
                }
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="applications-list">
          {filteredApplications.map(
            (item) => {
              const title =
                item.jobTitle ||
                item.job?.title ||
                "N/A";

              const company =
                item.company ||
                item.companyName ||
                item.job
                  ?.companyName ||
                "N/A";

              const location =
                item.location ||
                item.job?.location ||
                "N/A";

              const salary =
                item.salary ||
                item.job?.salary ||
                "N/A";

              const employmentType =
                item.employmentType ||
                item.job
                  ?.employmentType ||
                "N/A";

              const appliedDate =
                item.createdAt
                  ? new Date(
                      item.createdAt
                    ).toLocaleDateString()
                  : "N/A";

              return (
                <div
                  className="application-card"
                  key={item._id}
                >
                  <div className="company-section">
                    <div className="company-logo">
                      {company
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="company-info">
                      <h2>
                        {title}
                      </h2>

                      <h3>
                        <FaBuilding />
                        {company}
                      </h3>

                      <div className="application-meta">
                        <span>
                          <FaMapMarkerAlt />
                          {location}
                        </span>

                        <span>
                          <FaMoneyBillWave />
                          {salary}
                        </span>

                        <span>
                          <FaCalendarAlt />
                          {appliedDate}
                        </span>

                        <span>
                          <FaBriefcase />
                          {
                            employmentType
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="application-status">
                    <span
                      className={`status ${item.status?.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="application-actions">
                    <button className="view-btn">
                      <FaEye />
                      View Details
                    </button>

                    <button className="withdraw-btn">
                      <FaTimesCircle />
                      Withdraw
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>

        {filteredApplications.length ===
          0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <FaBriefcase />
            </div>

            <h2>
              No Applications Found
            </h2>

            <p>
              You haven't applied to
              any jobs yet.
            </p>
          </div>
        )}

        <div className="applications-summary">
          <div className="summary-card">
            <h3>
              Total Applications
            </h3>

            <h2>
              {applications.length}
            </h2>

            <p>
              Jobs you've applied
              for
            </p>
          </div>

          <div className="summary-card">
            <h3>Interviews</h3>

            <h2>
              {interviewCount}
            </h2>

            <p>
              Upcoming interview
              rounds
            </p>
          </div>

          <div className="summary-card">
            <h3>Hired</h3>

            <h2>{hiredCount}</h2>

            <p>
              Congratulations 🎉
            </p>
          </div>

          <div className="summary-card">
            <h3>
              Success Rate
            </h3>

            <h2>
              {applications.length
                ? Math.round(
                    (hiredCount /
                      applications.length) *
                      100
                  )
                : 0}
              %
            </h2>

            <p>
              Based on your
              applications
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyApplications;