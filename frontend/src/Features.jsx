import "./Features.css";
import { useNavigate } from "react-router-dom";

function Features() {

  const navigate = useNavigate();

  const features = [
    {
      title: "AI Candidate Matching",
      description: "Smart matching between jobs and candidates using AI-powered scoring."
    },
    {
      title: "Resume Parsing",
      description: "Automatically extract skills, education and experience from resumes."
    },
    {
      title: "Application Tracking",
      description: "Track every stage of the hiring process in one dashboard."
    },
    {
      title: "Interview Management",
      description: "Schedule and manage interviews with real-time updates."
    },
    {
      title: "Analytics Dashboard",
      description: "View hiring analytics and recruitment performance."
    },
    {
      title: "Notifications",
      description: "Instant updates for recruiters and candidates."
    }
  ];

  return (
    <div className="features-page">

      <div className="features-hero">

        <h1>AmbiDer Features</h1>

        <p>
          Everything you need to manage modern recruitment efficiently.
        </p>

      </div>

      <div className="features-grid">

        {features.map((item, index) => (

          <div
            className="feature-card"
            key={index}
          >

            <h2>{item.title}</h2>

            <p>{item.description}</p>

          </div>

        ))}

      </div>

      <div className="features-bottom">

        <button
          onClick={() => navigate("/jobs")}
        >
          Explore Jobs
        </button>

      </div>

    </div>
  );

}

export default Features;