import "./Sidebar.css";
import logo from "./assets/ambider-logo.jpeg";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaUser,
  FaFileAlt,
  FaBell,
  FaCog,
  FaBriefcase,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaClipboardList
} from "react-icons/fa";

function Sidebar({ role = "candidate" }) {

  const user = JSON.parse(localStorage.getItem("user"));

  const userName = user?.name || "Guest";

  const candidateMenu = [

    {
      name: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard"
    },

    {
      name: "My Profile",
      icon: <FaUser />,
      path: "/candidate-profile"
    },

    {
      name: "Resume",
      icon: <FaFileAlt />,
      path: "/resume"
    },

   
    {
      name: "Notifications",
      icon: <FaBell />,
      path: "/notifications"
    },

    

  ];

  const recruiterMenu = [

    {
      name: "Dashboard",
      icon: <FaHome />,
      path: "/recruiter"
    },

    {
      name: "Jobs",
      icon: <FaBriefcase />,
      path: "/job-management"
    },

    {
      name: "Candidates",
      icon: <FaUsers />,
      path: "/candidate-management"
    },
    

  

   

    {
      name: "Notifications",
      icon: <FaBell />,
      path: "/notifications"
    },

   

  ];

  const adminMenu = [

    {
      name: "Dashboard",
      icon: <FaHome />,
      path: "/admin"
    },

    {
      name: "Recruiters",
      icon: <FaUsers />,
      path: "/recruiters"
    },

    {
      name: "Candidates",
      icon: <FaUser />,
      path: "/candidate-management"
    },

    {
      name: "Reports",
      icon: <FaFileAlt />,
      path: "/reports"
    },

    {
      name: "Analytics",
      icon: <FaChartBar />,
      path: "/analytics"
    },

    {
      name: "Settings",
      icon: <FaCog />,
      path: "/settings"
    }

  ];

  let menu = candidateMenu;

  if (role === "recruiter") {

    menu = recruiterMenu;

  }

  if (role === "admin") {

    menu = adminMenu;

  }

  return (

    <aside className="sidebar">

      <div className="sidebar-top">

        <img

          src={logo}

          alt="AmbiDer"

          className="sidebar-logo"

        />

        <div className="sidebar-user">

          <div className="user-avatar">

            {userName.charAt(0).toUpperCase()}

          </div>

          <div>

            <h3>

              {userName}

            </h3>

            <span>

              {role.charAt(0).toUpperCase() + role.slice(1)}

            </span>

          </div>

        </div>

      </div>

      <nav className="sidebar-menu">

        {

          menu.map((item,index)=>(

            <NavLink

              key={index}

              to={item.path}

              className={({isActive})=>

                isActive

                  ? "sidebar-link active"

                  : "sidebar-link"

              }

            >

              {item.icon}

              <span>

                {item.name}

              </span>

            </NavLink>

          ))

        }

      </nav>

      <div className="sidebar-footer">

        <div className="profile-progress">

          <div className="progress-head">

            <span>

              Profile

            </span>

            <span>

              80%

            </span>

          </div>

          <div className="progress-line">

            <div

              className="progress-fill"

              style={{width:"80%"}}

            ></div>

          </div>

        </div>

      </div>

    </aside>

  );

}

export default Sidebar;