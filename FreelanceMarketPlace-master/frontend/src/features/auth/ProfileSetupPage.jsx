import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileSetupPage.module.css';
import Header from '../../components/Header';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && isLocal)
  ? import.meta.env.VITE_API_BASE_URL
  : 'https://freelancemarketplace-backend.onrender.com';

const FREELANCER_CATEGORIES = [
  'Development',
  'Design',
  'Data Analyst',
  'Writing & Translation',
  'DevOps',
  'Accounting & Finance',
  'Sales & Marketing',
  'Human Resources',
  'Legal & Compliance',
  'Operations & Management'
];

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

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.is_profile_setup) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  const [selectedAccountType, setSelectedAccountType] = useState(currentUser?.account_type || 'freelancer_seller');
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState(() =>
    (currentUser?.skills || []).filter(s => !s.startsWith('subcategory:'))
  );
  const [skillInput, setSkillInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState('2000');
  const [selectedCategories, setSelectedCategories] = useState(() => 
    currentUser?.category ? currentUser.category.split(',').map(c => c.trim()) : []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState(() => {
    const fromSkills = (currentUser?.skills || []).filter(s => s.startsWith('subcategory:')).map(s => s.replace('subcategory:', ''));
    if (fromSkills.length > 0) return fromSkills;
    return currentUser?.subcategory ? currentUser.subcategory.split(',').map(s => s.trim()) : [];
  });

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => {
      const isChecked = prev.includes(cat);
      const updated = isChecked ? prev.filter(c => c !== cat) : [...prev, cat];
      if (isChecked) {
        const subsToRemove = SUB_CATEGORIES_MAP[cat] || [];
        setSelectedSubcategories(sPrev => sPrev.filter(s => !subsToRemove.includes(s)));
      }
      return updated;
    });
  };

  const handleSubcategoryToggle = (sub) => {
    setSelectedSubcategories(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };
  
  const [githubUrl, setGithubUrl] = useState(currentUser?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser?.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser?.portfolio_url || '');
  
  // Fractional Engagement States
  const [engagementType, setEngagementType] = useState('task');
  const [monthlyRate, setMonthlyRate] = useState('50000');
  const [hoursPerWeek, setHoursPerWeek] = useState('10');
  const [minimumCommitmentMonths, setMinimumCommitmentMonths] = useState('3');
  const [domain, setDomain] = useState('CTO');
  
  const [errors, setErrors] = useState({});

  if (!currentUser) return null;

  const isFreelancer = selectedAccountType === 'freelancer_seller' || selectedAccountType === 'seller_only';

  // Dynamic Step List
  const getSteps = () => {
    if (isFreelancer) {
      return [
        { id: 1, name: 'Role' },
        { id: 2, name: 'Personal' },
        { id: 3, name: 'Expertise' },
        { id: 4, name: 'Rates & Bio' }
      ];
    } else {
      return [
        { id: 1, name: 'Role' },
        { id: 2, name: 'Personal' },
        { id: 3, name: 'Company Bio' }
      ];
    }
  };

  const steps = getSteps();

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  // Step validation check before proceeding
  const validateStep = (stepId) => {
    const errs = {};
    if (stepId === 2) {
      if (fullName.trim().length < 2) {
        errs.fullName = 'Name must be at least 2 characters.';
      }
      if (!location.trim()) {
        errs.location = 'Location is required.';
      }
    }
    if (isFreelancer && stepId === 3) {
      if (selectedCategories.length === 0) {
        errs.category = 'Please select at least one professional category.';
      }
      if (skills.length === 0) {
        errs.skills = 'Please add at least one core skill.';
      }
    }
    if (stepId === (isFreelancer ? 4 : 3)) {
      if (bio.trim().length < 20) {
        errs.bio = 'Please write a bio / summary of at least 20 characters.';
      }
      if (isFreelancer) {
        if (engagementType === 'task') {
          const rateNum = parseFloat(hourlyRate);
          if (isNaN(rateNum) || rateNum <= 0) {
            errs.hourlyRate = 'Please enter a valid hourly rate.';
          }
        } else {
          const mRateNum = parseFloat(monthlyRate);
          if (isNaN(mRateNum) || mRateNum <= 0) {
            errs.monthlyRate = 'Please enter a valid monthly rate.';
          }
          const hoursNum = parseInt(hoursPerWeek, 10);
          if (isNaN(hoursNum) || hoursNum <= 0) {
            errs.hoursPerWeek = 'Please enter valid hours per week.';
          }
          const commitmentNum = parseInt(minimumCommitmentMonths, 10);
          if (isNaN(commitmentNum) || commitmentNum <= 0) {
            errs.minimumCommitmentMonths = 'Please enter a valid commitment in months.';
          }
          if (!domain) {
            errs.domain = 'Domain tag selection is required.';
          }
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (!validateStep(currentStep)) return;

    const maxSteps = isFreelancer ? 4 : 3;
    if (currentStep < maxSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit(e);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const validate = () => {
    const errs = {};
    if (fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters.';
    }
    if (bio.trim().length < 20) {
      errs.bio = 'Please write a bio / summary of at least 20 characters.';
    }
    if (!location.trim()) {
      errs.location = 'Location is required.';
    }
    if (isFreelancer) {
      if (skills.length === 0) {
        errs.skills = 'Please add at least one core skill.';
      }
      if (engagementType === 'task') {
        const rateNum = parseFloat(hourlyRate);
        if (isNaN(rateNum) || rateNum <= 0) {
          errs.hourlyRate = 'Please enter a valid hourly rate.';
        }
      } else {
        const mRateNum = parseFloat(monthlyRate);
        if (isNaN(mRateNum) || mRateNum <= 0) {
          errs.monthlyRate = 'Please enter a valid monthly rate.';
        }
        const hoursNum = parseInt(hoursPerWeek, 10);
        if (isNaN(hoursNum) || hoursNum <= 0) {
          errs.hoursPerWeek = 'Please enter valid hours per week.';
        }
        const commitmentNum = parseInt(minimumCommitmentMonths, 10);
        if (isNaN(commitmentNum) || commitmentNum <= 0) {
          errs.minimumCommitmentMonths = 'Please enter a valid commitment in months.';
        }
        if (!domain) {
          errs.domain = 'Domain tag selection is required.';
        }
      }
      if (selectedCategories.length === 0) {
        errs.category = 'Please select at least one professional category.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const updatePayload = {
      full_name: fullName.trim(),
      bio: bio.trim(),
      location: location.trim(),
      github_url: githubUrl.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      portfolio_url: portfolioUrl.trim() || null,
      is_verified: true, // auto-verify on setup
      account_type: selectedAccountType,
      enabled_roles: [selectedAccountType],
      active_role: selectedAccountType
    };

    if (isFreelancer) {
      updatePayload.skills = [...skills, ...selectedSubcategories.map(s => `subcategory:${s}`)];
      updatePayload.category = selectedCategories.join(', ');
      updatePayload.subcategory = selectedSubcategories.join(', ');
      updatePayload.engagement_type = engagementType;
      
      if (engagementType === 'task') {
        updatePayload.hourly_rate = parseFloat(hourlyRate);
        updatePayload.monthly_rate = null;
        updatePayload.hours_per_week = null;
        updatePayload.minimum_commitment_months = null;
        updatePayload.domain = null;
      } else {
        updatePayload.hourly_rate = null;
        updatePayload.monthly_rate = parseFloat(monthlyRate);
        updatePayload.hours_per_week = parseInt(hoursPerWeek, 10);
        updatePayload.minimum_commitment_months = parseInt(minimumCommitmentMonths, 10);
        updatePayload.domain = domain;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        const subcategories = (updatedProfile.skills || []).filter(s => s.startsWith('subcategory:')).map(s => s.replace('subcategory:', ''));
        const cleanSkills = (updatedProfile.skills || []).filter(s => !s.startsWith('subcategory:'));
        const resolvedRole = selectedAccountType === 'client' ? 'Client' : selectedAccountType === 'seller_only' ? 'seller' : 'Freelancer';
        const updatedSession = {
          ...currentUser,
          ...updatedProfile,
          role: resolvedRole,
          subcategory: subcategories.join(', '),
          skills: cleanSkills,
          is_profile_setup: true
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedSession));
        alert("Profile setup completed successfully!");
        navigate('/dashboard');
      } else {
        alert("Failed to save profile setup details. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to save details.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Brand Header Navbar */}
      <Header />

      {/* Main Container */}
      <div className={styles.setupContainer}>
        <div className={styles.setupCard}>
          <h1 className={styles.title}>Complete Your Profile</h1>
          <p className={styles.subtitle}>
            Tell us more about yourself to customize your AdFreelancin experience.
          </p>

          {/* Stepper Progress bar */}
          <div className={styles.stepperContainer}>
            <div 
              className={styles.stepperProgressLine} 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s, idx) => {
              const isCompleted = idx + 1 < currentStep;
              const isActive = idx + 1 === currentStep;
              return (
                <div 
                  key={s.id}
                  className={`${styles.stepNode} ${isCompleted ? styles.stepNodeCompleted : ''} ${isActive ? styles.stepNodeActive : ''}`}
                >
                  <div className={styles.stepCircle}>
                    {isCompleted ? '✓' : s.id}
                  </div>
                  <span className={styles.stepName}>{s.name}</span>
                </div>
              );
            })}
          </div>
          
          <form onSubmit={handleNext}>
            {/* STEP 1: ROLE SELECTION */}
            {currentStep === 1 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Choose Your Path</h2>
                <p className={styles.stepIntro}>
                  First, select the account type that matches your goals. This configures your workspace dashboard.
                </p>
                <div className={styles.typeContainer} role="radiogroup" aria-label="Select Account Role type">
                  <button 
                    type="button"
                    className={`${styles.typeBox} ${selectedAccountType === 'client' ? styles.typeBoxActive : ''}`}
                    onClick={() => setSelectedAccountType('client')}
                    role="radio"
                    aria-checked={selectedAccountType === 'client'}
                  >
                    <span className={styles.roleIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.roleIconSvg}>
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                        <line x1="9" y1="22" x2="9" y2="16" />
                        <line x1="15" y1="22" x2="15" y2="16" />
                        <line x1="9" y1="16" x2="15" y2="16" />
                        <path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01" />
                      </svg>
                    </span>
                    <span className={styles.typeTitle}>Hiring Client</span>
                    <span className={styles.typeDesc}>Looking to hire contractors & procure verified work</span>
                  </button>
                  
                  <button 
                    type="button"
                    className={`${styles.typeBox} ${selectedAccountType === 'seller_only' ? styles.typeBoxActive : ''}`}
                    onClick={() => setSelectedAccountType('seller_only')}
                    role="radio"
                    aria-checked={selectedAccountType === 'seller_only'}
                  >
                    <span className={styles.roleIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.roleIconSvg}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </span>
                    <span className={styles.typeTitle}>Seller-only</span>
                    <span className={styles.typeDesc}>Sell assets & digital products on the marketplace</span>
                  </button>

                  <button 
                    type="button"
                    className={`${styles.typeBox} ${selectedAccountType === 'freelancer_seller' ? styles.typeBoxActive : ''}`}
                    onClick={() => setSelectedAccountType('freelancer_seller')}
                    role="radio"
                    aria-checked={selectedAccountType === 'freelancer_seller'}
                  >
                    <span className={styles.roleIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.roleIconSvg}>
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </span>
                    <span className={styles.typeTitle}>Freelancer + Seller</span>
                    <span className={styles.typeDesc}>Offer freelance services & list custom digital assets</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PERSONAL DETAILS */}
            {currentStep === 2 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Profile Identity</h2>
                <p className={styles.stepIntro}>
                  Set up your core personal details. Real identity values are recommended for trust-scoring metrics.
                </p>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    autoFocus
                  />
                  {errors.fullName && <p className={styles.error}>{errors.fullName}</p>}
                  <span className={styles.fieldHelp}>Use your official name for visual verification markers.</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Location</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, India"
                  />
                  {errors.location && <p className={styles.error}>{errors.location}</p>}
                  <span className={styles.fieldHelp}>Helps match you with clients in compatible regions.</span>
                </div>

                <h3 className={styles.sectionSubtitle}>Professional Profiles (Optional)</h3>
                <div className={styles.gridTwoColumns}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>GitHub Profile</label>
                    <input 
                      type="url" 
                      className={styles.input} 
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>LinkedIn Profile</label>
                    <input 
                      type="url" 
                      className={styles.input} 
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Portfolio Website</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://myportfolio.com"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: EXPERTISE (FREELANCER ONLY) */}
            {isFreelancer && currentStep === 3 && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>Your Expertise</h2>
                <p className={styles.stepIntro}>
                  Define your skill set to allow the matching system to find your workspace.
                </p>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Professional Categories</label>
                  <span className={styles.fieldHelp}>Select the primary domains you specialize in.</span>
                  <div className={styles.categoryGrid}>
                    {FREELANCER_CATEGORIES.map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <button 
                          key={cat}
                          type="button"
                          className={`${styles.categoryCard} ${isChecked ? styles.categoryCardActive : ''}`}
                          onClick={() => handleCategoryToggle(cat)}
                        >
                          <span className={styles.checkboxIndicator}>
                            {isChecked && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </span>
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {errors.category && <p className={styles.error}>{errors.category}</p>}
                </div>

                {selectedCategories.length > 0 && (
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Select Subcategories</label>
                    <span className={styles.fieldHelp}>Select specialized fields inside your main categories.</span>
                    <div className={styles.subcategoryGrid}>
                      {selectedCategories.flatMap(cat => SUB_CATEGORIES_MAP[cat] || []).map((sub) => {
                        const isChecked = selectedSubcategories.includes(sub);
                        return (
                          <button 
                            key={sub}
                            type="button"
                            className={`${styles.subcategoryCard} ${isChecked ? styles.subcategoryCardActive : ''}`}
                            onClick={() => handleSubcategoryToggle(sub)}
                          >
                            <span className={styles.checkboxIndicator}>
                              {isChecked && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.checkIcon}>
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
                  <label className={styles.label}>Core Skills</label>
                  <span className={styles.fieldHelp}>Type a technical skill and press **Enter** to add.</span>
                  <div className={styles.tagInputContainer}>
                    {skills.map((skill, idx) => (
                      <span key={idx} className={styles.tag}>
                        {skill}
                        <button 
                          type="button" 
                          className={styles.removeTagBtn}
                          onClick={() => handleRemoveSkill(idx)}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      className={styles.tagInput}
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder={skills.length === 0 ? "e.g. React, Python" : ""}
                    />
                  </div>
                  {errors.skills && <p className={styles.error}>{errors.skills}</p>}
                </div>
              </div>
            )}

            {/* STEP 4: RATES & BIO (FREELANCER) / STEP 3: BIO (CLIENT) */}
            {((isFreelancer && currentStep === 4) || (!isFreelancer && currentStep === 3)) && (
              <div className={styles.stepContent}>
                <h2 className={styles.stepTitle}>
                  {isFreelancer ? 'Rates & Summary' : 'Company Details'}
                </h2>
                <p className={styles.stepIntro}>
                  {isFreelancer 
                    ? 'Define your pricing model and write a short summary of your professional capabilities.' 
                    : 'Provide details about your company, projects, and the type of professionals you are looking to hire.'}
                </p>

                {isFreelancer && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Service Delivery Style</label>
                      <div className={styles.deliveryContainer}>
                        <button 
                          type="button"
                          onClick={() => setEngagementType('task')}
                          className={`${styles.deliveryBox} ${engagementType === 'task' ? styles.deliveryBoxActive : ''}`}
                        >
                          <div className={styles.deliveryIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.deliveryIconSvg}>
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <div className={styles.deliveryTitle}>One-off / Hourly</div>
                          <div className={styles.deliveryDesc}>Charge an hourly rate for ad-hoc milestones</div>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEngagementType('fractional')}
                          className={`${styles.deliveryBox} ${engagementType === 'fractional' ? styles.deliveryBoxActive : ''}`}
                        >
                          <div className={styles.deliveryIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.deliveryIconSvg}>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          </div>
                          <div className={styles.deliveryTitle}>Fractional / Retainer</div>
                          <div className={styles.deliveryDesc}>Secure long-term contracts as a fractional leader</div>
                        </button>
                      </div>
                    </div>

                    {engagementType === 'task' ? (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Hourly Rate (INR / hr)</label>
                        <div className={styles.rateInputWrapper}>
                          <span className={styles.currencyPrefix}>₹</span>
                          <input 
                            type="number" 
                            className={styles.inputWithPrefix} 
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="e.g. 2000"
                          />
                        </div>
                        {errors.hourlyRate && <p className={styles.error}>{errors.hourlyRate}</p>}
                      </div>
                    ) : (
                      <div className={styles.fractionalContainer}>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Monthly Retainer Rate (INR / month)</label>
                          <div className={styles.rateInputWrapper}>
                            <span className={styles.currencyPrefix}>₹</span>
                            <input 
                              type="number" 
                              className={styles.inputWithPrefix} 
                              value={monthlyRate}
                              onChange={(e) => setMonthlyRate(e.target.value)}
                              placeholder="e.g. 50000"
                            />
                          </div>
                          {errors.monthlyRate && <p className={styles.error}>{errors.monthlyRate}</p>}
                        </div>
                        <div className={styles.gridTwoColumns}>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Hours / Week</label>
                            <input 
                              type="number" 
                              className={styles.input} 
                              value={hoursPerWeek}
                              onChange={(e) => setHoursPerWeek(e.target.value)}
                              placeholder="e.g. 10"
                            />
                            {errors.hoursPerWeek && <p className={styles.error}>{errors.hoursPerWeek}</p>}
                          </div>
                          <div className={styles.formGroup}>
                            <label className={styles.label}>Min Commitment (Months)</label>
                            <input 
                              type="number" 
                              className={styles.input} 
                              value={minimumCommitmentMonths}
                              onChange={(e) => setMinimumCommitmentMonths(e.target.value)}
                              placeholder="e.g. 3"
                            />
                            {errors.minimumCommitmentMonths && <p className={styles.error}>{errors.minimumCommitmentMonths}</p>}
                          </div>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Fractional Role / Domain</label>
                          <select 
                            className={styles.select} 
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                          >
                            <option value="CTO">Fractional CTO (Technology)</option>
                            <option value="CFO">Fractional CFO (Finance)</option>
                            <option value="CMO">Fractional CMO (Marketing)</option>
                            <option value="CEO">Fractional CEO (Strategy)</option>
                            <option value="COO">Fractional COO (Operations)</option>
                            <option value="HR">Fractional HR Leader</option>
                            <option value="Product">Fractional Product Officer</option>
                          </select>
                          {errors.domain && <p className={styles.error}>{errors.domain}</p>}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {isFreelancer ? "Professional Summary / Bio" : "Company / Buyer Bio"}
                  </label>
                  <textarea 
                    className={styles.textarea} 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={isFreelancer 
                      ? "Describe your experience, recent projects, or specializations (minimum 20 characters)..."
                      : "Describe your team, projects, and what roles you want to recruit..."}
                  />
                  <div className={styles.charCounter}>
                    <span>{bio.trim().length} characters written</span>
                    <span>Minimum 20 required</span>
                  </div>
                  {errors.bio && <p className={styles.error}>{errors.bio}</p>}
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className={styles.btnRow}>
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className={styles.backBtn}
                  onClick={handleBack}
                >
                  Back
                </button>
              )}
              <button 
                type="submit" 
                className={styles.continueBtn}
              >
                {currentStep === (isFreelancer ? 4 : 3) ? 'Finish Setup' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
