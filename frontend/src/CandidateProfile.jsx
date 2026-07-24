import "./CandidateProfile.css";
import DashboardLayout from "./DashboardLayout";

import toast from "react-hot-toast";

import { useEffect, useState } from "react";
import { getCandidateProfile } from "./services/candidateService";

import {
FaUserCircle,
FaMapMarkerAlt,
FaEnvelope,
FaPhoneAlt,
FaGithub,
FaLinkedin,
FaGlobe,
FaDownload,
FaCode,
FaEdit,
FaGraduationCap,
FaBriefcase,
FaCertificate,
FaStar,
FaCopy,
FaExternalLinkAlt,
FaCheckCircle,
FaEye,
FaChartLine
} from "react-icons/fa";

function CandidateProfile() {

const [profile, setProfile] = useState(null);

const [loading, setLoading] = useState(true);

const [skills, setSkills] = useState([]);

const [certifications, setCertifications] = useState([]);

const copyLink=(text,message)=>{

navigator.clipboard.writeText(text);

toast.success(message);

};

useEffect(() => {

  const fetchProfile = async () => {

    try {

      const user = JSON.parse(
  localStorage.getItem("user")
);

const candidateId = user?.candidateId;

const data = await getCandidateProfile(
  candidateId
);

      setProfile(data);
      console.log("PROFILE DATA:", data);

      setSkills(
  data.parsedData?.skills ||
  data.skills ||
  []
);

      setCertifications(data.certifications || []);

    }

    catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Unable to load profile"

      );

    }

    finally {

      setLoading(false);

    }

  };

  fetchProfile();

}, []);

if (loading) {

  return (

    <DashboardLayout role="candidate">

      <div className="loading-container">

        <h2>Loading Profile...</h2>

      </div>

    </DashboardLayout>

  );

}

if (!profile) {

  return (

    <DashboardLayout role="candidate">

      <div className="loading-container">

        <h2>No Profile Found</h2>

      </div>

    </DashboardLayout>

  );

}

return(

<DashboardLayout role="candidate">

<div className="profile-page">

<div className="profile-left">

<div className="profile-card">

<div className="profile-image">

<FaUserCircle/>

</div>

<h2>
  {profile.parsedData?.name ||
   profile.name}
</h2>

<p className="profile-role">

{profile.role}

</p>

<div className="available-badge">

<FaCheckCircle/>

Available For Work

</div>

<div className="profile-rating">

<FaStar/>
<FaStar/>
<FaStar/>
<FaStar/>
<FaStar/>

<span>

4.9 Rating

</span>

</div>

<div className="profile-progress">

<div className="progress-text">

<span>

Profile Completion

</span>

<strong>

92%

</strong>

</div>

<div className="progress-bar">

<div

className="progress-fill"

style={{width:"92%"}}

>

</div>

</div>

</div>

<div className="profile-actions">

<button className="primary-btn">

<FaEdit/>

Edit Profile

</button>

<button className="secondary-btn">

<FaDownload/>

Download Resume

</button>

</div>

</div>


</div>

<div className="profile-right">

<div className="content-card">

<div className="section-heading">

<FaUserCircle/>

<h2>

About Me

</h2>

</div>

<p className="about-text">

Passionate Frontend Developer with strong expertise in React.js,
JavaScript, HTML, CSS and modern frontend technologies. I enjoy
building clean, scalable and responsive web applications with a
strong focus on user experience, performance and professional UI
design. My goal is to create products that solve real-world
problems while continuously learning new technologies and industry
best practices.

</p>

<div className="profile-highlights">

<div className="highlight-box">

<h4>

Experience

</h4>

<span>

1+ Years

</span>

</div>

<div className="highlight-box">

<h4>

Projects

</h4>

<span>

12+

</span>

</div>

<div className="highlight-box">

<h4>

Technologies

</h4>

<span>

15+

</span>

</div>

<div className="highlight-box">

<h4>

Availability

</h4>

<span>

Immediate

</span>

</div>

</div>

</div>

<div className="content-card">

<div className="section-heading">

<FaBriefcase/>

<h2>

Professional Experience

</h2>

</div>

<div className="timeline-card">

<div className="timeline-header">

<h3>

Frontend Developer Intern

</h3>

<span className="timeline-badge">

Current

</span>

</div>

<h4>

AmbiDer Technologies

</h4>

<p className="timeline-date">

January 2026 – Present

</p>

<ul className="timeline-list">

<li>

Developing a modern Applicant Tracking System using React.js and Vite.

</li>

<li>

Designed responsive dashboards for Candidates, Recruiters and Admin.

</li>

<li>

Integrated REST APIs and reusable React components.

</li>

<li>

Improved UI performance and user experience across multiple pages.

</li>

</ul>

</div>

</div>

<div className="content-card">

<div className="section-heading">

<FaGraduationCap/>

<h2>
  Education
</h2>

</div>

<div className="timeline-card">

<div className="timeline-header">

<h3>
  {profile.parsedData?.education ||
   profile.education}
</h3>

<span className="timeline-badge">

2024 - 2028

</span>

</div>

<h4>

BML Munjal University

</h4>

<p>

Focused on Computer Science fundamentals, Software Engineering,
Database Management Systems, Full Stack Development and Artificial
Intelligence.

</p>

</div>

</div>

<div className="content-card">

<div className="section-heading">

<FaCode/>

<h2>

Featured Projects

</h2>

</div>

<div className="project-card">

<div className="project-header">

<h3>

AmbiDer Applicant Tracking System

</h3>

<span>

React • Vite • MongoDB

</span>

</div>

<p>

Designed and developed a complete ATS platform including candidate,
recruiter and admin dashboards with resume upload, notifications,
job management and modern responsive UI.

</p>

<div className="project-tags">

<span>React</span>

<span>REST API</span>

<span>Responsive UI</span>

<span>Dashboard</span>

</div>

<div className="project-buttons">

<button>

GitHub

</button>

<button>

Live Demo

</button>

</div>

</div>

<div className="project-card">

<div className="project-header">

<h3>

Smart Navigation Glasses

</h3>

<span>

Python • AI

</span>

</div>

<p>

Prototype for visually impaired users capable of text recognition,
navigation assistance and obstacle detection using AI concepts.

</p>

<div className="project-tags">

<span>Python</span>

<span>OpenCV</span>

<span>AI</span>

<span>Accessibility</span>

</div>

<div className="project-buttons">

<button>

GitHub

</button>

<button>

Documentation

</button>

</div>

</div>

</div>


<div className="content-card">

<div className="section-heading">

<FaStar/>

<h2>

Additional Information

</h2>

</div>

<div className="extra-grid">

<div className="extra-card">

<h4>

Languages

</h4>

<p>

English, Hindi

</p>

</div>

<div className="extra-card">

<h4>

Preferred Role

</h4>

<p>

Frontend Developer

</p>

</div>

<div className="extra-card">

<h4>

Employment Type

</h4>

<p>

Internship / Full-Time

</p>

</div>

<div className="extra-card">

<h4>

Current Status

</h4>

<p className="available-text">

🟢 Available Immediately

</p>

</div>

</div>

</div>


<div className="last-updated">

<p>

Last Updated :

<strong>

08 July 2026

</strong>

</p>

</div>

</div>

</div>

</DashboardLayout>

);

}

export default CandidateProfile;