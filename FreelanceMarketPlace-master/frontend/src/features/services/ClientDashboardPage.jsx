import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ClientDashboardPage.module.css';
import Header from '../../components/Header';
import AccountRolesSettings from '../../components/AccountRolesSettings';
import MessagingInbox from '../../components/MessagingInbox';
import { ChartBar, Briefcase, Users, Handshake, FileText, CreditCard, Envelope, Gear, SignOut } from '@phosphor-icons/react';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000')
  : 'https://freelancemarketplace-backend.onrender.com';

export default function ClientDashboardPage() {
  const navigate = useNavigate();

  // Load current user from session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'Overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    const subParam = searchParams.get('sub');
    if (subParam) {
      setSettingsTab(subParam);
    }
  }, [searchParams]);

  // Inner settings tab sub-state
  const [settingsTab, setSettingsTab] = useState('Profile');

  // Client Data States
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [hiredFreelancers, setHiredFreelancers] = useState([]);
  const [loadingHired, setLoadingHired] = useState(true);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Settings profile form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [locationVal, setLocationVal] = useState('');
  const [bioVal, setBioVal] = useState('');
  const [hourlyRateVal, setHourlyRateVal] = useState('');
  const [availabilityVal, setAvailabilityVal] = useState('Available Now');
  const [savingSettings, setSavingSettings] = useState(false);
  const [githubUrlVal, setGithubUrlVal] = useState('');
  const [linkedinUrlVal, setLinkedinUrlVal] = useState('');
  const [portfolioUrlVal, setPortfolioUrlVal] = useState('');

  // Parse current user initials and split names
  useEffect(() => {
    if (currentUser) {
      const split = (currentUser.full_name || '').split(' ');
      setFirstName(split[0] || '');
      setLastName(split.slice(1).join(' ') || '');
      setProfessionalTitle(currentUser.role || '');
      setLocationVal(currentUser.location || '');
      setBioVal(currentUser.bio || '');
      setHourlyRateVal(currentUser.hourly_rate || 2000);
      setAvailabilityVal(currentUser.availability || 'Available Now');
      setGithubUrlVal(currentUser.github_url || '');
      setLinkedinUrlVal(currentUser.linkedin_url || '');
      setPortfolioUrlVal(currentUser.portfolio_url || '');
    }
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const sub = params.get('sub');
    if (tab === 'Settings') {
      setActiveTab('Settings');
      if (sub === 'Roles') {
        setSettingsTab('Roles');
      }
    }
  }, []);

  // Fetch client data
  useEffect(() => {
    async function fetchClientData() {
      if (!currentUser?.id) return;

      // 1. Fetch Job posts posted by this client
      try {
        const res = await fetch(`${API_BASE_URL}/listings/?creator_id=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter(item => item.listing_type === 'job');
          setMyJobs(filtered);
        }
      } catch (err) {
        console.warn("Failed to fetch client jobs:", err);
      } finally {
        setLoadingJobs(false);
      }

      // 2. Fetch hired freelancer orders (buyer_id === currentUser.id)
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          const formatted = await Promise.all(data.map(async (item) => {
            let freelancerName = 'Freelancer';
            let initials = 'FL';
            let avatarBg = '#EBF1F5';
            if (item.seller_id) {
              try {
                const profileRes = await fetch(`${API_BASE_URL}/users/${item.seller_id}`);
                if (profileRes.ok) {
                  const profile = await profileRes.json();
                  freelancerName = profile.full_name || profile.name || 'Freelancer';
                  initials = profile.initials || freelancerName.split(' ').map(n => n[0]).join('').toUpperCase();
                  avatarBg = profile.avatar_bg || '#EBF1F5';
                }
              } catch (e) {
                console.warn("Failed to fetch freelancer profile:", e);
              }
            }

            let proposal = 'No cover message provided.';
            let duration = item.due_date || 'N/A';
            let isDirectHire = item.listing_id === item.seller_id;
            let isProduct = false;
            if (item.due_date && item.due_date.startsWith('{')) {
              try {
                const parsed = JSON.parse(item.due_date);
                proposal = parsed.proposal;
                duration = parsed.duration;
                if (parsed.is_direct_hire !== undefined) {
                  isDirectHire = !!parsed.is_direct_hire;
                }
                if (parsed.is_product !== undefined) {
                  isProduct = !!parsed.is_product;
                }
              } catch (e) {
                // Ignore and use fallback
              }
            }

            return {
              id: item.id,
              seller_id: item.seller_id,
              freelancerName,
              freelancerInitials: initials,
              avatarBg,
              gigTitle: item.gig_title || 'Project Scope',
              dueDate: duration,
              proposalMessage: proposal,
              value: item.total_price || 0,
              status: item.status || 'Pending',
              isRated: item.is_rated || false,
              isDirectHire,
              isProduct
            };
          }));

          const activeHires = formatted.filter(o => 
            (o.status !== 'applied' && o.status !== 'declined') || 
            (o.status === 'applied' && o.isDirectHire)
          );
          const jobApps = formatted.filter(o => o.status === 'applied' && !o.isDirectHire);

          setHiredFreelancers(activeHires);
          setApplications(jobApps);
        }
      } catch (err) {
        console.warn("Failed to fetch hired contracts:", err);
      } finally {
        setLoadingHired(false);
      }

      // 3. Fetch conversations
      try {
        const res = await fetch(`${API_BASE_URL}/messages/${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          const uniquePartners = {};
          data.forEach(msg => {
            const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
            if (!uniquePartners[partnerId] || new Date(msg.created_at) > new Date(uniquePartners[partnerId].created_at)) {
              uniquePartners[partnerId] = msg;
            }
          });

          const partnerIds = Object.keys(uniquePartners);
          const resolved = await Promise.all(partnerIds.map(async (partnerId) => {
            const lastMsg = uniquePartners[partnerId];
            let senderName = 'Candidate';
            let initials = 'CD';
            let avatarBg = '#FFF0EB';
            try {
              const profileRes = await fetch(`${API_BASE_URL}/users/${partnerId}`);
              if (profileRes.ok) {
                const profile = await profileRes.json();
                senderName = profile.full_name || profile.name || 'Candidate';
                initials = profile.initials || senderName.split(' ').map(n => n[0]).join('').toUpperCase();
                avatarBg = profile.avatar_bg || '#FFF0EB';
              }
            } catch (e) {
              console.warn("Failed to fetch partner profile:", e);
            }
            return {
              id: lastMsg.id,
              sender: senderName,
              senderInitials: initials,
              avatarBg,
              time: new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              snippet: lastMsg.message
            };
          }));
          setMessages(resolved);
        }
      } catch (err) {
        console.warn("Failed to fetch inbox messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    fetchClientData();
  }, [currentUser?.id]);

  // Save Settings handler
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    setSavingSettings(true);
    const updatedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const initials = firstName.trim().slice(0, 1).toUpperCase() + (lastName.trim().slice(0, 1).toUpperCase() || '');

    const updatePayload = {
      full_name: updatedFullName,
      role: professionalTitle,
      location: locationVal,
      bio: bioVal,
      hourly_rate: parseFloat(hourlyRateVal) || 0,
      initials: initials,
      github_url: githubUrlVal.trim() || null,
      linkedin_url: linkedinUrlVal.trim() || null,
      portfolio_url: portfolioUrlVal.trim() || null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });
      if (response.ok) {
        const freshUser = { ...currentUser, ...updatePayload };
        setCurrentUser(freshUser);
        localStorage.setItem('currentUser', JSON.stringify(freshUser));
        alert("Client profile settings saved successfully!");
      } else {
        alert("Failed to save client settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error: Failed to update cloud database.");
    } finally {
      setSavingSettings(false);
    }
  };
 
  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !preset || cloudName === 'your_cloud_name') {
      alert("Please configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.");
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    
    try {
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({})); throw new Error(errorData.error?.message || "Failed to upload image to Cloudinary");
      }
      
      const data = await uploadRes.json();
      const imageUrl = data.secure_url;
      
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: imageUrl })
      });
      
      if (response.ok) {
        const freshUser = { ...currentUser, avatar_url: imageUrl };
        setCurrentUser(freshUser);
        localStorage.setItem('currentUser', JSON.stringify(freshUser));
        alert("Profile photo updated successfully!");
      } else {
        alert("Failed to update profile picture in database.");
      }
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message || "Failed to upload profile photo."}`);
    }
  };
 
  const handleRemoveAvatar = async () => {
    const confirmRemove = window.confirm("Are you sure you want to remove your profile photo?");
    if (!confirmRemove) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: null })
      });
      
      if (response.ok) {
        const freshUser = { ...currentUser, avatar_url: null };
        setCurrentUser(freshUser);
        localStorage.setItem('currentUser', JSON.stringify(freshUser));
        alert("Profile photo removed.");
      } else {
        alert("Failed to remove profile photo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error: Failed to remove profile photo.");
    }
  };

  const handleDiscard = () => {
    if (currentUser) {
      const split = (currentUser.full_name || '').split(' ');
      setFirstName(split[0] || '');
      setLastName(split.slice(1).join(' ') || '');
      setProfessionalTitle(currentUser.role || '');
      setLocationVal(currentUser.location || '');
      setBioVal(currentUser.bio || '');
      setHourlyRateVal(currentUser.hourly_rate || 2000);
      setAvailabilityVal(currentUser.availability || 'Available Now');
    }
  };

  const handleCompleteJob = async (orderId) => {
    const confirmComplete = window.confirm("Are you sure you want to mark this job as completed?");
    if (!confirmComplete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/complete?client_id=${currentUser.id}`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert("Job marked as completed successfully!");
        
        // Refresh local state status
        setHiredFreelancers(prev => prev.map(h => 
          h.id === orderId ? { ...h, status: 'completed', isRated: false } : h
        ));
        
        // Redirect client to the rating page
        navigate(`/dashboard/orders/${orderId}/rate`);
      } else {
        const errData = await response.json();
        alert(errData.detail || "Failed to mark job as completed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to reach server.");
    }
  };
 
  const handleStartRetainer = async (orderId) => {
    const confirmStart = window.confirm("Are you sure you want to finalize the retainer terms and start the contract?");
    if (!confirmStart) return;
 
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress' })
      });
      if (response.ok) {
        alert("Retainer contract active! Status updated to 'In Progress'.");
        setHiredFreelancers(prev => prev.map(o => o.id === orderId ? { ...o, status: 'In Progress' } : o));
      } else {
        alert("Failed to start retainer.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to update order status.");
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'In Progress'
        })
      });

      if (response.ok) {
        alert("The applicant's proposal has been successfully accepted. A formal contract has been established, and the project is now tracked under your active hires.");
        
        // Move the accepted application into hired freelancers state
        const acceptedApp = applications.find(app => app.id === applicationId);
        if (acceptedApp) {
          const updatedApp = { ...acceptedApp, status: 'In Progress' };
          setHiredFreelancers(prev => [updatedApp, ...prev]);
          setApplications(prev => prev.filter(app => app.id !== applicationId));
        }
      } else {
        alert("Server error: Failed to accept application.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to reach server.");
    }
  };

  const handleDeclineApplication = async (applicationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'declined'
        })
      });
      if (response.ok) {
        alert("The proposal has been formally declined, and the applicant has been notified.");
        setApplications(prev => prev.filter(app => app.id !== applicationId));
      } else {
        alert("Server error: Failed to decline application.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to reach server.");
    }
  };
 
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!currentUser) return null;

  // Overview spent calculation
  const totalSpent = hiredFreelancers.reduce((sum, h) => sum + h.value, 0);
  const activeHiredList = hiredFreelancers.filter(h => !(h.status === 'completed' && h.isRated));
  const pastCollaborations = hiredFreelancers.filter(h => h.status === 'completed' && h.isRated);

  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. CLIENT DASHBOARD HEADER NAVBAR */}
      <Header activeTab="Dashboard" />

      {/* 2. SPLIT-SCREEN WORKSPACE */}
      <div className={styles.layoutSplit}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Hiring Portal</h2>

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Overview' ? styles.sidebarItemActive : ''}`}
            onClick={() => setActiveTab('Overview')}
          >
            <div className={styles.sidebarItemContent}>
              <ChartBar size={18} className={styles.sidebarIcon} />
              <span>Overview</span>
            </div>
          </button>

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'My Jobs' ? styles.sidebarItemActive : ''}`}
            onClick={() => setActiveTab('My Jobs')}
          >
            <div className={styles.sidebarItemContent}>
              <Briefcase size={18} className={styles.sidebarIcon} />
              <span>My Job Posts</span>
            </div>
            {myJobs.length > 0 && <span className={styles.countBadge}>{myJobs.length}</span>}
          </button>

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Hired' ? styles.sidebarItemActive : ''}`}
            onClick={() => setActiveTab('Hired')}
          >
            <div className={styles.sidebarItemContent}>
              <Users size={18} className={styles.sidebarIcon} />
              <span>Hired Freelancers</span>
            </div>
            {activeHiredList.length > 0 && <span className={styles.countBadge}>{activeHiredList.length}</span>}
          </button>

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Past Collaborations' ? styles.sidebarItemActive : ''}`}
            onClick={() => setActiveTab('Past Collaborations')}
          >
            <div className={styles.sidebarItemContent}>
              <Handshake size={18} className={styles.sidebarIcon} />
              <span>Past Collaborations</span>
            </div>
            {pastCollaborations.length > 0 && <span className={styles.countBadge}>{pastCollaborations.length}</span>}
          </button>

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Applications' ? styles.sidebarItemActive : ''}`}
            onClick={() => setActiveTab('Applications')}
          >
            <div className={styles.sidebarItemContent}>
              <FileText size={18} className={styles.sidebarIcon} />
              <span>Applications</span>
            </div>
            {applications.length > 0 && <span className={styles.countBadge}>{applications.length}</span>}
          </button>

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Payments' ? styles.sidebarItemActive : ''}`}
            onClick={() => setActiveTab('Payments')}
          >
            <div className={styles.sidebarItemContent}>
              <CreditCard size={18} className={styles.sidebarIcon} />
              <span>Payments</span>
            </div>
          </button>

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Messages' ? styles.sidebarItemActive : ''}`}
            onClick={() => setActiveTab('Messages')}
          >
            <div className={styles.sidebarItemContent}>
              <Envelope size={18} className={styles.sidebarIcon} />
              <span>Messages</span>
            </div>
            {messages.length > 0 && <span className={styles.countBadge}>{messages.length}</span>}
          </button>

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Settings' ? styles.sidebarItemActive : ''}`}
            onClick={() => setActiveTab('Settings')}
          >
            <div className={styles.sidebarItemContent}>
              <Gear size={18} className={styles.sidebarIcon} />
              <span>Settings</span>
            </div>
          </button>

          <div className={styles.divider} />

          <button type="button" className={styles.sidebarItem} onClick={handleLogout}>
            <div className={styles.sidebarItemContent}>
              <SignOut size={18} className={styles.sidebarIcon} />
              <span>Log Out</span>
            </div>
          </button>
        </aside>

        {/* 3. MAIN TAB CONTENT */}
        <main className={styles.mainArea}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Good morning, {currentUser.full_name.split(' ')[0]}</h1>
                <p className={styles.welcomeSubtitle}>Track your hiring budgets and active contract milestones.</p>
              </div>

              {/* Stats Widgets */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>₹{totalSpent.toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>Total Spent</span>
                  <span className={styles.statFooter}>Across all project hires</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{activeHiredList.length}</span>
                  <span className={styles.statLabel}>Active Hires</span>
                  <span className={styles.statFooter}>Contractors in progress</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{myJobs.length}</span>
                  <span className={styles.statLabel}>Open Job Posts</span>
                  <span className={styles.statFooter}>Project posts looking for talent</span>
                </div>
              </div>

              {/* Hired Freelancers summary */}
              <section aria-labelledby="hires-heading">
                <h2 className={styles.sectionTitle} id="hires-heading">Hired Freelancers</h2>
                
                {activeHiredList.length > 0 ? (
                  <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead className={styles.thead}>
                          <tr>
                            <th scope="col" className={styles.th}>Freelancer</th>
                            <th scope="col" className={styles.th}>Contract scope</th>
                            <th scope="col" className={styles.th}>Due</th>
                            <th scope="col" className={styles.th}>Total Value</th>
                            <th scope="col" className={styles.th}>Status</th>
                            <th scope="col" className={styles.th}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeHiredList.map((hire) => (
                            <tr key={hire.id} className={styles.tbodyRow}>
                              <td className={styles.td}>
                                <div className={styles.clientCell}>
                                  <div className={styles.clientAvatar} style={{ backgroundColor: hire.avatarBg }}>
                                    {hire.freelancerInitials}
                                  </div>
                                  <span className={styles.clientName}>{hire.freelancerName}</span>
                                </div>
                              </td>
                              <td className={styles.td}>{hire.gigTitle}</td>
                              <td className={styles.td}>{hire.dueDate}</td>
                              <td className={styles.td}>₹{hire.value.toLocaleString('en-IN')}</td>
                              <td className={styles.td}>
                                <span className={styles.statusBadge}>
                                  {hire.status === 'applied' ? 'Pending Acceptance' : hire.status}
                                </span>
                              </td>
                              <td className={styles.td}>
                                {hire.status === 'applied' ? (
                                  <span style={{ color: '#8A93A2', fontSize: 'var(--font-size-label)', fontStyle: 'italic' }}>{hire.isProduct ? 'Awaiting Seller' : 'Awaiting Freelancer'}</span>
                                ) : hire.status !== 'completed' ? (
                                  <button 
                                    className={styles.completeBtn}
                                    onClick={() => handleCompleteJob(hire.id)}
                                  >
                                    {hire.isProduct ? 'Order Received' : 'Complete Job'}
                                  </button>
                                ) : !hire.isRated ? (
                                  <button 
                                    className={styles.rateBtn}
                                    onClick={() => navigate(`/dashboard/orders/${hire.id}/rate`)}
                                  >
                                    {hire.isProduct ? 'Rate Seller' : 'Rate Freelancer'}
                                  </button>
                                ) : (
                                  <span className={styles.ratedText}>Rated ✓</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className={styles.infoCard}>
                    <h3>No active hires</h3>
                    <p>You haven't hired any freelancers yet. Search talent or post a job to begin!</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: MY JOBS */}
          {activeTab === 'My Jobs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>My Job Posts ({myJobs.length})</h1>
                <p className={styles.welcomeSubtitle}>Manage active project scopes looking for developer candidates.</p>
              </div>

              {myJobs.length > 0 ? (
                <div className={styles.gigsListGrid}>
                  {myJobs.map((job) => (
                    <div key={job.id} className={styles.gigItemCard}>
                      {job.images && job.images.length > 0 ? (
                        <img src={job.images[0]} alt="Company Logo" className={styles.gigItemLogo} />
                      ) : (
                        <div className={styles.gigItemIconFallback}>
                          <Briefcase size={24} weight="duotone" />
                        </div>
                      )}
                      <h3 className={styles.gigItemName}>{job.title}</h3>
                      <p className={styles.gigItemDesc}>{job.description}</p>
                      <div className={styles.gigItemMeta}>
                        <span>Budget: ₹{job.price.toLocaleString('en-IN')}</span>
                        <span>Category: {job.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.infoCard}>
                  <h3>No job posts found</h3>
                  <p>You haven't posted any jobs yet. Click "Post a Job" in the header to get started!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HIRED */}
          {activeTab === 'Hired' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Freelancer Contracts</h1>
                <p className={styles.welcomeSubtitle}>Track budgets and milestone deliverable deadlines.</p>
              </div>

              {activeHiredList.length > 0 ? (
                <div className={styles.tableCard}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.thead}>
                        <tr>
                          <th scope="col" className={styles.th}>Freelancer</th>
                          <th scope="col" className={styles.th}>Gig Scope</th>
                          <th scope="col" className={styles.th}>Due</th>
                          <th scope="col" className={styles.th}>Price</th>
                          <th scope="col" className={styles.th}>Status</th>
                          <th scope="col" className={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeHiredList.map((hire) => (
                          <tr key={hire.id} className={styles.tbodyRow}>
                            <td className={styles.td}>
                              <div className={styles.clientCell}>
                                <div className={styles.clientAvatar} style={{ backgroundColor: hire.avatarBg }}>
                                  {hire.freelancerInitials}
                                </div>
                                <span className={styles.clientName}>{hire.freelancerName}</span>
                              </div>
                            </td>
                            <td className={styles.td}>{hire.gigTitle}</td>
                            <td className={styles.td}>{hire.dueDate}</td>
                            <td className={styles.td}>₹{hire.value.toLocaleString('en-IN')}</td>
                            <td className={styles.td}>
                              <span className={styles.statusBadge}>
                                {hire.status === 'applied' ? 'Pending Acceptance' : hire.status}
                              </span>
                            </td>
                            <td className={styles.td}>
                              {hire.status === 'applied' ? (
                                <span style={{ color: '#8A93A2', fontSize: 'var(--font-size-label)', fontStyle: 'italic' }}>{hire.isProduct ? 'Awaiting Seller' : 'Awaiting Freelancer'}</span>
                              ) : hire.status === 'Discovery Call' ? (
                                <button 
                                  className={styles.completeBtn}
                                  onClick={() => handleStartRetainer(hire.id)}
                                  style={{ backgroundColor: '#E05A26', borderColor: '#E05A26' }}
                                >
                                  Start Retainer
                                </button>
                              ) : hire.status !== 'completed' ? (
                                <button 
                                  className={styles.completeBtn}
                                  onClick={() => handleCompleteJob(hire.id)}
                                >
                                  {hire.isProduct ? 'Order Received' : 'Complete Job'}
                                </button>
                              ) : !hire.isRated ? (
                                <button 
                                  className={styles.rateBtn}
                                  onClick={() => navigate(`/dashboard/orders/${hire.id}/rate`)}
                                >
                                  {hire.isProduct ? 'Rate Seller' : 'Rate Freelancer'}
                                </button>
                              ) : (
                                <span className={styles.ratedText}>Rated ✓</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={styles.infoCard}>
                  <h3>No hired freelancers found</h3>
                  <p>Browse top freelancer talent to assign project tasks.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: PAST COLLABORATIONS */}
          {activeTab === 'Past Collaborations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Past Collaborations</h1>
                <p className={styles.welcomeSubtitle}>History of successfully delivered projects and rated contractors.</p>
              </div>
              
              {pastCollaborations.length > 0 ? (
                <div className={styles.tableCard}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.thead}>
                        <tr>
                          <th scope="col" className={styles.th}>Freelancer</th>
                          <th scope="col" className={styles.th}>Contract Scope</th>
                          <th scope="col" className={styles.th}>Timeline / Due</th>
                          <th scope="col" className={styles.th}>Contract Value</th>
                          <th scope="col" className={styles.th}>Status</th>
                          <th scope="col" className={styles.th}>Rating Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastCollaborations.map((collab) => (
                          <tr key={collab.id} className={styles.tbodyRow}>
                            <td className={styles.td}>
                              <div className={styles.clientCell}>
                                <div className={styles.clientAvatar} style={{ backgroundColor: collab.avatarBg }}>
                                  {collab.freelancerInitials}
                                </div>
                                <span className={styles.clientName}>{collab.freelancerName}</span>
                              </div>
                            </td>
                            <td className={styles.td}>{collab.gigTitle}</td>
                            <td className={styles.td}>{collab.dueDate}</td>
                            <td className={styles.td}>₹{collab.value.toLocaleString('en-IN')}</td>
                            <td className={styles.td}>
                              <span className={`${styles.statusBadge}`}>
                                completed
                              </span>
                            </td>
                            <td className={styles.td}>
                              <span style={{ color: '#10B981', fontWeight: 'bold' }}>Rated ✓</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={styles.infoCard}>
                  <h3>No past collaborations</h3>
                  <p>You haven't fully completed and rated any contracts yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: APPLICATIONS */}
          {activeTab === 'Applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Job Applications</h1>
                <p className={styles.welcomeSubtitle}>Review candidate proposals for your open job posts.</p>
              </div>

              <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead className={styles.thead}>
                      <tr>
                        <th scope="col" className={styles.th}>Applicant</th>
                        <th scope="col" className={styles.th}>Job Post</th>
                        <th scope="col" className={styles.th}>Proposal Message</th>
                        <th scope="col" className={styles.th}>Requested Rate</th>
                        <th scope="col" className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.length > 0 ? (
                        applications.map((app) => (
                          <tr key={app.id} className={styles.tbodyRow}>
                            <td className={styles.td}>
                              <div className={styles.clientCell}>
                                <div className={styles.clientAvatar} style={{ backgroundColor: app.avatarBg || '#1E3A8A' }}>
                                  {app.freelancerInitials}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span className={styles.clientName}>{app.freelancerName}</span>
                                  <a 
                                    href={`/freelancer/${app.seller_id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-accent-orange, #E05A26)', textDecoration: 'none', fontWeight: 'bold', marginTop: '2px' }}
                                  >
                                    View Profile ↗
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className={styles.td}>{app.gigTitle}</td>
                            <td className={styles.td} style={{ whiteSpace: 'pre-wrap' }}>{app.proposalMessage}</td>
                            <td className={styles.td}>₹{app.value.toLocaleString('en-IN')}</td>
                            <td className={styles.td}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  className={styles.btnAccept} 
                                  onClick={() => handleAcceptApplication(app.id)}
                                >
                                  Accept
                                </button>
                                <button 
                                  className={styles.btnDecline} 
                                  onClick={() => handleDeclineApplication(app.id)}
                                >
                                  Decline
                                </button>
                                <button 
                                  className={styles.btnMessage} 
                                  onClick={() => navigate(`/dashboard?tab=Messages&partnerId=${app.seller_id}`)}
                                >
                                  Message
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className={styles.td} style={{ textAlign: 'center', color: '#6B7280', padding: '32px 0' }}>
                            No active job applications found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === 'Payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Payments &amp; Transactions</h1>
                <p className={styles.welcomeSubtitle}>Track milestones escrow, deposited balances, and invoice receipts.</p>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>₹{totalSpent.toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>Total Funds Deposited</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>₹{(hiredFreelancers.filter(h => h.status === 'completed').reduce((sum, h) => sum + h.value, 0)).toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>Released to Freelancers</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>₹{(hiredFreelancers.filter(h => h.status !== 'completed').reduce((sum, h) => sum + h.value, 0)).toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>Held in Escrow</span>
                </div>
              </div>

              <div className={styles.tableCard}>
                <h3 style={{ padding: '20px 20px 0', margin: 0, fontSize: 'var(--font-size-body)', fontWeight: 800 }}>Escrow Transactions</h3>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead className={styles.thead}>
                      <tr>
                        <th scope="col" className={styles.th}>Freelancer</th>
                        <th scope="col" className={styles.th}>Contract Scope</th>
                        <th scope="col" className={styles.th}>Amount</th>
                        <th scope="col" className={styles.th}>Escrow Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hiredFreelancers.map((hire) => (
                        <tr key={hire.id} className={styles.tbodyRow}>
                          <td className={styles.td}>{hire.freelancerName}</td>
                          <td className={styles.td}>{hire.gigTitle}</td>
                          <td className={styles.td}>₹{hire.value.toLocaleString('en-IN')}</td>
                          <td className={styles.td}>
                            <span className={styles.statusBadge} style={{ backgroundColor: hire.status === 'completed' ? '#D1FAE5' : '#FEF3C7', color: hire.status === 'completed' ? '#065F46' : '#92400E' }}>
                              {hire.status === 'completed' ? 'RELEASED' : 'HELD IN ESCROW'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MESSAGES */}
          {activeTab === 'Messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Inbox Chats</h1>
                <p className={styles.welcomeSubtitle}>Coordinate milestones, reviews, and schedules with candidates.</p>
              </div>

              <MessagingInbox currentUser={currentUser} activeRole="client" />
            </div>
          )}

          {/* TAB 5: SETTINGS (Figma Screen 13) */}
          {activeTab === 'Settings' && (
            <div className={styles.settingsLayoutContainer}>
              <aside className={styles.settingsSubSidebar} aria-label="Settings categories">
                <h2 className={styles.settingsSubSidebarTitle}>Settings</h2>
                <button
                  type="button"
                  className={`${styles.settingsSubSidebarItem} ${settingsTab === 'Profile' ? styles.settingsSubSidebarItemActive : ''}`}
                  onClick={() => setSettingsTab('Profile')}
                >
                  Profile
                </button>
                <button
                  type="button"
                  className={`${styles.settingsSubSidebarItem} ${settingsTab === 'Roles' ? styles.settingsSubSidebarItemActive : ''}`}
                  onClick={() => setSettingsTab('Roles')}
                >
                  Account Roles
                </button>
                <button
                  type="button"
                  className={`${styles.settingsSubSidebarItem} ${settingsTab === 'Security' ? styles.settingsSubSidebarItemActive : ''}`}
                  onClick={() => setSettingsTab('Security')}
                >
                  Security
                </button>
              </aside>

              <div className={styles.settingsSubContent}>
                {settingsTab === 'Roles' && (
                  <AccountRolesSettings />
                )}
                {settingsTab === 'Profile' && (
                  <form onSubmit={handleSaveChanges} className={styles.settingsForm}>
                    <h2 className={styles.settingsFormTitle}>Profile Settings</h2>
                    
                    {/* Avatar upload (Cloudinary) */}
                     <div className={styles.avatarUploadCard} style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', padding: '20px', borderRadius: 'var(--border-radius-card)', border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                       <div className={styles.avatarLargeCircle} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: currentUser.avatar_bg || '#1B2A41', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-display)', fontWeight: 'bold', color: '#fff', overflow: 'hidden' }}>
                         {currentUser.avatar_url ? (
                           <img 
                             src={currentUser.avatar_url} 
                             alt={currentUser.full_name} 
                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                           />
                         ) : (
                           currentUser.initials
                         )}
                       </div>
                       <div className={styles.avatarUploadInfo}>
                         <h4 className={styles.avatarUploadTitle} style={{ margin: '0 0 4px 0', fontSize: 'var(--font-size-body)', color: '#fff' }}>Profile Photo</h4>
                         <p className={styles.avatarUploadDesc} style={{ margin: '0 0 12px 0', fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>JPG or PNG, max 2MB</p>
                         <div className={styles.avatarUploadActions} style={{ display: 'flex', gap: '8px' }}>
                           <input 
                             type="file" 
                             id="avatar-file-input" 
                             accept="image/*" 
                             style={{ display: 'none' }} 
                             onChange={(e) => handleAvatarUpload(e.target.files[0])}
                           />
                           <button
                             type="button"
                             className={styles.btnSecondarySmall}
                             onClick={() => document.getElementById('avatar-file-input').click()}
                           >
                             Upload Photo
                           </button>
                           {currentUser.avatar_url && (
                             <button
                               type="button"
                               className={styles.btnDangerSmall}
                               onClick={handleRemoveAvatar}
                             >
                               Remove
                             </button>
                           )}
                         </div>
                       </div>
                     </div>
                    
                    {/* Name grid */}
                    <div className={styles.formGridTwoCol}>
                      <div className={styles.formFieldGroup}>
                        <label className={styles.formLabel}>First Name</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className={styles.formFieldGroup}>
                        <label className={styles.formLabel}>Last Name</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formFieldGroup}>
                      <label className={styles.formLabel}>Professional Title / Role</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={professionalTitle}
                        onChange={(e) => setProfessionalTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className={styles.formFieldGroup}>
                      <label className={styles.formLabel}>Location</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={locationVal}
                        onChange={(e) => setLocationVal(e.target.value)}
                        placeholder="e.g. Mumbai, India"
                      />
                    </div>

                      {/* Professional Links */}
                      <div className={styles.formGridTwoCol}>
                        <div className={styles.formFieldGroup}>
                          <label className={styles.formLabel}>GitHub Profile (Optional)</label>
                          <input
                            type="url"
                            className={styles.formInput}
                            value={githubUrlVal}
                            onChange={(e) => setGithubUrlVal(e.target.value)}
                            placeholder="https://github.com/username"
                          />
                        </div>
                        <div className={styles.formFieldGroup}>
                          <label className={styles.formLabel}>LinkedIn Profile (Optional)</label>
                          <input
                            type="url"
                            className={styles.formInput}
                            value={linkedinUrlVal}
                            onChange={(e) => setLinkedinUrlVal(e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                      </div>

                      <div className={styles.formFieldGroup}>
                        <label className={styles.formLabel}>Portfolio Website (Optional)</label>
                        <input
                          type="url"
                          className={styles.formInput}
                          value={portfolioUrlVal}
                          onChange={(e) => setPortfolioUrlVal(e.target.value)}
                          placeholder="https://myportfolio.com"
                        />
                      </div>

                    <div className={styles.formFieldGroup}>
                      <label className={styles.formLabel}>Bio / Description</label>
                      <textarea
                        className={styles.formTextarea}
                        rows="4"
                        value={bioVal}
                        onChange={(e) => setBioVal(e.target.value)}
                      />
                    </div>

                    {/* Actions */}
                    <div className={styles.formActionsRow}>
                      <button type="submit" disabled={savingSettings} className={styles.btnPrimarySave}>
                        {savingSettings ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button type="button" onClick={handleDiscard} className={styles.btnSecondaryDiscard}>
                        Discard
                      </button>
                    </div>
                  </form>
                )}

                {settingsTab === 'Security' && (
                  <div className={styles.settingsMockCard}>
                    <h3>Security Settings</h3>
                    <p>Configure password security settings below.</p>
                    <button
                      type="button"
                      className={styles.btnSecondarySmall}
                      onClick={() => alert("Password reset link sent to your email.")}
                    >
                      Reset Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className={styles.footerMini}>
        <div className={styles.footerMiniLogo}>
          <span style={{ color: '#FFFFFF' }}>Ad</span>
          <span style={{ color: 'var(--color-accent-orange, #E05A26)' }}>Freelancin</span>
        </div>
        <p className={styles.footerCopyright}>&copy; 2026 AdFreelancin. All rights reserved.</p>
      </footer>

    </div>
  );
}
