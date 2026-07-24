import "./TalentPool.css";
import DashboardLayout from "./DashboardLayout";
import { useState } from "react";

import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaStar,
  FaDownload,
  FaEye,
  FaUserCheck,
  FaCalendarAlt,
  FaGithub,
  FaLinkedin
} from "react-icons/fa";

function TalentPool() {

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const candidates = [

    {
      id: 1,
      name: "Nishant Yadav",
      role: "Frontend Developer",
      experience: "2 Years",
      location: "Haryana",
      skills: ["React", "JavaScript", "Node.js"],
      match: 96,
      status: "Available",
      avatar: "N"
    },

    {
      id: 2,
      name: "Priya Sharma",
      role: "UI/UX Designer",
      experience: "3 Years",
      location: "Delhi",
      skills: ["Figma", "Adobe XD", "React"],
      match: 92,
      status: "Available",
      avatar: "P"
    },

    {
      id: 3,
      name: "Rahul Verma",
      role: "Backend Developer",
      experience: "4 Years",
      location: "Noida",
      skills: ["Node.js", "MongoDB", "Express"],
      match: 90,
      status: "Interviewing",
      avatar: "R"
    },

    {
      id: 4,
      name: "Aman Singh",
      role: "Full Stack Developer",
      experience: "5 Years",
      location: "Gurugram",
      skills: ["React", "Node.js", "AWS"],
      match: 95,
      status: "Available",
      avatar: "A"
    }

  ];

  const filteredCandidates = candidates.filter((candidate) => {

    const matchesSearch =
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.role.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || candidate.status === filter;

    return matchesSearch && matchesFilter;

  });

  return (

    <DashboardLayout role="recruiter">

      <div className="talent-page">

        <div className="talent-header">

          <div>

            <h1>Talent Pool</h1>

            <p>
              Discover top talent, shortlist candidates and schedule interviews.
            </p>

          </div>

          <button className="talent-add-btn">

            <FaUserCheck />

            Shortlisted Candidates

          </button>

        </div>

        <div className="talent-toolbar">

          <div className="talent-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="talent-filters">

            <button
              className={filter === "All" ? "active" : ""}
              onClick={() => setFilter("All")}
            >
              All
            </button>

            <button
              className={filter === "Available" ? "active" : ""}
              onClick={() => setFilter("Available")}
            >
              Available
            </button>

            <button
              className={filter === "Interviewing" ? "active" : ""}
              onClick={() => setFilter("Interviewing")}
            >
              Interviewing
            </button>

            <button>

              <FaFilter />

              More Filters

            </button>

          </div>

        </div>

        <div className="talent-grid">

          {filteredCandidates.map((candidate) => (

            <div
              className="talent-card"
              key={candidate.id}
            >

              <div className="talent-top">

                <div className="talent-avatar">

                  {candidate.avatar}

                </div>

                <div className="talent-info">

                  <h2>{candidate.name}</h2>

                  <h3>{candidate.role}</h3>

                  <div className="talent-meta">

                    <span>

                      <FaBriefcase />

                      {candidate.experience}

                    </span>

                    <span>

                      <FaMapMarkerAlt />

                      {candidate.location}

                    </span>

                  </div>

                </div>

                <div className="talent-match">

                  <FaStar />

                  <span>{candidate.match}% Match</span>

                </div>

              </div>

                            <div className="talent-skills">

                {candidate.skills.map((skill, index) => (

                  <span
                    className="talent-skill"
                    key={index}
                  >
                    {skill}
                  </span>

                ))}

              </div>

              <div className="talent-status-row">

                <span
                  className={`talent-status ${candidate.status.toLowerCase()}`}
                >
                  {candidate.status}
                </span>

                <div className="talent-socials">

                  <button
                    className="talent-icon-btn"
                    title="GitHub"
                  >
                    <FaGithub />
                  </button>

                  <button
                    className="talent-icon-btn"
                    title="LinkedIn"
                  >
                    <FaLinkedin />
                  </button>

                </div>

              </div>

              <div className="talent-actions">

                <button className="talent-view-btn">

                  <FaEye />

                  View Profile

                </button>

                <button className="talent-download-btn">

                  <FaDownload />

                  Resume

                </button>

              </div>

              <div className="talent-actions talent-actions-bottom">

                <button className="talent-shortlist-btn">

                  <FaUserCheck />

                  Shortlist

                </button>

                <button className="talent-interview-btn">

                  <FaCalendarAlt />

                  Schedule

                </button>

              </div>

            </div>

          ))}

        </div>

                {filteredCandidates.length === 0 && (

          <div className="talent-empty">

            <FaSearch className="talent-empty-icon" />

            <h2>No Candidates Found</h2>

            <p>
              No candidates match your current search or selected filters.
            </p>

            <button
              className="talent-reset-btn"
              onClick={() => {
                setSearch("");
                setFilter("All");
              }}
            >
              Reset Filters
            </button>

          </div>

        )}

        <div className="talent-summary">

          <div className="talent-summary-card">

            <h3>Total Candidates</h3>

            <h2>{candidates.length}</h2>

            <p>Profiles available in Talent Pool</p>

          </div>

          <div className="talent-summary-card">

            <h3>Available Now</h3>

            <h2>
              {
                candidates.filter(
                  (candidate) => candidate.status === "Available"
                ).length
              }
            </h2>

            <p>Ready for immediate hiring</p>

          </div>

          <div className="talent-summary-card">

            <h3>Interviewing</h3>

            <h2>
              {
                candidates.filter(
                  (candidate) => candidate.status === "Interviewing"
                ).length
              }
            </h2>

            <p>Currently in hiring process</p>

          </div>

          <div className="talent-summary-card">

            <h3>Average Match</h3>

            <h2>93%</h2>

            <p>AI candidate matching score</p>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

}

export default TalentPool;