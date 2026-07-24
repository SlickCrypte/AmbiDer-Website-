/* =============================================================================
   AmbiDer Advisors & Management Consultants LLP
   career-search.js
   Job data, live search, department filter, and location filter.
   The job data below is also read by jobdetails.html (via query string ?id=)
   so include this file on any page that needs to resolve a job by ID.
   ============================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Job data
     In production this array would be replaced by a fetch() call to the
     ATS / careers API. Kept static here for a frontend-only build.
     --------------------------------------------------------------------- */
  window.AMBIDER_JOBS = [
    {
      id: "SCF-101",
      title: "Senior Consultant, Strategy & Corporate Finance",
      department: "strategy",
      departmentLabel: "Strategy & Corporate Finance",
      location: "gurugram",
      locationLabel: "Gurugram, India",
      type: "Full-Time",
      experience: "4–6 years",
      summary: "Lead workstreams on growth strategy and M&A advisory engagements for clients across financial services and manufacturing.",
      responsibilities: [
        "Lead client workstreams on corporate strategy, growth planning, and M&A due diligence.",
        "Structure and manage financial models supporting valuation and investment decisions.",
        "Present findings directly to client CXOs and board-level stakeholders.",
        "Mentor and review the work of Associates and Analysts on the engagement team.",
        "Contribute to proposal development and business development efforts."
      ],
      qualifications: [
        "MBA or equivalent postgraduate degree from a recognized institution.",
        "4–6 years of experience in strategy consulting, investment banking, or corporate development.",
        "Demonstrated experience leading client-facing workstreams independently."
      ],
      skills: ["Financial Modeling", "Corporate Strategy", "M&A Advisory", "Client Management", "Executive Presentations"],
      benefits: ["Comprehensive health coverage", "Performance-linked annual bonus", "Learning & certification stipend", "Hybrid work flexibility"]
    },
    {
      id: "OPS-204",
      title: "Consultant, Operations Excellence",
      department: "operations",
      departmentLabel: "Operations Consulting",
      location: "mumbai",
      locationLabel: "Mumbai, India",
      type: "Full-Time",
      experience: "2–4 years",
      summary: "Design and implement operational improvement programs for manufacturing and logistics clients across Western India.",
      responsibilities: [
        "Analyze client operations to identify efficiency and cost-reduction opportunities.",
        "Design process redesign and lean transformation roadmaps.",
        "Support implementation of new operating models on client sites.",
        "Prepare client-ready deliverables and progress reports.",
        "Collaborate with cross-functional client teams to drive adoption of recommendations."
      ],
      qualifications: [
        "Bachelor's degree in Engineering, Operations, or a related field; MBA preferred.",
        "2–4 years of experience in operations consulting or industrial engineering.",
        "Willingness to travel to client sites within India."
      ],
      skills: ["Process Improvement", "Lean Six Sigma", "Supply Chain Analysis", "Stakeholder Management", "Data Analysis"],
      benefits: ["Comprehensive health coverage", "Travel allowance", "Learning & certification stipend", "Retirement planning support"]
    },
    {
      id: "DGT-315",
      title: "Associate, Digital & Technology Consulting",
      department: "digital",
      departmentLabel: "Digital & Technology",
      location: "remote",
      locationLabel: "Remote (India)",
      type: "Full-Time",
      experience: "1–3 years",
      summary: "Support digital transformation engagements spanning technology strategy, systems integration, and data platform advisory.",
      responsibilities: [
        "Assist in scoping digital transformation roadmaps for enterprise clients.",
        "Evaluate technology vendors and platforms against client requirements.",
        "Build data-driven analyses to support technology investment decisions.",
        "Coordinate with client IT teams during implementation phases.",
        "Prepare workshop materials and client presentations."
      ],
      qualifications: [
        "Bachelor's degree in Computer Science, Information Systems, or related field.",
        "1–3 years of experience in technology consulting, product, or IT strategy roles.",
        "Familiarity with enterprise software platforms and data architecture concepts."
      ],
      skills: ["Digital Strategy", "Systems Analysis", "Vendor Evaluation", "SQL", "Project Coordination"],
      benefits: ["Remote work flexibility", "Comprehensive health coverage", "Home office stipend", "Learning & certification stipend"]
    },
    {
      id: "RSK-118",
      title: "Manager, Risk & Compliance Advisory",
      department: "risk",
      departmentLabel: "Risk & Compliance",
      location: "bengaluru",
      locationLabel: "Bengaluru, India",
      type: "Full-Time",
      experience: "6–9 years",
      summary: "Own client relationships for regulatory risk, internal controls, and compliance advisory engagements across financial services.",
      responsibilities: [
        "Manage end-to-end delivery of risk and regulatory compliance engagements.",
        "Serve as the primary day-to-day client relationship owner.",
        "Design internal control frameworks aligned with regulatory requirements.",
        "Lead and develop a team of Consultants and Associates.",
        "Identify and pursue account growth opportunities with existing clients."
      ],
      qualifications: [
        "MBA, CA, or equivalent professional qualification.",
        "6–9 years of experience in risk advisory, internal audit, or regulatory compliance.",
        "Prior experience managing client relationships at a senior level."
      ],
      skills: ["Regulatory Compliance", "Internal Controls", "Risk Assessment", "Team Leadership", "Client Relationship Management"],
      benefits: ["Comprehensive health coverage", "Performance-linked annual bonus", "Retirement planning support", "Parental leave"]
    },
    {
      id: "PPL-072",
      title: "Analyst, People & Culture",
      department: "hr",
      departmentLabel: "People & Culture",
      location: "gurugram",
      locationLabel: "Gurugram, India",
      type: "Full-Time",
      experience: "0–2 years",
      summary: "Support firmwide talent acquisition, onboarding, and employee engagement programs across all practice areas.",
      responsibilities: [
        "Coordinate end-to-end recruitment logistics for campus and lateral hiring.",
        "Support onboarding delivery for new joiners across practice areas.",
        "Assist in planning firmwide engagement events and wellness initiatives.",
        "Maintain accurate candidate and employee records in the HRIS.",
        "Prepare recruitment and engagement metrics reporting."
      ],
      qualifications: [
        "Bachelor's degree in Human Resources, Business Administration, or related field.",
        "0–2 years of experience in HR, talent acquisition, or a related function.",
        "Strong organizational skills and attention to detail."
      ],
      skills: ["Talent Acquisition", "HRIS Systems", "Employee Engagement", "Event Coordination", "Communication"],
      benefits: ["Comprehensive health coverage", "Learning & certification stipend", "Hybrid work flexibility", "Paid time off"]
    },
    {
      id: "SCF-142",
      title: "Analyst, Strategy & Corporate Finance",
      department: "strategy",
      departmentLabel: "Strategy & Corporate Finance",
      location: "mumbai",
      locationLabel: "Mumbai, India",
      type: "Full-Time",
      experience: "0–2 years",
      summary: "Support strategy and financial advisory engagements through market research, financial analysis, and client deliverables.",
      responsibilities: [
        "Conduct market research and competitive benchmarking for client engagements.",
        "Build and maintain financial models under senior team guidance.",
        "Prepare client-ready slides and supporting analysis.",
        "Participate in client workshops and data-gathering sessions.",
        "Support proposal and pitch material development."
      ],
      qualifications: [
        "Bachelor's degree in Finance, Economics, Business, or a related field.",
        "0–2 years of experience; internship experience in consulting or finance preferred.",
        "Strong analytical and Excel/PowerPoint skills."
      ],
      skills: ["Financial Analysis", "Market Research", "Excel Modeling", "PowerPoint", "Critical Thinking"],
      benefits: ["Comprehensive health coverage", "Learning & certification stipend", "Structured mentorship", "Paid time off"]
    },
    {
      id: "DGT-266",
      title: "Senior Consultant, Data & Analytics",
      department: "digital",
      departmentLabel: "Digital & Technology",
      location: "bengaluru",
      locationLabel: "Bengaluru, India",
      type: "Full-Time",
      experience: "4–7 years",
      summary: "Lead data strategy and analytics advisory workstreams, translating client data assets into decision-ready insight.",
      responsibilities: [
        "Lead design of data strategy and analytics roadmaps for enterprise clients.",
        "Oversee data architecture assessments and dashboard development.",
        "Translate complex analytical findings into clear client recommendations.",
        "Manage and review the technical work of Associates and Analysts.",
        "Support pre-sales activity for data and analytics engagements."
      ],
      qualifications: [
        "Bachelor's or Master's degree in a quantitative field.",
        "4–7 years of experience in data consulting, analytics, or business intelligence.",
        "Hands-on experience with SQL and at least one BI or visualization tool."
      ],
      skills: ["Data Strategy", "SQL", "Business Intelligence", "Data Visualization", "Stakeholder Communication"],
      benefits: ["Comprehensive health coverage", "Performance-linked annual bonus", "Hybrid work flexibility", "Learning & certification stipend"]
    },
    {
      id: "OPS-089",
      title: "Associate, Supply Chain Advisory",
      department: "operations",
      departmentLabel: "Operations Consulting",
      location: "gurugram",
      locationLabel: "Gurugram, India",
      type: "Full-Time",
      experience: "1–3 years",
      summary: "Support supply chain diagnostic and network optimization engagements for manufacturing and retail clients.",
      responsibilities: [
        "Support supply chain diagnostics covering procurement, logistics, and inventory.",
        "Build network optimization models under senior guidance.",
        "Assist in facilitating client workshops and data validation sessions.",
        "Prepare client deliverables summarizing analysis and recommendations.",
        "Track implementation progress against agreed milestones."
      ],
      qualifications: [
        "Bachelor's degree in Engineering, Supply Chain, or a related field.",
        "1–3 years of experience in supply chain, logistics, or operations roles.",
        "Comfortable working with large operational datasets."
      ],
      skills: ["Supply Chain Analysis", "Network Optimization", "Excel Modeling", "Client Workshops", "Data Validation"],
      benefits: ["Comprehensive health coverage", "Travel allowance", "Learning & certification stipend", "Paid time off"]
    }
  ];

  // Expose data for other pages (e.g. jobdetails.html) that include this file.

  const listingsEl = document.getElementById("jobListings");
  if (!listingsEl) return; // Not on a page that renders the listings grid.

  const emptyStateEl = document.getElementById("jobEmptyState");
  const resultsCountEl = document.getElementById("jobResultsCount");
  const searchInput = document.getElementById("jobSearchInput");
  const deptFilter = document.getElementById("departmentFilter");
  const locFilter = document.getElementById("locationFilter");
  const searchBtn = document.getElementById("jobSearchBtn");

  function jobCardTemplate(job) {
    return `
      <div class="job-card" data-id="${job.id}">
        <div class="d-flex flex-wrap justify-content-between align-items-start gap-2">
          <div>
            <span class="badge-dept mb-2 d-inline-block">${job.departmentLabel}</span>
            <h5>${job.title}</h5>
            <div class="job-meta d-flex flex-wrap gap-3">
              <span><i class="bi bi-geo-alt"></i>${job.locationLabel}</span>
              <span><i class="bi bi-briefcase"></i>${job.type}</span>
              <span><i class="bi bi-clock-history"></i>${job.experience}</span>
            </div>
            <p class="mt-2 mb-0 text-secondary small">${job.summary}</p>
          </div>
         <a href="jobdetails.html?id=${encodeURIComponent(job.id)}"
   class="btn-ad-outline-dark align-self-center">
   View Role
</a>
        </div>
      </div>`;
  }

  function renderJobs(jobs) {
    if (jobs.length === 0) {
      listingsEl.innerHTML = "";
      emptyStateEl.classList.remove("d-none");
    } else {
      emptyStateEl.classList.add("d-none");
      listingsEl.innerHTML = jobs.map(jobCardTemplate).join("");
    }
  resultsCountEl.textContent = jobs.length === window.AMBIDER_JOBS.length
      ? `Showing all ${window.AMBIDER_JOBS.length} openings`
      : `Showing ${jobs.length} of ${window.AMBIDER_JOBS.length} openings`;  
  }

  function applyFilters() {
    const query = (searchInput.value || "").trim().toLowerCase();
    const dept = deptFilter.value;
    const loc = locFilter.value;

    const filtered = window.AMBIDER_JOBS.filter((job) => {
      const matchesQuery = !query ||
        job.title.toLowerCase().includes(query) ||
        job.departmentLabel.toLowerCase().includes(query) ||
        job.skills.some((s) => s.toLowerCase().includes(query));
      const matchesDept = dept === "all" || job.department === dept;
      const matchesLoc = loc === "all" || job.location === loc;
      return matchesQuery && matchesDept && matchesLoc;
    });

    renderJobs(filtered);
  }

  // Live search — filters as the user types.
  searchInput.addEventListener("input", applyFilters);
  deptFilter.addEventListener("change", applyFilters);
  locFilter.addEventListener("change", applyFilters);
  searchBtn.addEventListener("click", function (e) {
    e.preventDefault();
    applyFilters();
  });

  // Initial render.
  renderJobs(window.AMBIDER_JOBS);
})();