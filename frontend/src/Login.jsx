import "./Login.css";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "./services/authService";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMicrosoft,
  FaUsers,
  FaRobot,
  FaFileAlt
} from "react-icons/fa";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  

  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
  const rememberedEmail = localStorage.getItem("rememberEmail");

  if (rememberedEmail) {
    setEmail(rememberedEmail);
    setRememberMe(true);
  }
}, []);
  

  const handleLogin = async () => {

    if (!email || !password) {

      toast.error("Please fill all fields");

      return;

    }

    try {

      setLoading(true);

      const data = await loginUser({

        email,

        password

      });
      console.log("LOGIN RESPONSE", data);
console.log("USER OBJECT", data.user);
console.log("CANDIDATE ID", data.user.candidateId);

      localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));
localStorage.setItem(
  "userId",
  data.user.candidateId
);
localStorage.setItem("role", data.user.role);

      if (rememberMe) {

        localStorage.setItem("rememberEmail", email);

      } else {

        localStorage.removeItem("rememberEmail");

      }

      toast.success("Login Successful");

      const role = data.user.role;

      setTimeout(() => {

        if (role === "admin") {

          navigate("/admin");

        }

        else if (role === "recruiter") {

          navigate("/recruiter");

        }

        else {

          navigate("/dashboard");

        }

      }, 700);

    }

    catch (error) {

      toast.error(
  error.message ||
  error.response?.data?.message ||
  "Login Failed"
);

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-page">

      <div className="login-container">

        <div className="login-left">

          <div className="overlay">

            <h1>

              Build Better Teams

            </h1>

            <p>

              AI Powered Hiring Platform built for Recruiters, Candidates and Administrators.

            </p>

            <div className="feature-list">

              <div className="feature">

                <FaUsers />

                <div>

                  <h3>

                    Smart Hiring

                  </h3>

                  <p>

                    Manage hiring faster with AI powered ATS.

                  </p>

                </div>

              </div>

              <div className="feature">

                <FaRobot />

                <div>

                  <h3>

                    Resume Parsing

                  </h3>

                  <p>

                    Automatically analyze candidate resumes.

                  </p>

                </div>

              </div>

              <div className="feature">

                <FaFileAlt />

                <div>

                  <h3>

                    Application Tracking

                  </h3>

                  <p>

                    Track every application from one dashboard.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className="login-right">

          <div className="login-card">

            <h2>

              Welcome Back 👋

            </h2>

            <p>

              Sign in to continue using AmbiDer ATS

            </p>

            <div className="input-group">

              <label>

                Email Address

              </label>

              <div className="input-box">

                <FaEnvelope className="input-icon" />

                <input

                  type="email"

                  placeholder="Enter your email"

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                />

              </div>

            </div>

            <div className="input-group">

              <label>

                Password

              </label>

              <div className="input-box">

                <FaLock className="input-icon" />

                <input

                  type={showPassword ? "text" : "password"}

                  placeholder="Enter your password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                />

                <button

                  type="button"

                  className="eye-btn"

                  onClick={() => setShowPassword(!showPassword)}

                >

                  {

                    showPassword ?

                      <FaEyeSlash />

                      :

                      <FaEye />

                  }

                </button>

              </div>

            </div>

                        <div className="login-options">

              <label className="remember">

                <input

                  type="checkbox"

                  checked={rememberMe}

                  onChange={(e) => setRememberMe(e.target.checked)}

                />

                Remember Me

              </label>

              <Link

                to="#"

                className="forgot-link"

              >

                Forgot Password?

              </Link>

            </div>

            <button

              className="login-btn"

              onClick={handleLogin}

              disabled={loading}

            >

              {

                loading

                  ? "Signing In..."

                  : "Sign In"

              }

            </button>

            <div className="divider">

              <span>

                OR

              </span>

            </div>

            

            <div className="register-section">

              <p>

                Don't have an account?

                <Link to="/register">

                  Create Account

                </Link>

              </p>

            </div>

          </div>

        </div>

              </div>

    </div>

  );

}

export default Login;