import "./CreateJob.css";
import DashboardLayout from "./DashboardLayout";
import { useState } from "react";
import axios from "axios";

function CreateJob() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    employmentType: "",
    experience: "",
    salary: "",
    category: "",
    skills: "",
    vacancies: "",
    lastDate: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/jobs",
      {
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.skills
          .split(",")
          .map((skill) => skill.trim()),
        location: formData.location,
        experience: formData.experience,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Job published successfully!");

    setFormData({
      title: "",
      company: "",
      location: "",
      employmentType: "",
      experience: "",
      salary: "",
      category: "",
      skills: "",
      vacancies: "",
      lastDate: "",
      description: "",
      responsibilities: "",
      requirements: "",
      benefits: "",
    });

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Error publishing job");
  }
};

  return (
    <DashboardLayout role="recruiter">
      <div className="create-job-page">

        <div className="create-job-header">
          <h1>Create New Job</h1>
          <p>
            Fill all the required details to publish a new job opening.
          </p>
        </div>

        <form className="create-job-form" onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            placeholder="Job Title *"
            value={formData.title}
            onChange={handleChange}
          />

          <input
            type="text"
            name="company"
            placeholder="Company Name *"
            value={formData.company}
            onChange={handleChange}
          />

          <input
            type="text"
            name="location"
            placeholder="Location *"
            value={formData.location}
            onChange={handleChange}
          />

         <select
  name="employmentType"
  value={formData.employmentType}
  onChange={handleChange}
>
  <option value="">Select Employment Type</option>
  <option value="Full Time">Full Time</option>
  <option value="Part Time">Part Time</option>
  <option value="Internship">Internship</option>
  <option value="Contract">Contract</option>
  <option value="Remote">Remote</option>
</select>

          <input
            type="text"
            name="experience"
            placeholder="Experience"
            value={formData.experience}
            onChange={handleChange}
          />

          <input
            type="text"
            name="salary"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
          />

         <select
  name="category"
  value={formData.category}
  onChange={handleChange}
>
  <option value="">Select Category</option>
  <option value="Frontend Development">Frontend Development</option>
  <option value="Backend Development">Backend Development</option>
  <option value="Full Stack Development">Full Stack Development</option>
  <option value="UI/UX Design">UI/UX Design</option>
  <option value="Data Science">Data Science</option>
  <option value="DevOps">DevOps</option>
  <option value="Mobile Development">Mobile Development</option>
</select>

          <input
            type="text"
            name="skills"
            placeholder="Required Skills"
            value={formData.skills}
            onChange={handleChange}
          />

          <input
            type="number"
            name="vacancies"
            placeholder="Vacancies"
            value={formData.vacancies}
            onChange={handleChange}
          />

          <input
            type="date"
            name="lastDate"
            value={formData.lastDate}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleChange}
          />

          <textarea
            name="responsibilities"
            placeholder="Responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
          />

          <textarea
            name="requirements"
            placeholder="Requirements"
            value={formData.requirements}
            onChange={handleChange}
          />

          <textarea
            name="benefits"
            placeholder="Benefits"
            value={formData.benefits}
            onChange={handleChange}
          />

          <div className="button-group">

  <button
    type="button"
    className="cancel-btn"
  >
    Cancel
  </button>

  <button
    type="button"
    className="draft-btn"
  >
    Save Draft
  </button>

  <button
    type="submit"
    className="publish-btn"
  >
    Publish Job
  </button>

</div>

        </form>

      </div>
    </DashboardLayout>
  );
}

export default CreateJob;