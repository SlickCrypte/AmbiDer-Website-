import "./Navbar.css";
import logo from "./assets/ambider-logo.jpeg";
import { NavLink } from "react-router-dom";

function Navbar() {

  return (

    <nav className="navbar">

      <div className="logo">

        <NavLink to="/">

          <img
            className="brand-logo"
            src={logo}
            alt="AmbiDer"
          />

        </NavLink>

      </div>

      <div className="nav-links">

        <NavLink to="/">
          Home
        </NavLink>

        <NavLink to="/jobs">
          Jobs
        </NavLink>

        <a href="#about">
          About
        </a>

        <a href="#features">
          Features
        </a>

        <a href="#careers">
          Careers
        </a>

        <a href="#contact">
          Contact
        </a>

      </div>

      <div className="nav-auth">

        <NavLink
          to="/login"
          className="login-btn"
        >
          Login
        </NavLink>

        <NavLink
          to="/register"
          className="register-btn"
        >
          Register
        </NavLink>

      </div>

    </nav>

  );

}

export default Navbar;