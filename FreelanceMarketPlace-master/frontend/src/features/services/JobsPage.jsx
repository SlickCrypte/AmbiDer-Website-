import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './JobsPage.module.css';
import Header from '../../components/Header';
import { Briefcase, FolderOpen, MagnifyingGlass } from '@phosphor-icons/react';


const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000')
  : 'https://freelancemarketplace-backend.onrender.com';

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

export default function JobsPage() {
  const navigate = useNavigate();

  // Load user session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All Subcategories');
  const [maxBudget, setMaxBudget] = useState('');

  useEffect(() => {
    setSelectedSubcategory('All Subcategories');
  }, [selectedCategory]);

  // Application Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [sendingApplication, setSendingApplication] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch jobs dynamically from backend
  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch(`${API_BASE_URL}/listings/`);
        if (response.ok) {
          const data = await response.json();
          // Filter listings of type 'job'
          const jobPosts = await Promise.all(data
            .filter(item => item.listing_type === 'job')
            .map(async (item) => {
              let clientName = 'Hiring Client';
              let initials = 'CL';
              if (item.seller_id) {
                try {
                  const res = await fetch(`${API_BASE_URL}/users/${item.seller_id}`);
                  if (res.ok) {
                    const profile = await res.json();
                    clientName = profile.full_name || profile.name || 'Hiring Client';
                    initials = profile.initials || clientName.split(' ').map(n => n[0]).join('').toUpperCase();
                  }
                } catch (e) {
                  console.warn("Failed to fetch job client profile:", e);
                }
              }
              const subcategoryVal = (item.skills || []).find(s => s.startsWith('subcategory:'))?.replace('subcategory:', '') || item.subcategory || '';
              const cleanSkills = (item.skills || []).filter(s => !s.startsWith('subcategory:'));
              return {
                id: item.id,
                title: item.title || 'Project Scope',
                description: item.description || '',
                price: item.price || 0,
                category: item.category || 'Code Snippets',
                subcategory: subcategoryVal,
                sellerId: item.seller_id,
                clientName,
                clientInitials: initials,
                emoji: item.emoji || '💼',
                skills: cleanSkills,
                duration: item.duration || '3 Months',
                companyLogo: (item.images && item.images.length > 0) ? item.images[0] : null
              };
            })
          );
          setJobs(jobPosts);
        }
      } catch (err) {
        console.warn("Failed to load jobs list:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Filtering calculations
  const filteredJobs = jobs.filter((job) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const titleMatch = job.title.toLowerCase().includes(query);
      const descMatch = job.description.toLowerCase().includes(query);
      const skillsMatch = job.skills.some(s => s.toLowerCase().includes(query));
      if (!titleMatch && !descMatch && !skillsMatch) return false;
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      if (job.category !== selectedCategory) return false;
      if (selectedSubcategory !== 'All Subcategories') {
        if (job.subcategory !== selectedSubcategory) return false;
      }
    }

    // 3. Budget Filter
    if (maxBudget) {
      if (job.price > parseFloat(maxBudget)) return false;
    }

    return true;
  });

  // Modal open handlers
  const handleOpenApplyModal = (job) => {
    if (!currentUser) {
      alert("Please log in to apply for job postings.");
      navigate('/login');
      return;
    }
    setSelectedJob(job);
    setApplyMessage(`Hi ${job.clientName},\n\nI am interested in your project: "${job.title}". I have matching skills in ${job.skills.join(', ')} and would love to collaborate.`);
    setIsModalOpen(true);
  };

  const handleSendApplication = async (e) => {
    e.preventDefault();
    if (!applyMessage.trim()) return;

    setSendingApplication(true);
    const messagePayload = {
      sender_id: currentUser.id,
      receiver_id: selectedJob.sellerId,
      message: `[Job Application Proposal] ${applyMessage.trim()}`,
      is_read: false
    };

    try {
      // 1. Send chat message to client
      const msgResponse = await fetch(`${API_BASE_URL}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      });

      if (!msgResponse.ok) {
        throw new Error("Failed to send initial message.");
      }

      // 2. Create the application entry in the orders table
      const orderId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      const orderPayload = {
        id: orderId,
        buyer_id: selectedJob.sellerId, // The client who posted the job
        seller_id: currentUser.id,       // The freelancer applying
        listing_id: selectedJob.id,
        gig_title: selectedJob.title,
        total_price: selectedJob.price,
        status: 'applied',
        due_date: JSON.stringify({ duration: selectedJob.duration, proposal: applyMessage.trim() })
      };

      const orderResponse = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });

      if (orderResponse.ok) {
        alert("Your application has been successfully transmitted to the hiring client. They will review your credentials and contact you directly if your profile aligns with their requirements.");
        setIsModalOpen(false);
      } else {
        alert("Server error: Failed to submit job application contract.");
      }
    } catch (err) {
      console.warn("Failed to complete application submission:", err);
      alert("Network error: Failed to submit job application.");
      setIsModalOpen(false);
    } finally {
      setSendingApplication(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/');
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Header Navigation */}
      <Header activeTab="Browse Jobs" />

      {/* Directory Main area */}
      <div className={styles.directoryLayout}>
        <h1 className="sr-only">Browse Active Job Projects and Contracts</h1>
        {/* Filters Sidebar */}
        <aside className={`${styles.sidebar} ${isMobileFiltersOpen ? styles.sidebarMobileOpen : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className={styles.sidebarTitle} style={{ marginBottom: 0 }}>Filter Jobs</h2>
            <button className={styles.mobileCloseBtn} onClick={() => setIsMobileFiltersOpen(false)}>✕</button>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="category" 
                  checked={selectedCategory === 'All'} 
                  onChange={() => setSelectedCategory('All')} 
                />
                All Categories
              </label>
              {Object.keys(SUB_CATEGORIES_MAP).map(cat => (
                <label key={cat} className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === cat} 
                    onChange={() => setSelectedCategory(cat)} 
                  />
                  {cat}
                </label>
              ))}
            </div>

            {selectedCategory && selectedCategory !== 'All' && SUB_CATEGORIES_MAP[selectedCategory] && (
              <div className={styles.filterGroup} style={{ marginTop: '12px' }}>
                <label className={styles.filterLabel}>Subcategory</label>
                <select 
                  className={styles.filterInput}
                  style={{ width: '100%' }}
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                >
                  <option value="All Subcategories">All Subcategories</option>
                  {SUB_CATEGORIES_MAP[selectedCategory].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Max Budget (₹)</label>
            <input 
              type="number" 
              className={styles.filterInput}
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="e.g. 80000"
            />
          </div>
        </aside>

        {/* Directory Listings Content */}
        <main className={styles.contentArea}>
          <button className={styles.mobileFilterToggle} onClick={() => setIsMobileFiltersOpen(true)}>☰ Filters</button>
          <div className={styles.searchHeader}>
            <div className={styles.searchInputWrapper}>
              <MagnifyingGlass size={20} className={styles.searchIcon} />
              <input 
                type="text" 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, descriptions, or skills tags..."
              />
            </div>
            <button className={styles.searchBtn}>Search</button>
          </div>

          {loading ? (
            <div className={styles.jobsGrid}>
              {[1, 2, 3].map((n) => (
                <div key={n} className={`${styles.jobCard} ${styles.skeletonCard} ${styles.skeletonPulse}`}>
                  <div className={styles.jobCardHeader}>
                    <div className={`${styles.companyLogo} ${styles.skeletonItem}`} style={{ border: 'none' }} />
                    <div className={styles.jobHeadingCol} style={{ flex: 1 }}>
                      <div className={`${styles.skeletonItem} ${styles.skeletonTitleLine}`} />
                      <div className={`${styles.skeletonItem} ${styles.skeletonMetaLine}`} />
                    </div>
                  </div>

                  <div className={styles.skeletonTextSection}>
                    <div className={`${styles.skeletonItem} ${styles.skeletonTextLine}`} style={{ width: '100%' }} />
                    <div className={`${styles.skeletonItem} ${styles.skeletonTextLine}`} style={{ width: '85%' }} />
                  </div>

                  <div className={styles.skillsWrapper}>
                    <div className={`${styles.skeletonItem} ${styles.skeletonSkillBadge}`} style={{ width: '70px' }} />
                    <div className={`${styles.skeletonItem} ${styles.skeletonSkillBadge}`} style={{ width: '100px' }} />
                    <div className={`${styles.skeletonItem} ${styles.skeletonSkillBadge}`} style={{ width: '80px' }} />
                  </div>

                  <div className={styles.jobCardFooter}>
                    <div className={styles.specsRow}>
                      <div className={styles.specItem}>
                        <div className={`${styles.skeletonItem} ${styles.skeletonSpecLabel}`} />
                        <div className={`${styles.skeletonItem} ${styles.skeletonSpecValue}`} />
                      </div>
                      <div className={styles.specItem}>
                        <div className={`${styles.skeletonItem} ${styles.skeletonSpecLabel}`} />
                        <div className={`${styles.skeletonItem} ${styles.skeletonSpecValue}`} />
                      </div>
                    </div>
                    <div className={`${styles.skeletonItem} ${styles.skeletonButton}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className={styles.jobsGrid}>
              {filteredJobs.map((job) => (
                <div key={job.id} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt="Company Logo" className={styles.companyLogo} />
                    ) : job.emoji && job.emoji !== '💼' ? (
                      <div className={styles.jobEmoji} aria-hidden="true">{job.emoji}</div>
                    ) : (
                      <div className={styles.companyLogoFallback}>
                        <Briefcase size={22} weight="duotone" />
                      </div>
                    )}
                    <div className={styles.jobHeadingCol}>
                      <h3 className={styles.jobTitle}>{job.title}</h3>
                      <div className={styles.clientMeta}>
                        <span className={styles.clientBadge}>{job.clientInitials}</span>
                        <span>Posted by {job.clientName}</span>
                      </div>
                    </div>
                  </div>

                  <p className={styles.jobDescription}>{job.description ? job.description.replace(/^[ \t]*#+[ \t]*/gm, '') : ''}</p>

                  {job.skills.length > 0 && (
                    <div className={styles.skillsWrapper}>
                      {job.skills.map((skill, index) => (
                        <span key={index} className={styles.skillBadge}>{skill}</span>
                      ))}
                    </div>
                  )}

                  <div className={styles.jobCardFooter}>
                    <div className={styles.specsRow}>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Budget</span>
                        <span className={styles.specValue}>₹{job.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className={styles.specItem}>
                        <span className={styles.specLabel}>Duration</span>
                        <span className={styles.specValue}>{job.duration}</span>
                      </div>
                    </div>
                    
                    <button 
                      type="button" 
                      className={styles.applyBtn}
                      onClick={() => handleOpenApplyModal(job)}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIconContainer}>
                <FolderOpen size={40} weight="duotone" />
              </div>
              <h3>No matching job posts found</h3>
              <p>Try clearing your keyword filters or adjusting your budget limits.</p>
            </div>
          )}
        </main>
      </div>

      {/* Application Message Overlay Modal */}
      {isModalOpen && selectedJob && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Apply for: {selectedJob.title}</h3>
              <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSendApplication} className={styles.modalForm}>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalLabel}>Cover Message / Pitch</label>
                <textarea 
                  className={styles.modalTextarea} 
                  rows="6"
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  required
                />
              </div>
              <div className={styles.modalFooterActions}>
                <button 
                  type="button" 
                  className={styles.btnSecondary} 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={sendingApplication}
                  className={styles.btnPrimary}
                >
                  {sendingApplication ? 'Sending...' : 'Send Pitch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
