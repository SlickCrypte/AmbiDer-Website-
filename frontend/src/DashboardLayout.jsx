import "./DashboardLayout.css";
import Sidebar from "./Sidebar";

import {
  FaBell,
  FaSearch,
  FaChevronDown
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function DashboardLayout({

  role = "candidate",

  pageTitle = "Dashboard",

  children

}) {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const userName = user?.name || "Guest";

  const userRole = user?.role || role;

  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");

  };

  return (

    <div className="dashboard-layout">

      <Sidebar role={userRole} />

      <div className="dashboard-main">

        <header className="dashboard-header">

          <div className="header-left">

            <h1>

              {pageTitle}

            </h1>

            <p>

              Welcome to AmbiDer Applicant Tracking System

            </p>

          </div>

          <div className="header-right">

            <div className="search-box">

              <FaSearch />

              <input

                type="text"

                placeholder="Search..."

              />

            </div>

            <button className="notification-btn">

              <FaBell />

              <span className="notification-badge">

                5

              </span>

            </button>

            <div className="user-box">

              <div className="user-avatar">

                {userName.charAt(0).toUpperCase()}

              </div>

              <div>

                <h4>

                  {userName}

                </h4>

                <span>

                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}

                </span>

              </div>

              <button

                className="logout-btn"

                onClick={logout}

                title="Logout"

              >

                Logout

              </button>

              <FaChevronDown />

            </div>

          </div>

        </header>

        <main className="dashboard-body">

          <div className="dashboard-container">

            {children}

          </div>

        </main>

      </div>

    </div>

  );

}

export default DashboardLayout;