import "./NotFound.css";

import { useNavigate } from "react-router-dom";

import {
  FaHome,
  FaArrowLeft,
  FaExclamationTriangle
} from "react-icons/fa";

function NotFound() {

const navigate = useNavigate();

return(

<div className="notfound-page">

<div className="notfound-card">

<div className="notfound-icon">

<FaExclamationTriangle/>

</div>

<h1>

404

</h1>

<h2>

Page Not Found

</h2>

<p>

Oops! The page you're looking for doesn't exist or has been moved.

</p>

<div className="notfound-buttons">

<button

className="home-btn"

onClick={()=>navigate("/")}

>

<FaHome/>

Go Home

</button>

<button

className="back-btn"

onClick={()=>navigate(-1)}

>

<FaArrowLeft/>

Go Back

</button>

</div>

</div>

</div>

);

}

export default NotFound;