import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VerifiedBadge from '../linkedin/VerifiedBadge';
import styles from './HomePage.module.css';
import Header from '../../components/Header';
import { Briefcase } from '@phosphor-icons/react';

// Retrieve backend API base URL from Vite environment variable
// TODO: confirm endpoint path with backend team
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000')
  : 'https://freelancemarketplace-backend.onrender.com';

import { MOCK_TALENT_DATA } from '../../data/listingsData';

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

const getAvatarBg = (talent) => {
  const dsBgs = [
    'var(--color-navy-dark)',
    'var(--color-accent-orange)',
    'var(--color-accent-hover)',
    'var(--color-linkedin)'
  ];
  if (!talent.id) return dsBgs[0];
  const charCode = typeof talent.id === 'string' ? talent.id.charCodeAt(0) : Number(talent.id);
  return dsBgs[isNaN(charCode) ? 0 : charCode % dsBgs.length];
};

export default function HomePage() {
  const navigate = useNavigate();

  // Load user session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  // Navigation Active Link State
  const [activeTab, setActiveTab] = useState('Find Talent');

  const handleNavClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'Find Talent') {
      navigate('/');
    } else if (tabName === 'Products') {
      navigate('/products');
    } else if (tabName === 'List Product') {
      navigate('/post-product');
    }
  };

  // Search & Filter Temp states (applied only on "Apply Filters")
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [subCategoryVal, setSubCategoryVal] = useState('All Subcategories');
  const [minBudget, setMinBudget] = useState('');

  useEffect(() => {
    setSubCategoryVal('All Subcategories');
  }, [category]);
  const [maxBudget, setMaxBudget] = useState('');
  const [minRating, setMinRating] = useState('Any'); // 'Any', '4+', '4.5+', '5.0'
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Applied Filter states (actual values filtering the list)
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'All Categories',
    subcategory: 'All Subcategories',
    minBudget: '',
    maxBudget: '',
    minRating: 'Any',
    verifiedOnly: false,
    engagementType: 'All'
  });

  // Validation Error States
  const [budgetError, setBudgetError] = useState('');

  // LinkedIn Connection State (FR-16, FR-17: connect/disconnect triggers badge visibility toggle)
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(() => localStorage.getItem('adfreelancin_linkedin_connected') !== 'false');

  // Sorting & Pagination States
  const [sortBy, setSortBy] = useState('Top Rated');
  const [currentPage, setCurrentPage] = useState(1);
  const [engagementTypeFilter, setEngagementTypeFilter] = useState('All');
  const cardsPerPage = 6;

  // Mobile drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Real backend listings database data
  const [backendListings, setBackendListings] = useState([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);

  // Load from API Base URL (if available) - Fallback to mock data on error/empty database
  useEffect(() => {
    async function fetchListings() {
      setIsLoadingBackend(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Filter out hiring clients
            const freelancersOnly = data.filter(item => 
              item.role !== 'Client' && 
              item.role !== 'buyer' && 
              item.role !== 'Client (Buyer)'
            );
            
            // Map FastAPI backend models to fit our styling requirements if needed
            const formattedListings = freelancersOnly.map(item => {
              const subcategories = (item.skills || []).filter(s => s.startsWith('subcategory:')).map(s => s.replace('subcategory:', ''));
              const cleanSkills = (item.skills || []).filter(s => !s.startsWith('subcategory:'));
              return {
                id: item.id || String(Math.random()),
                name: item.full_name || item.name || 'Freelancer',
                role: item.title || item.role || 'Professional',
                rating: item.reviews_count > 0 ? (item.rating || 0) : 0,
                reviewsCount: item.reviews_count || 0,
                category: item.category || 'Development',
                subcategory: subcategories.join(', ') || item.subcategory || '',
                availability: item.availability || 'Full-time',
                rate: item.hourly_rate || item.rate || 1500,
                isVerified: (item.is_verified && !!item.linkedin_id) || false,
                skills: cleanSkills,
                initials: item.initials || (item.full_name || item.name ? (item.full_name || item.name).split(' ').map(n => n[0]).join('').toUpperCase() : 'FL'),
                avatarBg: item.avatar_bg || '#1B2A41',
                avatarUrl: item.avatar_url || null,
                engagementType: item.engagement_type || 'task',
                monthlyRate: item.monthly_rate || 0,
                hoursPerWeek: item.hours_per_week || 0,
                minimumCommitmentMonths: item.minimum_commitment_months || 0,
                domain: item.domain || ''
              };
            });
            setBackendListings(formattedListings);
          }
        }
      } catch (error) {
        console.warn("Backend API not reachable. Using fallback rich mock data for presentation.", error);
      } finally {
        setIsLoadingBackend(false);
      }
    }

    fetchListings();
  }, []);

  // Budget Validation check whenever temporary minBudget or maxBudget changes
  useEffect(() => {
    const minVal = parseFloat(minBudget);
    const maxVal = parseFloat(maxBudget);

    if (minBudget && isNaN(minVal)) {
      setBudgetError('Min budget must be a number.');
    } else if (minVal < 0) {
      setBudgetError('Min budget cannot be negative.');
    } else if (maxBudget && isNaN(maxVal)) {
      setBudgetError('Max budget must be a number.');
    } else if (maxVal < 0) {
      setBudgetError('Max budget cannot be negative.');
    } else if (minBudget && maxBudget && maxVal < minVal) {
      setBudgetError('Max budget cannot be less than Min budget.');
    } else {
      setBudgetError('');
    }
  }, [minBudget, maxBudget]);

  // Combine backend listings and mock listings (excluding the logged-in user)
  const allListings = (backendListings.length > 0 ? backendListings : MOCK_TALENT_DATA)
    .filter(item => !currentUser || item.id !== currentUser.id);

  // Submit Filters
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    if (budgetError) return; // Stop if form contains invalid budget ranges
    
    setAppliedFilters({
      category,
      subcategory: subCategoryVal,
      minBudget,
      maxBudget,
      minRating,
      verifiedOnly,
      engagementType: engagementTypeFilter
    });
    setCurrentPage(1); // Reset back to page 1 on filter application
    setIsMobileFiltersOpen(false); // Close sidebar on mobile
  };

  // Reset Filters
  const handleResetFilters = () => {
    setCategory('All Categories');
    setSubCategoryVal('All Subcategories');
    setMinBudget('');
    setMaxBudget('');
    setMinRating('Any');
    setVerifiedOnly(false);
    setEngagementTypeFilter('All');
    setBudgetError('');

    setAppliedFilters({
      category: 'All Categories',
      subcategory: 'All Subcategories',
      minBudget: '',
      maxBudget: '',
      minRating: 'Any',
      verifiedOnly: false,
      engagementType: 'All'
    });
    setCurrentPage(1);
    setIsMobileFiltersOpen(false);
  };

  // LinkedIn Connection Flow
  const handleToggleLinkedIn = () => {
    if (isLinkedInConnected) {
      setIsLinkedInConnected(false);
      localStorage.setItem('adfreelancin_linkedin_connected', 'false');
    } else {
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      if (clientId && clientId !== 'your_linkedin_client_id_here') {
        // Set context so the callback page knows this is a verification-only flow
        const state = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        sessionStorage.setItem('linkedin_oauth_state', state);
        sessionStorage.setItem('linkedin_auth_context', 'verify');
        sessionStorage.setItem('linkedin_return_to', '/');
        const redirectUri = window.location.origin + '/linkedin-callback';
        window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;
      } else {
        setIsLinkedInConnected(true);
        localStorage.setItem('adfreelancin_linkedin_connected', 'true');
      }
    }
  };

  // Login Button Click Handler
  const handleLoginClick = () => {
    console.log("Redirecting to login screen.");
    navigate('/login');
  };

  // Join Free Button Click Handler
  const handleJoinClick = () => {
    console.log("Redirecting to join signup flow... Placeholder route activated.");
    // TODO: Navigate to AccountTypeSelect for registration
    navigate('/signup');
  };

  // Filtering + Searching logic
  const filteredListings = allListings.filter(talent => {
    // 1. Search Query Match (matches name, role, skills, or category)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const nameMatch = talent.name.toLowerCase().includes(q);
      const roleMatch = talent.role.toLowerCase().includes(q);
      const skillMatch = talent.skills.some(skill => skill.toLowerCase().includes(q));
      const categoryMatch = talent.category.toLowerCase().includes(q);

      if (!nameMatch && !roleMatch && !skillMatch && !categoryMatch) return false;
    }

    // 2. Category Match
    if (appliedFilters.category !== 'All Categories') {
      const talentCats = talent.category ? talent.category.split(',').map(c => c.trim()) : [];
      if (!talentCats.includes(appliedFilters.category)) return false;
      if (appliedFilters.subcategory !== 'All Subcategories') {
        const talentSubs = talent.subcategory ? talent.subcategory.split(',').map(s => s.trim()) : [];
        if (!talentSubs.includes(appliedFilters.subcategory)) return false;
      }
    }

    // 3. Budget Min Match
    if (appliedFilters.minBudget !== '') {
      const min = parseFloat(appliedFilters.minBudget);
      if (!isNaN(min) && talent.rate < min) return false;
    }

    // 4. Budget Max Match
    if (appliedFilters.maxBudget !== '') {
      const max = parseFloat(appliedFilters.maxBudget);
      if (!isNaN(max) && talent.rate > max) return false;
    }



    // 6. Rating Match
    if (appliedFilters.minRating !== 'Any') {
      const minR = parseFloat(appliedFilters.minRating);
      if (!isNaN(minR) && talent.rating < minR) return false;
    }

    // 7. Verified Match (LinkedIn Verified is active on profile AND LinkedIn globally connected)
    if (appliedFilters.verifiedOnly) {
      const isVerifiedStatus = talent.isVerified && isLinkedInConnected;
      if (!isVerifiedStatus) return false;
    }
    
    // 8. Engagement Type Match
    if (appliedFilters.engagementType !== 'All') {
      const type = talent.engagementType || 'task';
      if (type !== appliedFilters.engagementType) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'Top Rated') {
      return b.rating - a.rating;
    } else if (sortBy === 'Rate: Low to High') {
      return a.rate - b.rate;
    } else if (sortBy === 'Rate: High to Low') {
      return b.rate - a.rate;
    }
    return 0;
  });

  // Pagination bounds calculation
  const totalResults = sortedListings.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / cardsPerPage));
  
  // Guard current page range
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  
  const startIndex = (activePage - 1) * cardsPerPage;
  const endIndex = Math.min(startIndex + cardsPerPage, totalResults);
  const paginatedListings = sortedListings.slice(startIndex, endIndex);

  return (
    <div className={styles.pageWrapper}>
      
      {/* MAIN HEADER NAVIGATION BAR */}
      <Header activeTab="Find Talent" isLinkedInConnected={isLinkedInConnected} setIsLinkedInConnected={setIsLinkedInConnected} />

      {/* 3. MAIN CONTAINER (Grid of Filters + Results) */}
      <main className={styles.mainContainer}>
        <h1 className="sr-only">Find and Hire Elite Verified Freelance Talent</h1>
        
        {/* FILTERS SIDEBAR */}
        <aside className={`${styles.sidebar} ${isMobileFiltersOpen ? styles.sidebarMobileOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            <button 
              className={styles.mobileCloseBtn}
              onClick={() => setIsMobileFiltersOpen(false)}
              aria-label="Close Filters Drawer"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleApplyFilters}>
            
            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <label htmlFor="filter-category" className={styles.filterLabel}>Category</label>
              <select 
                id="filter-category" 
                className={styles.categorySelect}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Writing & Translation">Writing & Translation</option>
                <option value="DevOps">DevOps</option>
                <option value="Accounting & Finance">Accounting & Finance</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
                <option value="Operations & Management">Operations & Management</option>
              </select>
            </div>

            {category && category !== 'All Categories' && SUB_CATEGORIES_MAP[category] && (
              <div className={styles.filterGroup}>
                <label htmlFor="filter-subcategory" className={styles.filterLabel}>Subcategory</label>
                <select 
                  id="filter-subcategory" 
                  className={styles.categorySelect}
                  value={subCategoryVal}
                  onChange={(e) => setSubCategoryVal(e.target.value)}
                >
                  <option value="All Subcategories">All Subcategories</option>
                  {SUB_CATEGORIES_MAP[category].map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Budget / hr (₹) Filter */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel} id="budget-heading">Budget / hr (₹)</span>
              <div className={styles.budgetInputs} aria-describedby="budget-heading">
                <div className={styles.budgetInputWrapper}>
                  <span className={styles.currencySymbol}>₹</span>
                  <input 
                    type="text" 
                    id="filter-min-budget"
                    placeholder="Min" 
                    className={styles.budgetInput}
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    aria-label="Minimum budget per hour in Rupees"
                  />
                </div>
                <div className={styles.budgetInputWrapper}>
                  <span className={styles.currencySymbol}>₹</span>
                  <input 
                    type="text" 
                    id="filter-max-budget"
                    placeholder="Max" 
                    className={styles.budgetInput}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    aria-label="Maximum budget per hour in Rupees"
                  />
                </div>
              </div>
              {budgetError && (
                <p className={styles.budgetErrorMessage} style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-label)', marginTop: '6px', fontWeight: '500' }}>
                  {budgetError}
                </p>
              )}
            </div>



            {/* Min Rating Filter */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Min Rating</span>
              <div className={styles.ratingPillGroup}>
                {['Any', '4+', '4.5+', '5.0'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.ratingPill} ${minRating === option ? styles.ratingPillActive : ''}`}
                    onClick={() => setMinRating(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Engagement Type Filter */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Engagement</span>
              <div className={styles.ratingPillGroup}>
                {[
                  { label: 'All', value: 'All' },
                  { label: 'One-off', value: 'task' },
                  { label: 'Fractional', value: 'fractional' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.ratingPill} ${engagementTypeFilter === option.value ? styles.ratingPillActive : ''}`}
                    onClick={() => setEngagementTypeFilter(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LinkedIn Verified Filter */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>LinkedIn Verified</span>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                />
                <span>Verified only</span>
              </label>
            </div>

            {/* Apply & Reset Buttons */}
            <button 
              type="submit" 
              className={styles.applyBtn} 
              disabled={!!budgetError}
              style={budgetError ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              Apply Filters
            </button>
            <button 
              type="button" 
              className={styles.resetBtn} 
              onClick={handleResetFilters}
            >
              Reset
            </button>
          </form>
        </aside>

        {/* RESULTS AREA */}
        <section className={styles.resultsArea}>
          
          {/* Search bar & Sort header */}
          <div className={styles.searchBarRow}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input 
                type="search" 
                placeholder="Search name, skill, or keyword…" 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // reset to first page on keystroke search
                }}
                aria-label="Search talent by name, skill, or keyword"
              />
            </div>
            
            <select 
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort listings by criteria"
            >
              <option value="Top Rated">Sort: Top Rated</option>
              <option value="Rate: Low to High">Sort: Rate (Low to High)</option>
              <option value="Rate: High to Low">Sort: Rate (High to Low)</option>
            </select>

            <button 
              className={styles.mobileFilterToggle}
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <circle cx="4" cy="12" r="2" fill="currentColor"></circle>
                <circle cx="12" cy="10" r="2" fill="currentColor"></circle>
                <circle cx="20" cy="14" r="2" fill="currentColor"></circle>
              </svg>
              <span>Filters</span>
            </button>
          </div>

          {/* Results Metadata Summary */}
          <div className={styles.resultsSummary}>
            <p>
              Showing {totalResults > 0 ? `${startIndex + 1}-${endIndex}` : '0'} of {totalResults} results
            </p>
            {!isLinkedInConnected && (
              <span style={{ color: 'var(--color-accent-text)', fontWeight: '500', fontSize: 'var(--font-size-label)' }}>
                ⚠️ LinkedIn disconnected (Verified badges hidden)
              </span>
            )}
          </div>



          {/* TALENT CARDS LIST */}
          {isLoadingBackend ? (
            <div className={styles.cardsGrid}>
              {Array.from({ length: cardsPerPage }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard} aria-hidden="true">
                  <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonAvatar}></div>
                    <div className={styles.skeletonInfo}>
                      <div className={`${styles.skeletonText} ${styles.skeletonTitle}`}></div>
                      <div className={`${styles.skeletonText} ${styles.skeletonSubtitle}`}></div>
                    </div>
                  </div>
                  <div className={`${styles.skeletonText} ${styles.skeletonRow}`}></div>
                  <div className={styles.skeletonBadges}>
                    <div className={`${styles.skeletonText} ${styles.skeletonBadge}`}></div>
                  </div>
                  <div className={styles.skeletonSkills}>
                    <div className={`${styles.skeletonText} ${styles.skeletonTag}`}></div>
                    <div className={`${styles.skeletonText} ${styles.skeletonTag}`}></div>
                    <div className={`${styles.skeletonText} ${styles.skeletonTag}`}></div>
                  </div>
                  <div className={styles.skeletonFooter}>
                    <div className={`${styles.skeletonText} ${styles.skeletonFooterLeft}`}></div>
                    <div className={`${styles.skeletonText} ${styles.skeletonFooterRight}`}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedListings.length > 0 ? (
            <div className={styles.cardsGrid}>
              {paginatedListings.map((talent) => {
                // Verified status depends on the candidate profile and global connection
                const displayVerified = talent.isVerified && isLinkedInConnected;
                
                return (
                  <article 
                    key={talent.id} 
                    className={styles.card} 
                    onClick={() => navigate('/freelancer/' + talent.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.cardHeader}>
                      <div 
                        className={styles.avatar} 
                        style={{ backgroundColor: getAvatarBg(talent), overflow: 'hidden' }}
                        aria-hidden="true"
                      >
                        {talent.avatarUrl ? (
                          <img 
                            src={talent.avatarUrl} 
                            alt={talent.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            loading="lazy"
                          />
                        ) : (
                          talent.initials
                        )}
                      </div>
                      <div className={styles.nameRole}>
                        <h3 className={styles.name}>{talent.name}</h3>
                        <span className={styles.role}>{talent.role}</span>
                      </div>
                    </div>

                     <div className={styles.ratingRow}>
                       {talent.rating > 0 && talent.reviewsCount > 0 ? (
                         <>
                           <span className={styles.starIcon} aria-hidden="true">★</span>
                           <span className={styles.ratingValue}>{talent.rating.toFixed(1)}</span>
                           <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)', marginLeft: '4px' }}>({talent.reviewsCount})</span>
                         </>
                       ) : (
                         <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)' }}>No ratings</span>
                       )}
                       <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)', marginLeft: '6px' }}>({talent.category})</span>
                     </div>

                    <div className={styles.badgeContainer}>
                      {/* Badge auto-toggled based on LinkedIn connected status */}
                      <VerifiedBadge isVerified={displayVerified} />
                      {talent.engagementType === 'fractional' && (
                        <span style={{
                          backgroundColor: 'var(--color-accent-warm-soft-bg)',
                          color: 'var(--color-accent-text)',
                          fontSize: 'var(--font-size-label)',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: 'var(--border-radius-card)',
                          border: '1px solid rgba(231, 143, 104, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Briefcase size={14} weight="bold" />
                          <span>Fractional {talent.domain}</span>
                        </span>
                      )}
                    </div>

                    <div className={styles.skillsContainer}>
                      {talent.skills.map((skill, idx) => (
                        <span key={idx} className={styles.skillTag}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className={styles.rateBlock}>
                      {talent.engagementType === 'fractional' ? (
                        <>
                          <span className={styles.rateValue}>₹{talent.monthlyRate ? talent.monthlyRate.toLocaleString('en-IN') : '0'}</span>
                          <span className={styles.ratePeriod}>/ mo ({talent.hoursPerWeek}h/wk)</span>
                        </>
                      ) : (
                        <>
                          <span className={styles.rateValue}>₹{talent.rate.toLocaleString('en-IN')}</span>
                          <span className={styles.ratePeriod}>/ hr</span>
                        </>
                      )}

                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyStateTitle}>No results found</h3>
              <p className={styles.emptyStateText}>Try adjusting your search keywords or clear filters to see candidates.</p>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Pagination Navigation">
              <button 
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={activePage === 1}
                aria-label="Go to previous page"
              >
                &larr; Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`${styles.pageBtn} ${activePage === pageNum ? styles.pageBtnActive : ''}`}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={activePage === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                className={styles.pageBtn}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={activePage === totalPages}
                aria-label="Go to next page"
              >
                Next &rarr;
              </button>
            </nav>
          )}

        </section>
      </main>

      {/* 4. FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerCol}>
            <div className={styles.logo} style={{ marginBottom: '10px' }}>
              <span style={{ color: '#FFFFFF' }}>Free</span>
              <span style={{ color: 'var(--color-accent-orange)' }}>Lance</span>
              <span style={{ color: '#FFFFFF' }}>Hub</span>
            </div>
            <p className={styles.footerDesc}>
              Connecting elite independent contractors, product designers, developers, and analytical minds with premier opportunities globally. Built on verification and trust.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h3 className={styles.footerColTitle}>Quick Links</h3>
            <div className={styles.footerLinks}>
              <a href="#about" className={styles.footerLink}>About Us</a>
              <a href="#privacy" className={styles.footerLink}>Privacy Policy</a>
              <a href="#terms" className={styles.footerLink}>Terms of Service</a>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h3 className={styles.footerColTitle}>Stay Connected</h3>
            <p className={styles.footerDesc} style={{ marginBottom: '10px' }}>
              Follow our community of verified independent consultants and sellers.
            </p>
            <div className={styles.footerSocials}>
              <a href="#social-linkedin" className={styles.socialIcon} aria-label="LinkedIn Profile">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a href="#social-twitter" className={styles.socialIcon} aria-label="Twitter Feed">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; 2026 AdFreelancin. All rights reserved.</p>
          <p>Made with &hearts; for the freelance economy.</p>
        </div>
      </footer>

    </div>
  );
}
