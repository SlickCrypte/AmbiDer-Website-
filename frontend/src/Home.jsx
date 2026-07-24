import "./Home.css"
import { useNavigate } from "react-router-dom"

function Home() {

const navigate = useNavigate()

return (

<div className="home">

<div className="hero">

<p className="small">

WELCOME TO AmbiDer

</p>

<h1>

Build Better Teams.

</h1>

<p className="desc">

Discover talent and create opportunities.

</p>

<button
onClick={() =>
navigate("/jobs")
}
>

Get Started

</button>

<div className="features" id="features">

<div className="feature">

<h3>
Fast Hiring
</h3>

<p>
Reduce hiring time with streamlined workflow.
</p>

</div>

<div className="feature">

<h3>
Smart Matching
</h3>

<p>
Connect with relevant opportunities faster.
</p>

</div>

<div className="feature">

<h3>
Easy Tracking
</h3>

<p>
Monitor application progress in one place.
</p>

</div>

</div>

</div>

<section id="careers" className="careers-section">

<h2>Careers</h2>

<p>Explore exciting opportunities with AmbiDer.</p>

<button
onClick={() => navigate("/jobs")}
>
View Open Positions
</button>

</section>

<section id="contact" className="contact-section">

<h2>Contact Us</h2>

<p>Email : careers@ambider.com</p>

<p>Phone : +91 XXXXX XXXXX</p>

<p>Location : Gurugram, Haryana</p>

</section>

</div>

)

}

export default Home