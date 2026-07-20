import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import styles from './PostJobPage.module.css';
import Header from '../../components/Header';
import { Briefcase } from '@phosphor-icons/react';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && isLocal)
  ? import.meta.env.VITE_API_BASE_URL
  : 'https://freelancemarketplace-backend.onrender.com';

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const SUB_CATEGORIES_MAP = {
  'Design': ['UI/UX Design', 'Branding & Identity', 'Graphic Design', 'Motion Graphics & Animation', 'Product Design'],
  'Development': ['Web Development', 'Mobile App Development', 'Backend / API Development', 'Full-Stack Development', 'QA & Testing'],
  'Data Analyst': ['Business Intelligence', 'Data Visualization', 'Data Engineering', 'Machine Learning & AI', 'Statistical Analysis'],
  'Writing & Translation': ['Content Writing', 'Copywriting', 'Technical Writing', 'Translation & Localization', 'Editing & Proofreading'],
  'DevOps': ['CI/CD & Automation', 'Cloud Infrastructure', 'Site Reliability / Monitoring', 'Containerization (Docker/K8s)', 'Security & Compliance Engineering'],
  'Accounting & Finance': ['Bookkeeping', 'Tax Advisory', 'Financial Planning & Analysis', 'Audit & Assurance', 'Payroll Management'],
  'Sales & Marketing': ['Digital Marketing', 'SEO/SEM', 'Social Media Management', 'Sales Strategy & Lead Gen', 'Market Research'],
  'Human Resources': ['Recruitment & Talent Acquisition', 'HR Policy & Compliance', 'Payroll & Benefits Admin', 'Employee Training & L&D', 'Organizational Development'],
  'Legal & Compliance': ['ISO Certification', 'Regulatory Compliance', 'Contract Law', 'IP & Trademark', 'Corporate Governance'],
  'Operations & Management': ['Process Optimization', 'Project Management', 'Supply Chain & Logistics', 'Quality Management (TQM)', 'Business Strategy']
};

const SUGGESTED_SKILLS_MAP = {
  'Design': ['Figma', 'UI/UX Design', 'Branding', 'Adobe Illustrator', 'Wireframing'],
  'Development': ['React', 'Node.js', 'TypeScript', 'Next.js', 'PostgreSQL', 'TailwindCSS'],
  'Data Analyst': ['Python', 'SQL', 'Tableau', 'Pandas', 'PowerBI', 'Data Engineering'],
  'Writing & Translation': ['Copywriting', 'SEO Writing', 'Content Strategy', 'Proofreading', 'Technical Writing'],
  'DevOps': ['Docker', 'AWS', 'CI/CD', 'Kubernetes', 'GitHub Actions', 'Terraform'],
  'Accounting & Finance': ['QuickBooks', 'Excel', 'Financial Modeling', 'Tax Prep', 'Bookkeeping'],
  'Sales & Marketing': ['SEO', 'Google Analytics', 'Copywriting', 'Social Media Ads', 'Email Marketing'],
  'Human Resources': ['Recruiting', 'Onboarding', 'HR Policies', 'Talent Sourcing', 'Compensation'],
  'Legal & Compliance': ['Contract Drafting', 'Compliance Audit', 'IP Law', 'NDA Drafting', 'GDPR'],
  'Operations & Management': ['Agile / Scrum', 'Project Management', 'Jira', 'Process Mapping', 'Operations Strategy']
};

const CATEGORY_ICONS = {
  'Design': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v8M8 12h8"/>
    </svg>
  ),
  'Development': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  'Data Analyst': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  'Writing & Translation': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  ),
  'DevOps': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <path d="M22 12c0-3.3-2.7-6-6-6-2.2 0-4.1 1.2-5 3C10.1 7.2 8.2 6 6 6 2.7 6 0 8.7 0 12s2.7 6 6 6c2.2 0 4.1-1.2 5-3 .9 1.8 2.8 3 5 3 3.3 0 6-2.7 6-6z"/>
    </svg>
  ),
  'Accounting & Finance': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  'Sales & Marketing': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <path d="M12 2L2 22h20L12 2z"/>
    </svg>
  ),
  'Human Resources': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  'Legal & Compliance': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <path d="M12 2v20M17 5H7M19 12H5M21 19H3"/>
    </svg>
  ),
  'Operations & Management': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.categoryIconSvg}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
};

export default function PostJobPage() {
  const navigate = useNavigate();

  // Load user session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Client') {
      alert("Only Hiring Clients (HR/CXO) can post job listings.");
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Wizard active step
  const [activeStep, setActiveStep] = useState(1);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Development');
  const [subcategory, setSubcategory] = useState('Web Development');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (category && SUB_CATEGORIES_MAP[category]) {
      setSubcategory(SUB_CATEGORIES_MAP[category][0]);
    } else {
      setSubcategory('');
    }
  }, [category]);
  const [skills, setSkills] = useState([]);
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('3 Months');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyLogo, setCompanyLogo] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !preset || cloudName === 'your_cloud_name') {
      alert("Cloudinary configuration missing in .env.");
      return;
    }
    
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset);
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setCompanyLogo(data.secure_url);
      } else {
        alert("Failed to upload logo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Validations warnings state
  const [validationErrors, setValidationErrors] = useState({});

  // Tag chip builder handlers
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/,/g, '');
      if (cleaned && !skills.includes(cleaned) && skills.length < 5) {
        setSkills([...skills, cleaned]);
        setTagInput('');
      }
    }
  };

  const removeSkillTag = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  // Step validation helpers
  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (title.trim().length < 10) {
        errors.title = 'Project Title must have at least 10 characters.';
      }
      if (skills.length === 0) {
        errors.skills = 'Please add at least 1 skill tag required for this project.';
      }
    } else if (step === 2) {
      if (!budget || parseFloat(budget) <= 0) {
        errors.budget = 'Please enter a valid positive project budget (₹).';
      }
    } else if (step === 3) {
      if (description.trim().length < 20) {
        errors.description = 'Please enter a detailed project description (minimum 20 characters).';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePublish = async () => {
    if (!agreedToTerms) {
      alert("Please agree to the milestone verification and escrow terms before publishing.");
      return;
    }
    if (isPublishing) return;

    setIsPublishing(true);
    const jobPayload = {
      id: generateUUID(),
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(budget),
      category: category,
      subcategory: subcategory,
      seller_id: currentUser.id,
      listing_type: 'job',
      emoji: '💼',
      skills: subcategory ? [...skills, `subcategory:${subcategory}`] : skills,
      delivery_days: duration === '1 Month' ? 30 : duration === '6+ Months' ? 180 : 90,
      sales: 0,
      images: companyLogo ? [companyLogo] : []
    };

    try {
      const response = await fetch(`${API_BASE_URL}/listings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobPayload)
      });
      if (response.ok) {
        alert("Project job posted successfully! Freelancers can now view it.");
        navigate('/dashboard');
      } else {
        alert("Server error: Failed to publish project job.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to reach database.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGenerateSkeleton = () => {
    const skeleton = `# Project Overview\n[Describe the goal of this project and what needs to be built]\n\n# Key Responsibilities\n- Deliverable 1: ...\n- Deliverable 2: ...\n\n# Required Skills & Qualifications\n- Skill 1: ...\n- Skill 2: ...\n\n# Estimated Timeline & Milestones\n- Milestone 1 (Week 1): ...\n- Milestone 2 (Week 2): ...`;
    setDescription(skeleton);
  };

  const handleGenerateAIDescription = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("Please add VITE_GEMINI_API_KEY in your frontend/.env file.");
      return;
    }

    setIsGenerating(true);
    setDescription("Writing job description using Gemini AI...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Write a detailed, structured markdown job description for: ${title.trim() || "Web Development Project"}. Category: ${category}. Required Skills: ${skills.join(", ")}. Budget: ${budget ? `₹${parseFloat(budget).toLocaleString('en-IN')}` : "Competitive"}. Duration: ${duration}. Do not include conversational intros.`;

      const result = await model.generateContent(prompt);
      const cleaned = result.response.text().replace(/^[ \t]*#+[ \t]*/gm, '');
      setDescription(cleaned);
    } catch (err) {
      console.error(err);
      alert("Error generating description: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className={styles.pageWrapper}>
      {/* Navbar header */}
      <Header activeTab="Post a Project" />

      {/* Wizard container */}
      <main className={styles.mainContainer}>
        <div className={styles.wizardCard}>
          
          {/* Header Progress Indicators */}
          <div className={styles.wizardProgressRow}>
            {[1, 2, 3, 4].map((stepNum) => {
              const isCompleted = activeStep > stepNum;
              const isActive = activeStep === stepNum;
              const stepClass = `${styles.stepIndicator} ${isCompleted ? styles.stepIndicatorCompleted : ''} ${isActive ? styles.stepIndicatorActive : ''}`;
              return (
                <div key={stepNum} className={stepClass}>
                  <div className={styles.indicatorCircle}>
                    {isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : stepNum}
                  </div>
                  <span className={styles.indicatorLabel}>
                    {stepNum === 1 ? 'Overview' : stepNum === 2 ? 'Budget' : stepNum === 3 ? 'Description' : 'Publish'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.divider} />

          {/* Step 1: Overview */}
          {activeStep === 1 && (
            <div className={styles.stepContainer}>
              <h2 className={styles.stepTitle}>Let's start with a clear project title</h2>
              <p className={styles.stepSubtitle}>HR/Hiring Clients specify project scope, roles, and category.</p>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Title</label>
                <input 
                  type="text" 
                  className={styles.formInput} 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior React Developer needed for 3-month SaaS expansion"
                />
                {validationErrors.title && <span className={styles.errorText}>{validationErrors.title}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Category</label>
                <div className={styles.categoryGrid}>
                  {Object.keys(SUB_CATEGORIES_MAP).map((cat) => {
                    const isActive = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`${styles.categoryCard} ${isActive ? styles.categoryCardActive : ''}`}
                        onClick={() => setCategory(cat)}
                      >
                        <span className={styles.categoryIcon}>
                          {CATEGORY_ICONS[cat]}
                        </span>
                        <span className={styles.categoryName}>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {category && SUB_CATEGORIES_MAP[category] && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Project Subcategory</label>
                  <div className={styles.subcategoryGrid}>
                    {SUB_CATEGORIES_MAP[category].map((sub) => {
                      const isActive = subcategory === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          className={`${styles.subcategoryCard} ${isActive ? styles.subcategoryCardActive : ''}`}
                          onClick={() => setSubcategory(sub)}
                        >
                          <span className={styles.checkboxIndicator}>
                            {isActive && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Key Skills Required (Max 5)</label>
                <input 
                  type="text" 
                  className={styles.formInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type a skill (e.g. React) and press Enter or Comma"
                />
                {validationErrors.skills && <span className={styles.errorText}>{validationErrors.skills}</span>}
                
                {/* Suggested skills based on selected category */}
                {category && SUGGESTED_SKILLS_MAP[category] && (
                  <div className={styles.suggestedSkillsContainer}>
                    {SUGGESTED_SKILLS_MAP[category]
                      .filter(skill => !skills.includes(skill) && skills.length < 5)
                      .map(skill => (
                        <button 
                          key={skill}
                          type="button"
                          className={styles.suggestedTagBtn}
                          onClick={() => setSkills([...skills, skill])}
                        >
                          + {skill}
                        </button>
                      ))
                    }
                  </div>
                )}
                
                {skills.length > 0 && (
                  <div className={styles.skillsTagRow}>
                    {skills.map((skill, idx) => (
                      <span key={idx} className={styles.skillTagBadge}>
                        {skill}
                        <button type="button" onClick={() => removeSkillTag(idx)} className={styles.skillTagCloseBtn}>
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Company Logo (Optional)</label>
                <div className={styles.logoUploadContainer}>
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo Preview" className={styles.logoPreview} />
                  ) : (
                    <div className={styles.logoPreview} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-light)' }}>
                      <Briefcase size={32} weight="duotone" style={{ color: 'var(--color-text-muted)' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="file" 
                        id="logo-file-input" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        style={{ display: 'none' }}
                      />
                      <button 
                        type="button" 
                        className={styles.logoUploadBtn}
                        onClick={() => document.getElementById('logo-file-input').click()}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? 'Uploading...' : '📁 Upload Logo'}
                      </button>
                      {companyLogo && (
                        <button 
                          type="button" 
                          className={styles.logoUploadBtn}
                          style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                          onClick={() => setCompanyLogo('')}
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder="Or paste company logo image URL"
                      value={companyLogo}
                      onChange={(e) => setCompanyLogo(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Duration */}
          {activeStep === 2 && (
            <div className={styles.stepContainer}>
              <h2 className={styles.stepTitle}>Define budget and timeline requirements</h2>
              <p className={styles.stepSubtitle}>Provide project rates to match with candidate freelancers.</p>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Budget (₹)</label>
                <input 
                  type="number" 
                  className={styles.formInput} 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  min="1"
                />
                {validationErrors.budget && <span className={styles.errorText}>{validationErrors.budget}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Estimated Duration</label>
                <div className={styles.durationSelector}>
                  {[
                    { id: '1 Month', label: '1 Month or less', desc: 'Quick deliverables, MVP development' },
                    { id: '3 Months', label: '3 Months', desc: 'Standard contract, feature expansions' },
                    { id: '6+ Months', label: '6+ Months', desc: 'Long-term retrained engagement' }
                  ].map((dur) => {
                    const isActive = duration === dur.id;
                    return (
                      <button
                        key={dur.id}
                        type="button"
                        className={`${styles.durationBox} ${isActive ? styles.durationBoxActive : ''}`}
                        onClick={() => setDuration(dur.id)}
                      >
                        <div className={styles.durationTitle}>{dur.label}</div>
                        <div className={styles.durationDesc}>{dur.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Description */}
          {activeStep === 3 && (
            <div className={styles.stepContainer}>
              <h2 className={styles.stepTitle}>Describe project deliverables and scope</h2>
              <p className={styles.stepSubtitle}>Be specific about tools, timelines, and candidate expectations.</p>
              
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className={styles.formLabel} style={{ margin: 0 }}>Job Description</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      onClick={handleGenerateSkeleton}
                      style={{ fontSize: 'var(--font-size-label)', padding: '4px 10px', border: '1px solid #D1D5DB', borderRadius: 'var(--border-radius-pill)', color: '#555555', backgroundColor: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
                    >
                      📝 Skeleton Outline
                    </button>
                    <button 
                      type="button" 
                      onClick={handleGenerateAIDescription}
                      disabled={isGenerating}
                      style={{ fontSize: 'var(--font-size-label)', padding: '4px 10px', border: '1px solid var(--color-accent-orange, #FF6B35)', borderRadius: 'var(--border-radius-pill)', color: '#FFFFFF', backgroundColor: 'var(--color-accent-orange, #FF6B35)', fontWeight: 700, cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}
                    >
                      {isGenerating ? '⏳ Generating...' : '✨ Generate with AI'}
                    </button>
                  </div>
                </div>
                <textarea 
                  className={styles.formTextarea} 
                  rows="6"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please write detailed expectations. E.g. We require a frontend developer to build dashboard features using Vite, React Router, and context API. Estimated milestone timeline is..."
                  disabled={isGenerating}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>
                  <span className={description.trim().length >= 20 ? styles.checkboxLabelActive : ''}>
                    {description.trim().length} characters written {description.trim().length >= 20 ? '✓' : ''}
                  </span>
                  <span>Minimum 20 required</span>
                </div>
                {validationErrors.description && <span className={styles.errorText}>{validationErrors.description}</span>}
              </div>
            </div>
          )}

          {/* Step 4: Publish Review */}
          {activeStep === 4 && (
            <div className={styles.stepContainer}>
              <h2 className={styles.stepTitle}>Review your project job post</h2>
              <p className={styles.stepSubtitle}>Verify all details before publishing to the freelancer job board.</p>
              
              <div className={styles.summaryCard}>
                <div className={styles.summaryTitleRow}>
                  {companyLogo ? (
                    <img src={companyLogo} alt="Company Logo" className={styles.companyLogoPreview} />
                  ) : (
                    <div className={styles.summaryIconContainer}>
                      <Briefcase size={24} weight="duotone" />
                    </div>
                  )}
                  <h3 className={styles.summaryTitle}>{title}</h3>
                </div>
                
                <p className={styles.summaryDesc}>{description}</p>
                
                <div className={styles.summarySpecsGrid}>
                  <div className={styles.specBox}>
                    <span className={styles.specLabel}>Estimated Budget</span>
                    <span className={styles.specVal}>₹{parseFloat(budget).toLocaleString('en-IN')}</span>
                  </div>
                  <div className={styles.specBox}>
                    <span className={styles.specLabel}>Duration</span>
                    <span className={styles.specVal}>{duration}</span>
                  </div>
                  <div className={styles.specBox}>
                    <span className={styles.specLabel}>Category</span>
                    <span className={styles.specVal}>{category}</span>
                  </div>
                </div>

                {skills.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <span className={styles.specLabel} style={{ display: 'block', marginBottom: '8px' }}>Skills Required</span>
                    <div className={styles.skillsTagRow}>
                      {skills.map((skill, idx) => (
                        <span key={idx} className={styles.skillTagBadge} style={{ backgroundColor: '#F3F4F6' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.termsCheckboxGroup} onClick={() => setAgreedToTerms(!agreedToTerms)}>
                <input 
                  type="checkbox" 
                  className={styles.checkboxInput}
                  checked={agreedToTerms}
                  onChange={() => {}} // handled by parent click
                />
                <span className={`${styles.checkboxLabel} ${agreedToTerms ? styles.checkboxLabelActive : ''}`}>
                  I agree to verify milestone deliverables and release project escrow funds securely through the AdFreelancin transaction workspace.
                </span>
              </div>
            </div>
          )}

          {/* Actions button footer row */}
          <div className={styles.actionsFooterRow}>
            <button 
              className={styles.btnBack} 
              onClick={handleBack}
              disabled={isPublishing}
            >
              Back
            </button>
            {activeStep < 4 ? (
              <button 
                className={styles.btnNext} 
                onClick={handleNext}
              >
                Next Step
              </button>
            ) : (
              <button 
                className={styles.btnPublish} 
                onClick={handlePublish}
                disabled={!agreedToTerms || isPublishing}
              >
                {isPublishing ? (
                  <>
                    <div className={styles.spinner} />
                    <span>Publishing...</span>
                  </>
                ) : 'Publish Job Post'}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
