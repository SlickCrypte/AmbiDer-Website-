import "./Card.css";

function Card({ title, value, subtitle }) {

return (

<div className="custom-card">

<h3>{title}</h3>

<h1>{value}</h1>

<p>{subtitle}</p>

</div>

);

}

export default Card;