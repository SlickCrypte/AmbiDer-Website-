import "./EmptyState.css";

import {
  FaInbox,
  FaSearch,
  FaBriefcase,
  FaUsers,
  FaBell,
  FaFileAlt,
} from "react-icons/fa";

function EmptyState({

  type = "default",

  title = "Nothing Found",

  description = "There is currently no data available.",

  buttonText,

  onButtonClick,

}) {

  const getIcon = () => {

    switch (type) {

      case "jobs":
        return <FaBriefcase />;

      case "candidate":
        return <FaUsers />;

      case "notification":
        return <FaBell />;

      case "resume":
        return <FaFileAlt />;

      case "search":
        return <FaSearch />;

      default:
        return <FaInbox />;

    }

  };

  return (

    <div className="empty-state">

      <div className="empty-icon">

        {getIcon()}

      </div>

      <h2>

        {title}

      </h2>

      <p>

        {description}

      </p>

            {buttonText && (

        <button
          className="empty-btn"
          onClick={onButtonClick}
        >

          {buttonText}

        </button>

      )}

    </div>

  );

}

export default EmptyState;