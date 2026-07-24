import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({

  children,

  allowedRoles = []

}) {

  const location = useLocation();

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================
  // User not logged in
  // ==========================

  if (!token || !user) {

    return (

      <Navigate

        to="/login"

        state={{ from: location }}

        replace

      />

    );

  }

  // ==========================
  // Invalid user object
  // ==========================

  if (!user.role) {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    return (

      <Navigate

        to="/login"

        replace

      />

    );

  }

  // ==========================
  // Role Protection
  // ==========================

  if (

    allowedRoles.length > 0 &&

    !allowedRoles.includes(user.role)

  ) {

    switch (user.role) {

      case "admin":

        return <Navigate to="/admin" replace />;

      case "recruiter":

        return <Navigate to="/recruiter" replace />;

      case "candidate":

        return <Navigate to="/dashboard" replace />;

      default:

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        return <Navigate to="/login" replace />;

    }

  }

  return children;

}

export default ProtectedRoute;