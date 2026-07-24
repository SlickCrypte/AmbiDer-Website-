import "./CandidateManagement.css";
import DashboardLayout from "./DashboardLayout";

import { useState, useEffect } from "react";

import EmptyState from "./components/EmptyState/EmptyState";
import Modal from "./components/Modal/Modal";
import ConfirmDialog from "./components/ConfirmDialog/ConfirmDialog";
import {
  getAllCandidates
} from "./services/candidateService";

import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaBriefcase,
  FaStar,
  FaEye,
  FaCalendarAlt,
  FaUserCheck,
  FaTimesCircle,
  FaFileAlt,
  FaUsers
} from "react-icons/fa";

function CandidateManagement() {

const [search,setSearch]=useState("");

const [filter,setFilter]=useState("All");

const [selectedCandidate,setSelectedCandidate]=useState(null);

const [isModalOpen,setIsModalOpen]=useState(false);

const [isConfirmOpen,setIsConfirmOpen]=useState(false);

const [candidateToReject,setCandidateToReject]=useState(null);

const [candidates, setCandidates] =
useState([]);

const [loading, setLoading] =
useState(true);
useEffect(() => {

  const fetchCandidates = async () => {

    try {

      const data =
        await getAllCandidates();

      if (Array.isArray(data)) {

        setCandidates(data);

      } else if (
        Array.isArray(data.data)
      ) {

        setCandidates(data.data);

      } else {

        setCandidates([]);

      }

    } catch (error) {

      console.error(
        "Candidate Load Error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  fetchCandidates();

}, []);

const filteredCandidates=candidates.filter((candidate)=>{

const matchesSearch=

candidate.name.toLowerCase().includes(search.toLowerCase()) ||

(candidate.education || "").toLowerCase().includes(search.toLowerCase());

const matchesFilter=

filter==="All" ||

candidate.currentStatus===filter;

return matchesSearch && matchesFilter;

});

const openProfile=(candidate)=>{

setSelectedCandidate(candidate);

setIsModalOpen(true);

};

const closeProfile=()=>{

setSelectedCandidate(null);

setIsModalOpen(false);

};

const openRejectDialog=(candidate)=>{

setCandidateToReject(candidate);

setIsConfirmOpen(true);

};

const confirmReject=()=>{

console.log("Rejected :",candidateToReject);

setCandidateToReject(null);

setIsConfirmOpen(false);

};

const cancelReject=()=>{

setCandidateToReject(null);

setIsConfirmOpen(false);

};

return(

<DashboardLayout role="recruiter">

<div className="candidate-page">

<div className="candidate-header">

<div>

<h1>

Candidate Management

</h1>

<p>

Review, shortlist and manage all job applicants from one place.

</p>

</div>

<button className="candidate-header-btn">

<FaUsers/>

Total Candidates

</button>

</div>

<div className="candidate-toolbar">

<div className="candidate-search">

<FaSearch/>

<input

type="text"

placeholder="Search candidates..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

/>

</div>

<div className="candidate-filters">

<button

className={filter==="All"?"active":""}

onClick={()=>setFilter("All")}

>

All

</button>

<button

className={filter==="Shortlisted"?"active":""}

onClick={()=>setFilter("Shortlisted")}

>

Shortlisted

</button>

<button

className={filter==="Interview"?"active":""}

onClick={()=>setFilter("Interview")}

>

Interview

</button>

<button

className={filter==="Hired"?"active":""}

onClick={()=>setFilter("Hired")}

>

Hired

</button>

<button

className={filter==="Rejected"?"active":""}

onClick={()=>setFilter("Rejected")}

>

Rejected

</button>

<button>

<FaFilter/>

More Filters

</button>

</div>

</div>

{
filteredCandidates.length===0?

(
<EmptyState

title="No Candidates Found"

description="No candidates match your current search or selected filters."

buttonText="Reset Filters"

onButtonClick={()=>{

setSearch("");

setFilter("All");

}}

/>
)

:

<div className="candidate-grid">

{
filteredCandidates.map((candidate)=>(

<div

className="candidate-card"

key={candidate.id}

>

<div className="candidate-top">

<div className="candidate-avatar">

{candidate.avatar}

</div>

<div className="candidate-info">

<h2>

{candidate.name}

</h2>

<h3>

{candidate.role}

</h3>

<div className="candidate-meta">

<span>

<FaMapMarkerAlt/>

{candidate.location}

</span>

<span>

<FaBriefcase/>

{candidate.experience}

</span>

</div>

</div>

<div className="candidate-match">

<FaStar/>

<span>

{candidate.match}% Match

</span>

</div>

</div>

<div className="candidate-skills">

{

candidate.skills.map((skill,index)=>(

<span

className="candidate-skill"

key={index}

>

{skill}

</span>

))

}

</div>

<div className="candidate-bottom">

<div className="candidate-left">

{

candidate.resume && (

<div className="candidate-resume">

<FaFileAlt/>

Resume Available

</div>

)

}

<span

className={`candidate-status ${(candidate.currentStatus || "applied").toLowerCase()}`}

>

{candidate.currentStatus || "Applied"}

</span>

</div>

</div>

<div className="candidate-actions">

<button

className="candidate-view-btn"

onClick={()=>openProfile(candidate)}

>

<FaEye/>

View Profile

</button>

<button

className="candidate-interview-btn"

>

<FaCalendarAlt/>

Schedule

</button>

</div>

<div className="candidate-actions">

<button

className="candidate-shortlist-btn"

>

<FaUserCheck/>

Shortlist

</button>

<button

className="candidate-reject-btn"

onClick={()=>openRejectDialog(candidate)}

>

<FaTimesCircle/>

Reject

</button>

</div>

</div>

))

}

</div>

}

<div className="candidate-summary">

<div className="candidate-summary-card">

<h3>

Total Candidates

</h3>

<h2>

{candidates.length}

</h2>

<p>

All applicants

</p>

</div>

<div className="candidate-summary-card">

<h3>

Shortlisted

</h3>

<h2>

{

candidates.filter(

(candidate)=>candidate.status==="Shortlisted"

).length

}

</h2>

<p>

Ready for interview

</p>

</div>

<div className="candidate-summary-card">

<h3>

Interview

</h3>

<h2>

{

candidates.filter(

(candidate)=>candidate.status==="Interview"

).length

}

</h2>

<p>

Interview pipeline

</p>

</div>

<div className="candidate-summary-card">

<h3>

Hired

</h3>

<h2>

{

candidates.filter(

(candidate)=>candidate.status==="Hired"

).length

}

</h2>

<p>

Successfully hired

</p>

</div>

</div>

<div className="candidate-insights">

<div className="candidate-activity">

<h2>

Recent Recruitment Activity

</h2>

<div className="candidate-activity-card">

<div className="candidate-dot blue"></div>

<div>

<h4>

Candidate Shortlisted

</h4>

<p>

Nishant Yadav moved to Interview Round.

</p>

<span>

25 minutes ago

</span>

</div>

</div>

<div className="candidate-activity-card">

<div className="candidate-dot green"></div>

<div>

<h4>

Interview Scheduled

</h4>

<p>

Interview scheduled with Priya Sharma.

</p>

<span>

2 hours ago

</span>

</div>

</div>

<div className="candidate-activity-card">

<div className="candidate-dot orange"></div>

<div>

<h4>

Offer Accepted

</h4>

<p>

Aman Singh accepted the offer.

</p>

<span>

Yesterday

</span>

</div>

</div>

</div>

<div className="candidate-performance">

<h2>

Hiring Statistics

</h2>

<div className="candidate-performance-card">

<h3>

Interview Success Rate

</h3>

<div className="candidate-progress">

<div

className="candidate-progress-fill"

style={{width:"88%"}}

></div>

</div>

<p>

88% Success Rate

</p>

</div>

<div className="candidate-performance-card">

<h3>

Average Hiring Time

</h3>

<h1>

11 Days

</h1>

<p>

Faster than previous month

</p>

</div>

</div>

</div>

<Modal

isOpen={isModalOpen}

onClose={closeProfile}

title="Candidate Profile"

width="700px"

>

{

selectedCandidate && (

<div className="candidate-modal">

<div className="candidate-modal-header">

<div className="candidate-avatar large">

{selectedCandidate.avatar}

</div>

<div>

<h2>

{selectedCandidate.name}

</h2>

<p>

{selectedCandidate.role}

</p>

</div>

</div>

<div className="candidate-modal-info">

<p>
  <strong>Name :</strong>
  {selectedCandidate.name}
</p>

<p>
  <strong>Email :</strong>
  {selectedCandidate.email || "N/A"}
</p>

<p>
  <strong>Phone :</strong>
  {selectedCandidate.phone || "N/A"}
</p>

<p>
  <strong>Experience :</strong>
  {
    JSON.stringify(
      selectedCandidate.parsedData?.experience ||
      selectedCandidate.experience ||
      "N/A"
    )
  }
</p>

<p>
  <strong>Education :</strong>
  {
    typeof selectedCandidate.parsedData?.education === "string"
      ? selectedCandidate.parsedData.education
      : selectedCandidate.parsedData?.education?.degree ||
        selectedCandidate.education ||
        "N/A"
  }
</p>

<p>
  <strong>Status :</strong>
  {selectedCandidate.currentStatus || "Applied"}
</p>
<p>
  <strong>Resume :</strong>
  {selectedCandidate.resumeUrl
    ? "Uploaded"
    : "Not Uploaded"}
</p>

<p>
  <strong>Parsed Skills :</strong>
  {
    selectedCandidate.parsedData?.skills?.length || 0
  }
</p>


</div>

<div className="candidate-modal-skills">

<h3>

Skills

</h3>

<div className="candidate-skills">

{

(
  selectedCandidate.parsedData?.skills ||
  selectedCandidate.skills ||
  []
).map((skill,index)=>(

<span
  className="candidate-skill"
  key={index}
>

{
typeof skill === "string"
? skill
: JSON.stringify(skill)
}

</span>

))

}

</div>

</div>

</div>

)

}

</Modal>

<ConfirmDialog

isOpen={isConfirmOpen}

title="Reject Candidate"

message={`Are you sure you want to reject ${candidateToReject?.name || ""}?`}

confirmText="Reject"

cancelText="Cancel"

onConfirm={confirmReject}

onCancel={cancelReject}

/>

</div>

</DashboardLayout>

);

}

export default CandidateManagement;