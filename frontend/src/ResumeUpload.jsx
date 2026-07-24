import "./ResumeUpload.css";
import DashboardLayout from "./DashboardLayout";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaCloudUploadAlt,
  FaCheckCircle,
  FaUserTie,
  FaEye,
  FaDownload
} from "react-icons/fa";

import { uploadResume } from "./services/candidateService";

function ResumeUpload() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [resume, setResume] = useState(null);

  const [previewUrl, setPreviewUrl] = useState("");

  const [parsedResume, setParsedResume] = useState(null);

  const [formData, setFormData] = useState({

    name: "",

    email: "",

    phone: "",

    jobRole: "",

    experience: "",

    company: "",

    skills: "",

    linkedin: "",

    portfolio: "",

    expectedCTC: "",

    noticePeriod: ""

  });

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value

    });

  };

  const handleResume = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [

      "application/pdf",

      "application/msword",

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

      "image/jpeg",

      "image/png",

      "image/jpg"

    ];

    if (!allowedTypes.includes(file.type)) {

      toast.error("Only PDF, DOC, DOCX, JPG & PNG files are allowed.");

      return;

    }

    if (file.size > 10 * 1024 * 1024) {

      toast.error("Maximum file size is 10 MB.");

      return;

    }

    setResume(file);

    setPreviewUrl(URL.createObjectURL(file));

    toast.success("Resume Selected");

  };

    const handleSubmit = async () => {

    if (

      !formData.name ||

      !formData.email ||

      !formData.phone ||

      !formData.jobRole ||

      !resume

    ) {

      toast.error("Please fill all required fields.");

      return;

    }

    const uploadData = new FormData();

    Object.keys(formData).forEach((key) => {

      uploadData.append(key, formData[key]);

    });

    uploadData.append("resume", resume);

    try {

      setLoading(true);

      const response = await uploadResume(uploadData);

      /*
        Expected Backend Response

        {
          message,
          resumeUrl,
          parsedResume
        }
      */

      if (response?.resumeUrl) {

        setPreviewUrl(response.resumeUrl);

      }

      if (response?.parsedResume) {

        setParsedResume(response.parsedResume);

      }

      toast.success(

        response?.message ||

        "Resume Uploaded Successfully"

      );

      setTimeout(() => {

        navigate("/dashboard");

      }, 1200);

    }

    catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Resume Upload Failed"

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <DashboardLayout role="candidate">

      <div className="resume-page">

        <div className="resume-left">

          <div className="resume-banner">

            <div className="resume-icon">

              <FaUserTie />

            </div>

            <h1>

              Upload Your Resume

            </h1>

            <p>

              Create a professional profile and let recruiters discover your talent faster.

            </p>

            <div className="resume-tips">

              <div className="tip">

                <FaCheckCircle />

                <span>

                  ATS Friendly Resume Format

                </span>

              </div>

              <div className="tip">

                <FaCheckCircle />

                <span>

                  Keep Resume Size Under 10 MB

                </span>

              </div>

              <div className="tip">

                <FaCheckCircle />

                <span>

                  Include Latest Projects & Skills

                </span>

              </div>

              <div className="tip">

                <FaCheckCircle />

                <span>

                  Professional Resume Improves Selection Chances

                </span>

              </div>

            </div>

          </div>

        </div>

        <div className="resume-right">

          <div className="resume-card">

            <h2>

              Candidate Information

            </h2>

            <p>

              Fill your professional information before submitting your application.

            </p>

            <div className="form-grid">

              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={handleChange}
              />

              <input
                type="text"
                name="jobRole"
                placeholder="Job Role Applying For *"
                value={formData.jobRole}
                onChange={handleChange}
              />

              <input
                type="text"
                name="experience"
                placeholder="Years of Experience"
                value={formData.experience}
                onChange={handleChange}
              />

              <input
                type="text"
                name="company"
                placeholder="Current Company"
                value={formData.company}
                onChange={handleChange}
              />

              <input
                type="text"
                name="skills"
                placeholder="Skills"
                value={formData.skills}
                onChange={handleChange}
              />

              <input
                type="text"
                name="linkedin"
                placeholder="LinkedIn Profile URL"
                value={formData.linkedin}
                onChange={handleChange}
              />

              <input
                type="text"
                name="portfolio"
                placeholder="Portfolio / GitHub URL"
                value={formData.portfolio}
                onChange={handleChange}
              />

              <input
                type="text"
                name="expectedCTC"
                placeholder="Expected CTC"
                value={formData.expectedCTC}
                onChange={handleChange}
              />

              <input
                type="text"
                name="noticePeriod"
                placeholder="Notice Period"
                value={formData.noticePeriod}
                onChange={handleChange}
              />

            </div>

            <div className="upload-section">

              <label className="upload-box">

                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleResume}
                />

                <FaCloudUploadAlt className="upload-icon" />

                <h3>

                  Drag & Drop Resume

                </h3>

                <p>

                  or Click to Upload

                </p>

                <span>

                  PDF • DOC • DOCX • JPG • PNG

                </span>

                <small>

                  Maximum Size : 10 MB

                </small>

              </label>

                            {resume && (

                <div className="selected-file">

                  <FaCheckCircle className="success-icon" />

                  <div>

                    <h4>{resume.name}</h4>

                    <p>

                      {(resume.size / (1024 * 1024)).toFixed(2)} MB

                    </p>

                  </div>

                </div>

              )}

              {/* Resume Preview */}

              {previewUrl && (

                <div className="resume-preview-card">

                  <div className="preview-header">

                    <h3>

                      Resume Preview

                    </h3>

                    <a

                      href={previewUrl}

                      target="_blank"

                      rel="noreferrer"

                      className="download-link"

                    >

                      <FaDownload />

                      Download

                    </a>

                  </div>

                  <div className="preview-body">

                    <FaEye className="preview-icon" />

                    <p>

                      Resume uploaded successfully.

                    </p>

                    <small>

                      Preview will be available after backend integration.

                    </small>

                  </div>

                </div>

              )}

              {/* Parsed Resume */}

              <div className="parsed-resume-card">

                <h3>

                  Parsed Resume

                </h3>

                {

                  parsedResume ? (

                    <div className="parsed-data">

                      <p>

                        <strong>Name :</strong> {parsedResume.name}

                      </p>

                      <p>

                        <strong>Email :</strong> {parsedResume.email}

                      </p>

                      <p>

                        <strong>Phone :</strong> {parsedResume.phone}

                      </p>

                      <p>

                        <strong>Skills :</strong> {parsedResume.skills?.join(", ")}

                      </p>

                      <p>

                        <strong>Experience :</strong> {parsedResume.experience}

                      </p>

                    </div>

                  ) : (

                    <div className="parsed-placeholder">

                      <FaCheckCircle />

                      <p>

                        Resume parsing will automatically appear here after backend integration.

                      </p>

                    </div>

                  )

                }

              </div>

              <div className="resume-footer">

                <div className="resume-note">

                  <FaCheckCircle />

                  <p>

                    Your resume is securely stored and is only visible to authorized recruiters.

                  </p>

                </div>

                <button

                  className="submit-btn"

                  onClick={handleSubmit}

                  disabled={loading}

                >

                  {

                    loading

                      ? "Uploading Resume..."

                      : "Submit Application"

                  }

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

}

export default ResumeUpload;