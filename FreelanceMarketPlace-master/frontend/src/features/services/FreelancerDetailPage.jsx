import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VerifiedBadge from '../linkedin/VerifiedBadge';
import { MOCK_TALENT_DATA } from '../../data/listingsData';
import styles from './FreelancerDetailPage.module.css';
import Header from '../../components/Header';
import { GoogleGenerativeAI } from '@google/generative-ai';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000')
  : 'https://freelancemarketplace-backend.onrender.com';

const getAvatarBg = (talent) => {
  const dsBgs = [
    'var(--color-navy-dark)',
    'var(--color-accent-orange)',
    'var(--color-accent-hover)',
    'var(--color-linkedin)'
  ];
  if (!talent || !talent.id) return dsBgs[0];
  const charCode = typeof talent.id === 'string' ? talent.id.charCodeAt(0) : Number(talent.id);
  return dsBgs[isNaN(charCode) ? 0 : charCode % dsBgs.length];
};

export default function FreelancerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load user session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  // Dynamic freelancer profile state loader
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Scheduling Scoping session modal states
  const [isScopingModalOpen, setIsScopingModalOpen] = useState(false);
  const [scopingNote, setScopingNote] = useState('');
  const [scopingTime, setScopingTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Hiring Modal states
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireJobTitle, setHireJobTitle] = useState('');
  const [hireJobDescription, setHireJobDescription] = useState('');
  const [hireJobSkills, setHireJobSkills] = useState('');
  const [hireJobBudget, setHireJobBudget] = useState('');
  const [hireJobDuration, setHireJobDuration] = useState('3 Months');
  const [isSubmittingHire, setIsSubmittingHire] = useState(false);
  const [isGeneratingScope, setIsGeneratingScope] = useState(false);

  useEffect(() => {
    async function fetchFreelancer() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`);
        if (response.ok) {
          const data = await response.json();
          
          // Fetch dynamic reviews for this seller
          let reviewsList = [];
          try {
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/seller/${id}`);
            if (reviewsResponse.ok) {
              reviewsList = await reviewsResponse.json();
            }
          } catch (rErr) {
            console.warn("Failed to fetch seller reviews:", rErr);
          }
          
          // Map reviews to frontend layout format
          const formattedReviews = reviewsList.map(r => ({
            id: r.id,
            reviewerName: r.reviewer_name || 'Hiring Client',
            reviewerInitials: (r.reviewer_name || 'Hiring Client').split(' ').map(n => n[0]).join('').toUpperCase(),
            avatarBg: '#E05A26',
            rating: r.rating || 5,
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently',
            text: r.comment || ''
          }));
          
          // Compute average rating from reviews (fall back to profile db rating or 0.0 if no reviews)
          const dynamicRating = reviewsList.length > 0 
            ? parseFloat((reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1))
            : 0.0;

          const memberDate = data.member_since 
            ? new Date(data.member_since) 
            : (data.created_at ? new Date(data.created_at) : new Date());
          const formattedMemberSince = memberDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
          setFreelancer({
            id: data.id,
            name: data.full_name || data.name || 'Professional',
            role: data.role || 'Specialist',
            rating: dynamicRating,
            reviewsCount: reviewsList.length,
            projectsCompleted: data.projects_completed || 0,
            rate: data.hourly_rate || 2500,
            isVerified: (data.is_verified && !!data.linkedin_id) || false,
            location: data.location || 'Mumbai, India',
            about: data.bio || '',
            githubUrl: data.github_url || null,
            linkedinUrl: data.linkedin_url || null,
            portfolioUrl: data.portfolio_url || null,
            skills: (data.skills || []).filter(s => !s.startsWith('subcategory:')),
            avatarBg: data.avatar_bg || '#1B2A41',
            initials: data.initials || 'PS',
            avatarUrl: data.avatar_url || null,
            engagementType: data.engagement_type || 'task',
            monthlyRate: data.monthly_rate || 0,
            hoursPerWeek: data.hours_per_week || 0,
            minimumCommitmentMonths: data.minimum_commitment_months || 0,
            domain: data.domain || '',
            completionRate: data.completion_rate !== undefined ? data.completion_rate : 100,
            quickStats: {
              responseTime: data.response_time || 'N/A',
              onTimeDelivery: (data.on_time_delivery !== undefined && data.on_time_delivery !== null) ? data.on_time_delivery + '%' : 'N/A',
              repeatClients: (data.repeat_clients !== undefined && data.repeat_clients !== null) ? data.repeat_clients + '%' : '0%',
              memberSince: formattedMemberSince
            },
            ratingBreakdown: {
              communication: dynamicRating,
              codeQuality: reviewsList.length > 0 ? 5.0 : 0.0,
              timeliness: reviewsList.length > 0 ? 4.8 : 0.0,
              value: reviewsList.length > 0 ? 4.9 : 0.0
            },
            reviews: formattedReviews
          });
        } else {
          // fallback to mock
          const mock = MOCK_TALENT_DATA.find(t => t.id === id);
          setFreelancer(mock);
        }
      } catch (err) {
        // fallback to mock
        const mock = MOCK_TALENT_DATA.find(t => t.id === id);
        setFreelancer(mock);
      } finally {
        setLoading(false);
      }
    }
    fetchFreelancer();
  }, [id]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('Find Talent');

  // LinkedIn Connection State (FR-16, FR-17: connect/disconnect triggers badge visibility toggle)
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(() => localStorage.getItem('adfreelancin_linkedin_connected') !== 'false');

  // Check if loading
  if (loading) {
    return (
      <div className={styles.pageWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: 'var(--font-size-title)', color: '#1B2A41', fontWeight: '600' }}>Loading profile details...</div>
      </div>
    );
  }

  // Check if freelancer profile exists
  if (!freelancer) {
    return (
      <div className={styles.pageWrapper}>
        {/* Simple Header */}
        <header className={styles.navbar}>
          <div className={styles.logoContainer} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="Ambider Logo" className={styles.logoImage} />
            <div className={styles.logoText}>
              <span className={styles.logoTextNavy}>Ad</span>
              <span className={styles.logoTextOrange}>Freelancin</span>
            </div>
          </div>
        </header>

        <main className={styles.notFoundContainer}>
          <h2 style={{ color: '#1B2A41', marginBottom: '16px' }}>Freelancer Profile Not Found</h2>
          <p style={{ color: 'var(--color-text-dark-bg-muted)', marginBottom: '24px' }}>
            The profile you are looking for does not exist or may have been deactivated.
          </p>
          <button 
            className={styles.hireBtn} 
            onClick={() => navigate('/')}
          >
            &larr; Return to Find Talent
          </button>
        </main>

        <footer className={styles.footerMini}>
          <div className={styles.footerMiniLogo}>
            <span style={{ color: '#FFFFFF' }}>Ad</span>
            <span style={{ color: 'var(--color-accent-orange)' }}>Freelancin</span>
          </div>
          <p className={styles.footerCopyright}>&copy; 2026 AdFreelancin</p>
        </footer>
      </div>
    );
  }

  // Toggle LinkedIn connectivity sandbox state
  const handleToggleLinkedIn = () => {
    if (isLinkedInConnected) {
      setIsLinkedInConnected(false);
      localStorage.setItem('adfreelancin_linkedin_connected', 'false');
    } else {
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      if (clientId && clientId !== 'your_linkedin_client_id_here') {
        const state = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        sessionStorage.setItem('linkedin_oauth_state', state);
        sessionStorage.setItem('linkedin_auth_context', 'verify');
        sessionStorage.setItem('linkedin_return_to', window.location.pathname);
        const redirectUri = window.location.origin + '/linkedin-callback';
        window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;
      } else {
        setIsLinkedInConnected(true);
        localStorage.setItem('adfreelancin_linkedin_connected', 'true');
      }
    }
  };

  const ensureListingExists = async () => {
    try {
      const listingCheck = await fetch(`${API_BASE_URL}/listings/${freelancer.id}`);
      if (!listingCheck.ok) {
        const newListingPayload = {
          id: freelancer.id,
          title: `Direct Service Contract - ${freelancer.name}`,
          description: freelancer.about || `Services offered by ${freelancer.name}`,
          price: parseFloat(freelancer.rate),
          category: freelancer.category === 'Design' ? 'UI Kits' : freelancer.category === 'Spreadsheets' ? 'Spreadsheets' : ['Development', 'DevOps', 'Data Analyst'].includes(freelancer.category) ? 'Code Snippets' : (freelancer.category || 'Code Snippets'),
          seller_id: freelancer.id,
          listing_type: 'service',
          emoji: '💼',
          skills: freelancer.skills || [],
          delivery_days: 30,
          sales: 0
        };

        await fetch(`${API_BASE_URL}/listings/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newListingPayload)
        });
      }
    } catch (e) {
      console.warn("Error ensuring listing exists:", e);
    }
  };

  // Button click handlers
  const handleHireClick = () => {
    if (!currentUser) {
      alert("Please log in to hire a freelancer.");
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'Client') {
      alert("Only Hiring Clients can create contract hires.");
      return;
    }
    
    // Initialize prefills
    setHireJobTitle(`Custom Project Contract - ${freelancer.name}`);
    setHireJobDescription('');
    setHireJobSkills(freelancer.skills ? freelancer.skills.join(', ') : '');
    setHireJobBudget((parseFloat(freelancer.rate) * 20).toString());
    setHireJobDuration('3 Months');
    setIsHireModalOpen(true);
  };

  const handleGenerateAIScope = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("Please add VITE_GEMINI_API_KEY in your frontend/.env file.");
      return;
    }

    setIsGeneratingScope(true);
    setHireJobDescription("Generating scope of work using Gemini AI...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Write a professional, clean, and highly readable contract scope of work for: ${hireJobTitle.trim() || "Freelance Project"}. 
Freelancer Name: ${freelancer.name}. 
Skills required: ${hireJobSkills || (freelancer.skills ? freelancer.skills.join(', ') : '')}. 
Estimated Budget: ₹${parseFloat(hireJobBudget).toLocaleString('en-IN') || "Competitive"}. 
Estimated Duration: ${hireJobDuration}. 

Please format using plain text:
- Use simple bullet points (with '-')
- Clear section headings
- Simple newlines between sections
- Do NOT use dense markdown syntax like multiple asterisks, hashtags, or headers. Write in clean plain text.

Structure it to cover:
1. Project Overview & Deliverables
2. Milestones & Timeline
3. Freelancer Expectations

Do not include conversational intros or general greetings.`;

      const result = await model.generateContent(prompt);
      const cleaned = result.response.text().replace(/^[ \t]*#+[ \t]*/gm, '');
      setHireJobDescription(cleaned);
    } catch (err) {
      console.error(err);
      alert("Error generating description: " + err.message);
    } finally {
      setIsGeneratingScope(false);
    }
  };

  const handleConfirmHireSubmit = async () => {
    if (!hireJobTitle.trim()) {
      alert("Please enter a job title.");
      return;
    }
    if (!hireJobDescription.trim()) {
      alert("Please enter the scope of work description.");
      return;
    }
    if (!hireJobBudget || parseFloat(hireJobBudget) <= 0) {
      alert("Please enter a valid positive budget.");
      return;
    }

    setIsSubmittingHire(true);

    await ensureListingExists();

    const orderPayload = {
      id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }),
      buyer_id: currentUser.id,
      seller_id: freelancer.id,
      listing_id: freelancer.id,
      gig_title: hireJobTitle.trim(),
      total_price: parseFloat(hireJobBudget),
      status: 'applied',
      due_date: JSON.stringify({
        duration: hireJobDuration,
        proposal: hireJobDescription.trim(),
        skills: hireJobSkills.split(',').map(s => s.trim()).filter(Boolean),
        is_direct_hire: true
      })
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        alert("Your hiring request has been successfully submitted to the freelancer. They have received your notification and will contact you via the messaging portal if they are available.");
        setIsHireModalOpen(false);
        navigate(`/dashboard?tab=Messages&partnerId=${freelancer.id}`);
      } else {
        alert("Server error: Failed to create hire contract order.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to reach API server.");
    } finally {
      setIsSubmittingHire(false);
    }
  };

  const handleScheduleCallConfirm = async () => {
    if (!currentUser) {
      alert("Please log in to schedule an intro call.");
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'Client') {
      alert("Only Hiring Clients can schedule scoping calls.");
      return;
    }
    if (!scopingNote.trim()) {
      alert("Please enter scope details or expectations.");
      return;
    }
    if (!scopingTime.trim()) {
      alert("Please suggest a date/time.");
      return;
    }
 
    setIsScheduling(true);
 
    await ensureListingExists();

    const orderPayload = {
      id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }),
      buyer_id: currentUser.id,
      seller_id: freelancer.id,
      listing_id: freelancer.id,
      gig_title: `Discovery Call: Fractional ${freelancer.domain || 'Retainer'}`,
      total_price: parseFloat(freelancer.monthlyRate || 0),
      status: 'Discovery Call',
      due_date: scopingTime,
      addons_selected: [scopingNote]
    };
 
    const messagePayload = {
      sender_id: currentUser.id,
      receiver_id: freelancer.id,
      message: `📅 Discovery Call request submitted!\nProposed Time: ${scopingTime}\nProject scope & details:\n"${scopingNote}"`
    };
 
    try {
      const ordRes = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
 
      await fetch(`${API_BASE_URL}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload)
      });
 
      if (ordRes.ok) {
        alert("Discovery call scheduled! Check the details and start messaging in your dashboard.");
        setIsScopingModalOpen(false);
        navigate('/dashboard');
      } else {
        alert("Server error: Failed to schedule scoping call.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to connect to servers.");
    } finally {
      setIsScheduling(false);
    }
  };

  const handleMessageClick = () => {
    if (!currentUser) {
      alert("Please log in to message freelancers.");
      navigate('/login');
      return;
    }
    navigate(`/dashboard?tab=Messages&partnerId=${freelancer.id}`);
  };

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

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleJoinClick = () => {
    // TODO: Navigate to AccountTypeSelect for registration
    navigate('/signup');
  };

  // LinkedIn verified badge visibility check
  const displayVerified = freelancer.isVerified && isLinkedInConnected;

  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. HEADER NAVIGATION BAR */}
      <Header activeTab="Find Talent" isLinkedInConnected={isLinkedInConnected} setIsLinkedInConnected={setIsLinkedInConnected} />

      {/* 2. MAIN DETAIL SHEET VIEW */}
      <main className={styles.detailContainer}>
        
        {/* Back navigation check */}
        <button className={styles.backLink} onClick={() => navigate('/')} aria-label="Go back to talent list">
          &larr; Back to Find Talent
        </button>

        {/* TOP SUMMARY PANEL */}
        <section className={styles.summaryPanel}>
          <div className={styles.summaryLeft}>
            <div 
              className={styles.avatarLg}
              style={{ backgroundColor: getAvatarBg(freelancer), overflow: 'hidden' }}
              aria-hidden="true"
            >
              {freelancer.avatarUrl ? (
                <img 
                  src={freelancer.avatarUrl} 
                  alt={freelancer.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                freelancer.initials
              )}
            </div>
            
            <div className={styles.summaryInfo}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{freelancer.name}</h1>
                
                {/* Verified badge auto-toggles based on LinkedIn sandboxed connection state */}
                <VerifiedBadge isVerified={displayVerified} />
                
                <span className={styles.statusBadge}>{freelancer.availabilityStatus || 'Available'}</span>
              </div>
              
              <p className={styles.roleLocation}>{freelancer.role} &middot; {freelancer.location}</p>
              
              <div className={styles.starsRow}>
                <div className={styles.stars} aria-label={`Rating: ${freelancer.rating.toFixed(1)} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <span 
                      key={idx} 
                      className={styles.starIcon} 
                      style={{ opacity: idx < Math.round(freelancer.rating) ? 1 : 0.2 }}
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span>
                  {freelancer.rating.toFixed(1)} &middot; {freelancer.reviewsCount} reviews &middot; {freelancer.projectsCompleted} projects completed
                </span>
              </div>

              {/* Social / Portfolio Links */}
              {(freelancer.githubUrl || freelancer.linkedinUrl || freelancer.portfolioUrl) && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {freelancer.githubUrl && (
                    <a 
                      href={freelancer.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--border-radius-input)',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: '#2D3748',
                        fontSize: 'var(--font-size-label)',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.24)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  )}
                  {freelancer.linkedinUrl && (
                    <a 
                      href={freelancer.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--border-radius-input)',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: '#2D3748',
                        fontSize: 'var(--font-size-label)',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.24)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {freelancer.portfolioUrl && (
                    <a 
                      href={freelancer.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--border-radius-input)',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: '#2D3748',
                        fontSize: 'var(--font-size-label)',
                        fontWeight: '600',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.24)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)';
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.summaryRight}>
            <div className={styles.rateBlock}>
              {freelancer.engagementType === 'fractional' ? (
                <>
                  <span className={styles.rateValue}>₹{freelancer.monthlyRate ? freelancer.monthlyRate.toLocaleString('en-IN') : '0'}</span>
                  <span className={styles.ratePeriod}>/ month</span>
                </>
              ) : (
                <>
                  <span className={styles.rateValue}>₹{freelancer.rate.toLocaleString('en-IN')}</span>
                  <span className={styles.ratePeriod}>/ hr</span>
                </>
              )}
            </div>
            <div className={styles.actionBtns}>
              {freelancer.engagementType === 'fractional' ? (
                <button 
                  className={styles.hireBtn} 
                  onClick={() => setIsScopingModalOpen(true)}
                  id="profile-schedule-btn"
                >
                  Schedule Intro Call
                </button>
              ) : (
                <button 
                  className={styles.hireBtn} 
                  onClick={handleHireClick}
                  id="profile-hire-btn"
                >
                  Collaborate Now
                </button>
              )}
              <button 
                className={styles.messageBtn} 
                onClick={handleMessageClick}
                id="profile-message-btn"
              >
                Message
              </button>
            </div>
          </div>
        </section>

        {/* TWO-COLUMN LAYOUT */}
        <div className={styles.contentGrid}>
          
          {/* LEFT COLUMN: About, Skills, Reviews */}
          <div className={styles.leftCol}>
            
            {/* About Card */}
            <article className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>About</h2>
              <p className={styles.aboutText}>{freelancer.about}</p>
            </article>

            {/* Skills Card */}
            <article className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Skills</h2>
              <div className={styles.skillsGrid}>
                {freelancer.skills.map((skill, idx) => (
                  <span key={idx} className={styles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>
            </article>

            {/* Recent Reviews Card */}
            <article className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Recent Reviews</h2>
              
              {freelancer.reviews && freelancer.reviews.length > 0 ? (
                <div className={styles.reviewList}>
                  {freelancer.reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div 
                          className={styles.avatarMd}
                          style={{ backgroundColor: getAvatarBg({ id: review.reviewerName }), overflow: 'hidden' }}
                          aria-hidden="true"
                        >
                          {review.reviewerInitials}
                        </div>
                        <div className={styles.reviewerMeta}>
                          <h3 className={styles.reviewerName}>{review.reviewerName}</h3>
                          <div className={styles.reviewSubRow}>
                            <div className={styles.stars} aria-label={`Rated: ${review.rating} stars`}>
                              {Array.from({ length: 5 }).map((_, sIdx) => (
                                <span 
                                  key={sIdx} 
                                  className={styles.starIcon}
                                  style={{ opacity: sIdx < review.rating ? 1 : 0.2 }}
                                  aria-hidden="true"
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span>&middot; {review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className={styles.reviewText}>{review.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)', fontStyle: 'italic' }}>
                  No reviews have been written for this freelancer yet.
                </p>
              )}
            </article>

          </div>

          {/* RIGHT COLUMN: Stats, Rating Breakdowns */}
          <div className={styles.rightCol}>
            
            {/* Quick Stats Card */}
            <aside className={styles.statsCard} aria-labelledby="quick-stats-title">
              <h2 className={styles.sectionTitle} id="quick-stats-title">Quick Stats</h2>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Response Time</span>
                  <span className={styles.statValue}>{freelancer.quickStats.responseTime}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Completion Rate</span>
                  <span className={styles.statValue} style={{ color: 'var(--color-success)', fontWeight: '700' }}>
                    {freelancer.completionRate}%
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>On-time Delivery</span>
                  <span className={styles.statValue}>{freelancer.quickStats.onTimeDelivery}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Repeat Clients</span>
                  <span className={styles.statValue}>{freelancer.quickStats.repeatClients}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Member Since</span>
                  <span className={styles.statValue}>{freelancer.quickStats.memberSince}</span>
                </div>
              </div>
            </aside>

            {/* Rating Breakdown Progress Bars Card */}
            <aside className={styles.statsCard} aria-labelledby="rating-breakdown-title">
              <h2 className={styles.sectionTitle} id="rating-breakdown-title">Rating Breakdown</h2>
              
              <div className={styles.pbarRow}>
                <span className={styles.pbarLabel}>Communication</span>
                <div className={styles.pbarOuter} role="progressbar" aria-valuenow={freelancer.ratingBreakdown.communication} aria-valuemin="0" aria-valuemax="5">
                  <div 
                    className={styles.pbarInner}
                    style={{ transform: `scaleX(${freelancer.ratingBreakdown.communication / 5})` }}
                  ></div>
                </div>
                <span className={styles.pbarValue}>{freelancer.ratingBreakdown.communication.toFixed(1)}</span>
              </div>

              <div className={styles.pbarRow}>
                <span className={styles.pbarLabel}>Code Quality</span>
                <div className={styles.pbarOuter} role="progressbar" aria-valuenow={freelancer.ratingBreakdown.codeQuality} aria-valuemin="0" aria-valuemax="5">
                  <div 
                    className={styles.pbarInner}
                    style={{ transform: `scaleX(${freelancer.ratingBreakdown.codeQuality / 5})` }}
                  ></div>
                </div>
                <span className={styles.pbarValue}>{freelancer.ratingBreakdown.codeQuality.toFixed(1)}</span>
              </div>

              <div className={styles.pbarRow}>
                <span className={styles.pbarLabel}>Timeliness</span>
                <div className={styles.pbarOuter} role="progressbar" aria-valuenow={freelancer.ratingBreakdown.timeliness} aria-valuemin="0" aria-valuemax="5">
                  <div 
                    className={styles.pbarInner}
                    style={{ transform: `scaleX(${freelancer.ratingBreakdown.timeliness / 5})` }}
                  ></div>
                </div>
                <span className={styles.pbarValue}>{freelancer.ratingBreakdown.timeliness.toFixed(1)}</span>
              </div>

              <div className={styles.pbarRow}>
                <span className={styles.pbarLabel}>Value</span>
                <div className={styles.pbarOuter} role="progressbar" aria-valuenow={freelancer.ratingBreakdown.value} aria-valuemin="0" aria-valuemax="5">
                  <div 
                    className={styles.pbarInner}
                    style={{ transform: `scaleX(${freelancer.ratingBreakdown.value / 5})` }}
                  ></div>
                </div>
                <span className={styles.pbarValue}>{freelancer.ratingBreakdown.value.toFixed(1)}</span>
              </div>
            </aside>

          </div>

        </div>

      </main>

      {/* 3. MINI FOOTER */}
      <footer className={styles.footerMini}>
        <div className={styles.footerMiniLogo}>
          <span style={{ color: '#FFFFFF' }}>Ad</span>
          <span style={{ color: 'var(--color-accent-orange)' }}>Freelancin</span>
        </div>
        
        <nav className={styles.footerMiniLinks} aria-label="Footer Navigation Links">
          <a href="#about" className={styles.footerMiniLink}>About</a>
          <a href="#privacy" className={styles.footerMiniLink}>Privacy</a>
          <a href="#terms" className={styles.footerMiniLink}>Terms</a>
        </nav>
        
        <p className={styles.footerCopyright}>&copy; 2026 AdFreelancin. All rights reserved.</p>
      </footer>

      {/* SCOPING MODAL FOR FRACTIONAL RETAINERS */}
      {isScopingModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#111C2A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--border-radius-card)',
            padding: '28px',
            width: '95%',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 'var(--font-size-title)', color: '#fff' }}>📅 Schedule Scoping Session</h3>
            <p style={{ color: 'var(--color-text-dark-bg-muted)', fontSize: 'var(--font-size-label)', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              For fractional roles, alignment is key. Propose a scoping conversation with <strong>{freelancer.name}</strong> to discuss goals, retainer terms, and expectations.
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-label)', color: 'var(--color-text-dark-bg-muted)', marginBottom: '6px', fontWeight: '600' }}>Proposed Date & Time</label>
              <input 
                type="text" 
                value={scopingTime}
                onChange={(e) => setScopingTime(e.target.value)}
                placeholder="e.g. Monday, July 13th at 3:00 PM"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-input)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: 'var(--font-size-body)',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
 
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-label)', color: 'var(--color-text-dark-bg-muted)', marginBottom: '6px', fontWeight: '600' }}>Engagement Scope & Expectations</label>
              <textarea 
                value={scopingNote}
                onChange={(e) => setScopingNote(e.target.value)}
                placeholder="Briefly describe what you're looking for, goals, and key responsibilities..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-input)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: 'var(--font-size-body)',
                  boxSizing: 'border-box',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.4'
                }}
              />
            </div>
 
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setIsScopingModalOpen(false)}
                className={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isScheduling}
                onClick={handleScheduleCallConfirm}
                className={styles.modalSubmitBtn}
              >
                {isScheduling ? 'Scheduling...' : 'Schedule Call'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIRE MODAL */}
      {isHireModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#111C2A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--border-radius-card)',
            padding: '28px',
            width: '95%',
            maxWidth: '500px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 'var(--font-size-title)', color: '#fff' }}>Hire {freelancer.name}</h3>
            <p style={{ color: 'var(--color-text-dark-bg-muted)', fontSize: 'var(--font-size-label)', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              Create a custom contract offer. Please specify the job title, scope description, required skillset, and budget details.
            </p>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-label)', color: 'var(--color-text-dark-bg-muted)', marginBottom: '6px', fontWeight: '600' }}>Job Title</label>
              <input 
                type="text" 
                value={hireJobTitle}
                onChange={(e) => setHireJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Integration Project"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-input)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: 'var(--font-size-body)',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-dark-bg-muted)', fontWeight: '600' }}>Scope of Work & Expectations</label>
                <button
                  type="button"
                  onClick={handleGenerateAIScope}
                  disabled={isGeneratingScope}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--color-accent-orange)',
                    fontSize: 'var(--font-size-label)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '0 4px',
                    outline: 'none',
                    opacity: isGeneratingScope ? 0.7 : 1
                  }}
                >
                  {isGeneratingScope ? '✨ Generating...' : '✨ Write with AI'}
                </button>
              </div>
              <textarea 
                value={hireJobDescription}
                onChange={(e) => setHireJobDescription(e.target.value)}
                placeholder="Detail the deliverables, tasks, and expectations..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-input)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: 'var(--font-size-body)',
                  boxSizing: 'border-box',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.4'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-label)', color: 'var(--color-text-dark-bg-muted)', marginBottom: '6px', fontWeight: '600' }}>Budget (₹)</label>
                <input 
                  type="number" 
                  value={hireJobBudget}
                  onChange={(e) => setHireJobBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--border-radius-input)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: 'var(--font-size-body)',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-size-label)', color: 'var(--color-text-dark-bg-muted)', marginBottom: '6px', fontWeight: '600' }}>Duration</label>
                <select 
                  value={hireJobDuration}
                  onChange={(e) => setHireJobDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--border-radius-input)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: '#1E293B',
                    color: '#fff',
                    fontSize: 'var(--font-size-body)',
                    boxSizing: 'border-box',
                    height: '40px',
                    outline: 'none'
                  }}
                >
                  <option value="1 Month">1 Month or less</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6+ Months">6+ Months</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-label)', color: 'var(--color-text-dark-bg-muted)', marginBottom: '6px', fontWeight: '600' }}>Skills Required (Comma separated)</label>
              <input 
                type="text" 
                value={hireJobSkills}
                onChange={(e) => setHireJobSkills(e.target.value)}
                placeholder="e.g. React, Node.js, REST API"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--border-radius-input)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: 'var(--font-size-body)',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
 
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setIsHireModalOpen(false)}
                className={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmHireSubmit}
                disabled={isSubmittingHire}
                className={styles.modalSubmitBtn}
              >
                {isSubmittingHire ? 'Sending Offer...' : 'Send Hire Offer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
