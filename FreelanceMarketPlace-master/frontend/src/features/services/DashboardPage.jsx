import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../../data/productsData';
import styles from './DashboardPage.module.css';
import Header from '../../components/Header';
import AccountRolesSettings from '../../components/AccountRolesSettings';
import MessagingInbox from '../../components/MessagingInbox';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000')
  : 'https://freelancemarketplace-backend.onrender.com';

const MOCK_ORDERS = [];

const MOCK_MESSAGES = [];

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

export default function DashboardPage() {
  const navigate = useNavigate();

  // Load the current user from localStorage session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      id: '',
      full_name: 'User',
      initials: 'U',
      role: 'Freelancer',
      email: ''
    };
  });

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

  // Settings inner sub-tab state
  const [settingsTab, setSettingsTab] = useState('Profile');

  // Form input field state variables for settings
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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  
  // Fractional Engagement States
  const [engagementTypeVal, setEngagementTypeVal] = useState('task');
  const [monthlyRateVal, setMonthlyRateVal] = useState('50000');
  const [hoursPerWeekVal, setHoursPerWeekVal] = useState('10');
  const [minimumCommitmentMonthsVal, setMinimumCommitmentMonthsVal] = useState('3');
  const [domainVal, setDomainVal] = useState('CTO');
 
  // Version updates modal states
  const [isVerModalOpen, setIsVerModalOpen] = useState(false);
  const [selectedGigForVer, setSelectedGigForVer] = useState(null);
  const [newVersionNum, setNewVersionNum] = useState('');
  const [verChangeNote, setVerChangeNote] = useState('');
  const [savingVersion, setSavingVersion] = useState(false);
  
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
      
      setEngagementTypeVal(currentUser.engagement_type || 'task');
      setMonthlyRateVal(currentUser.monthly_rate || '50000');
      setHoursPerWeekVal(currentUser.hours_per_week || '10');
      setMinimumCommitmentMonthsVal(currentUser.minimum_commitment_months || '3');
      setDomainVal(currentUser.domain || 'CTO');
      setGithubUrlVal(currentUser.github_url || '');
      setLinkedinUrlVal(currentUser.linkedin_url || '');
      setPortfolioUrlVal(currentUser.portfolio_url || '');
      setSelectedCategories(currentUser.category ? currentUser.category.split(',').map(c => c.trim()) : []);
      const subsFromSkills = (currentUser.skills || []).filter(s => s.startsWith('subcategory:')).map(s => s.replace('subcategory:', ''));
      setSelectedSubcategories(subsFromSkills.length > 0 ? subsFromSkills : (currentUser.subcategory ? currentUser.subcategory.split(',').map(s => s.trim()) : []));
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

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      alert("First Name cannot be empty.");
      return;
    }
    setSavingSettings(true);
    const updatedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const initials = firstName.trim().slice(0, 1).toUpperCase() + (lastName.trim().slice(0, 1).toUpperCase() || '');
    
    const updatePayload = {
      full_name: updatedFullName,
      role: professionalTitle,
      location: locationVal,
      bio: bioVal,
      initials: initials,
      engagement_type: engagementTypeVal,
      github_url: githubUrlVal.trim() || null,
      linkedin_url: linkedinUrlVal.trim() || null,
      portfolio_url: portfolioUrlVal.trim() || null
    };

    if (currentUser?.role !== 'Client') {
      updatePayload.category = selectedCategories.join(', ');
      updatePayload.subcategory = selectedSubcategories.join(', ');
      const existingSkills = (currentUser.skills || []).filter(s => !s.startsWith('subcategory:'));
      updatePayload.skills = [...existingSkills, ...selectedSubcategories.map(s => `subcategory:${s}`)];
    }

    if (engagementTypeVal === 'task') {
      updatePayload.hourly_rate = parseFloat(hourlyRateVal) || 0;
      updatePayload.monthly_rate = null;
      updatePayload.hours_per_week = null;
      updatePayload.minimum_commitment_months = null;
      updatePayload.domain = null;
    } else {
      updatePayload.hourly_rate = null;
      updatePayload.monthly_rate = parseFloat(monthlyRateVal) || 0;
      updatePayload.hours_per_week = parseInt(hoursPerWeekVal, 10) || 0;
      updatePayload.minimum_commitment_months = parseInt(minimumCommitmentMonthsVal, 10) || 0;
      updatePayload.domain = domainVal;
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
        const subcategories = (updatePayload.skills || []).filter(s => s.startsWith('subcategory:')).map(s => s.replace('subcategory:', ''));
        const cleanSkills = (updatePayload.skills || []).filter(s => !s.startsWith('subcategory:'));
        const freshUser = {
          ...currentUser,
          ...updatePayload,
          subcategory: subcategories.join(', '),
          skills: cleanSkills
        };
        setCurrentUser(freshUser);
        localStorage.setItem('currentUser', JSON.stringify(freshUser));
        alert("Profile settings saved successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to save settings: ${errorData.detail || 'Server error'}`);
      }
    } catch (err) {
      console.error("Failed to update profile settings:", err);
      alert("Connection error: Failed to save settings to the cloud.");
    } finally {
      setSavingSettings(false);
    }
  };

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
      setSelectedCategories(currentUser.category ? currentUser.category.split(',').map(c => c.trim()) : []);
      const subsFromSkills = (currentUser.skills || []).filter(s => s.startsWith('subcategory:')).map(s => s.replace('subcategory:', ''));
      setSelectedSubcategories(subsFromSkills.length > 0 ? subsFromSkills : (currentUser.subcategory ? currentUser.subcategory.split(',').map(s => s.trim()) : []));
    }
  };

  // Load digital products list dynamically
  const products = getProducts();

  const [backendGigs, setBackendGigs] = useState([]);
  const [loadingGigs, setLoadingGigs] = useState(true);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedGigRequest, setSelectedGigRequest] = useState(null);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    async function fetchMyGigs() {
      try {
        const response = await fetch(`${API_BASE_URL}/listings/?creator_id=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          const servicesOnly = data.filter(item => 
            item.listing_type === 'service' && 
            !item.title?.startsWith('Direct Service Contract')
          );
          const formatted = servicesOnly.map(item => ({
            id: item.id,
            emoji: item.emoji || '💻',
            name: item.title || item.name || 'Service Gig',
            description: item.description || '',
            price: item.price || 0,
            sales: item.sales || 0,
            images: item.images || []
          }));
          setBackendGigs(formatted);
        }
      } catch (err) {
        console.warn("Failed to fetch seller gigs from backend, fallback to local store:", err);
      } finally {
        setLoadingGigs(false);
      }
    }
    if (currentUser?.id) {
      fetchMyGigs();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Fetch orders where the user is the seller
        const response = await fetch(`${API_BASE_URL}/orders/seller/${currentUser.id}`);
        let sellerOrders = [];
        if (response.ok) {
          sellerOrders = await response.json();
        }

        // Fetch orders where the user is the buyer (purchased products)
        const buyerResponse = await fetch(`${API_BASE_URL}/orders/${currentUser.id}`);
        let buyerOrders = [];
        if (buyerResponse.ok) {
          const rawBuyer = await buyerResponse.json();
          // Filter to only include product purchases
          buyerOrders = rawBuyer.filter(item => {
            if (item.due_date && item.due_date.startsWith('{')) {
              try {
                const parsed = JSON.parse(item.due_date);
                return !!parsed.is_product;
              } catch (e) {
                return false;
              }
            }
            return false;
          });
        }

        const combinedData = [
          ...sellerOrders.map(o => ({ ...o, roleType: 'seller' })),
          ...buyerOrders.map(o => ({ ...o, roleType: 'buyer' }))
        ];

        const formatted = await Promise.all(combinedData.map(async (item) => {
          const isBuyerRole = item.roleType === 'buyer';
          const profileToFetch = isBuyerRole ? item.seller_id : item.buyer_id;
          let contactName = 'User';
          let avatarBg = '#EBF1F5';
          
          if (profileToFetch) {
            try {
              const profileRes = await fetch(`${API_BASE_URL}/users/${profileToFetch}`);
              if (profileRes.ok) {
                const p = await profileRes.json();
                contactName = p.full_name || p.name || 'User';
                avatarBg = p.avatar_bg || '#EBF1F5';
              }
            } catch (e) {
              console.warn("Failed to fetch profile:", e);
            }
          }

          const initials = contactName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
          let proposal = '';
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
            clientName: contactName,
            clientInitials: initials,
            avatarBg,
            isAvatarOrange: initials === 'RK',
            gigTitle: item.gig_title || 'Service Gig',
            dueDate: duration,
            proposalMessage: proposal,
            value: item.total_price || 0,
            status: item.status || 'Pending',
            isDirectHire,
            isRated: item.is_rated || false,
            isProduct,
            roleType: item.roleType
          };
        }));

        setOrders(formatted);
      } catch (err) {
        console.warn("Failed to fetch dashboard orders from database:", err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (currentUser?.id) {
      fetchOrders();
    }
  }, [currentUser?.id]);
 
  const handleAcceptRetainer = async (orderId, clientName) => {
    const confirmAccept = window.confirm(`Are you sure you want to accept the scoping terms and start this Fractional Retainer for ${clientName}?`);
    if (!confirmAccept) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress' })
      });
      if (response.ok) {
        alert("Fractional Retainer started successfully! The status is now 'In Progress'.");
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'In Progress' } : o));
      } else {
        alert("Failed to start retainer.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to update order status.");
    }
  };

  const handleAcceptDirectHire = async (orderId, clientName) => {
    const orderObj = orders.find(o => o.id === orderId);
    const isProduct = orderObj ? orderObj.isProduct : false;

    const confirmAccept = window.confirm(
      isProduct 
        ? `Are you sure you want to accept this product order request from ${clientName}?`
        : `Are you sure you want to accept the custom contract offer from ${clientName} and begin the project?`
    );
    if (!confirmAccept) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress' })
      });
      if (response.ok) {
        alert(isProduct ? "Order accepted successfully! The order is now 'In Progress'." : "Contract accepted successfully! The project is now 'In Progress'.");
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'In Progress' } : o));
      } else {
        alert(isProduct ? "Failed to accept order." : "Failed to accept contract.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to update order status.");
    }
  };

  const handleCompleteJob = async (orderId) => {
    const confirmComplete = window.confirm("Are you sure you want to mark this purchase order as received?");
    if (!confirmComplete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/complete?client_id=${currentUser.id}`, {
        method: 'PUT'
      });
      if (response.ok) {
        alert("Product order marked as completed successfully!");
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: 'completed', isRated: false } : o
        ));
      } else {
        const errData = await response.json();
        alert(errData.detail || "Failed to mark order as completed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to reach server.");
    }
  };

  const handleDeclineDirectHire = async (orderId) => {
    const confirmDecline = window.confirm("Are you sure you want to decline this contract offer?");
    if (!confirmDecline) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' })
      });
      if (response.ok) {
        alert("Contract offer declined.");
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        alert("Failed to decline contract offer.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to update order status.");
    }
  };
 
  const handleOpenUpdateVersionModal = (gig) => {
    setSelectedGigForVer(gig);
    setNewVersionNum('');
    setVerChangeNote('');
    setIsVerModalOpen(true);
  };
 
  const handleSaveVersionConfirm = async () => {
    if (!newVersionNum.trim()) {
      alert("Please enter a version number (e.g. 1.1).");
      return;
    }
    if (!verChangeNote.trim()) {
      alert("Please enter a change note.");
      return;
    }
 
    setSavingVersion(true);
 
    try {
      const getRes = await fetch(`${API_BASE_URL}/listings/${selectedGigForVer.id}`);
      if (!getRes.ok) throw new Error("Failed to load listing details");
      const listingData = await getRes.json();
      
      const currentHistory = listingData.version_history || [];
      const updatedHistory = [
        ...currentHistory,
        {
          version_number: newVersionNum.trim(),
          change_note: verChangeNote.trim(),
          updated_at: new Date().toISOString()
        }
      ];
 
      const response = await fetch(`${API_BASE_URL}/listings/${selectedGigForVer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version_history: updatedHistory })
      });
 
      if (response.ok) {
        alert(`Version v${newVersionNum} updated successfully!`);
        setIsVerModalOpen(false);
      } else {
        alert("Failed to update version history.");
      }
    } catch (err) {
      console.error(err);
      alert("Error: Could not save version update.");
    } finally {
      setSavingVersion(false);
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

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(`${API_BASE_URL}/messages/${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          const uniquePartners = {};
          data.forEach(msg => {
            const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
            if (!uniquePartners[partnerId] || new Date(msg.created_at) > new Date(uniquePartners[partnerId].created_at)) {
              uniquePartners[partnerId] = msg;
            }
          });

          const partnerIds = Object.keys(uniquePartners);
          const resolvedMessages = await Promise.all(partnerIds.map(async (partnerId) => {
            const lastMsg = uniquePartners[partnerId];
            let senderName = 'Client';
            let initials = 'CL';
            let avatarBg = '#FFF0EB';
            try {
              const res = await fetch(`${API_BASE_URL}/users/${partnerId}`);
              if (res.ok) {
                const profile = await res.json();
                senderName = profile.full_name || profile.name || 'Client';
                initials = profile.initials || senderName.split(' ').map(n => n[0]).join('').toUpperCase();
                avatarBg = profile.avatar_bg || '#FFF0EB';
              }
            } catch (e) {
              console.warn("Failed to fetch message partner profile:", e);
            }
            return {
              id: lastMsg.id,
              sender: senderName,
              senderInitials: initials,
              avatarBg,
              isAvatarOrange: initials === 'RK',
              time: new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              snippet: lastMsg.message
            };
          }));

          setMessages(resolvedMessages);
        }
      } catch (err) {
        console.warn("Failed to fetch inbox messages from database:", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    if (currentUser?.id) {
      fetchMessages();
    }
  }, [currentUser?.id]);

  // Earnings calculations
  const completedEscrow = orders
    .filter(o => o.status === 'Completed')
    .reduce((sum, o) => sum + o.value, 0);

  const pendingEscrow = orders
    .filter(o => o.status === 'In Progress' || o.status === 'Review' || o.status === 'On Track')
    .reduce((sum, o) => sum + o.value, 0);
  
  const totalEarnings = completedEscrow + pendingEscrow;

  const gigRequests = orders.filter(o => o.status === 'applied' && o.isDirectHire && !o.isProduct);
  const activeOrders = orders.filter(o => 
    !(o.status === 'applied' && o.isDirectHire && !o.isProduct) && 
    !(o.status === 'completed' && o.isRated)
  );
  const pastCollaborations = orders.filter(o => o.status === 'completed' && o.isRated);

  // Filter active seller's own gigs (both default and custom user creations)
  const myGigs = backendGigs.length > 0 ? backendGigs : products.filter(
    prod => {
      const creatorId = prod.creator?.id || prod.sellerId || prod.seller_id;
      return creatorId === currentUser.id || creatorId === 't_custom';
    }
  );

  const handleSidebarClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleLogout = () => {
    // Clear session and return to the home screen
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. SELLER NAVIGATION BAR (nav-5) */}
      <Header activeTab="Dashboard" />

      {/* 2. SIDEBAR SPLIT LAYOUT (layout-sb-14) */}
      <div className={styles.layoutSplit}>
        
        {/* Sidebar Nav (sidebar-15) */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>
            {currentUser?.active_role === 'seller_only' ? 'Seller Hub' : 'Freelancer Portal'}
          </h2>
          
          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Overview' ? styles.sidebarItemActive : ''}`}
            onClick={() => handleSidebarClick('Overview')}
          >
            <span className={styles.sidebarItemIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>
            </span>
            <span className={styles.sidebarItemLabel}>Overview</span>
          </button>

          {currentUser?.active_role === 'seller_only' ? (
            <>
              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'My Gigs' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('My Gigs')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>My Products</span>
                {myGigs.length > 0 && <span className={styles.countBadge}>{myGigs.length}</span>}
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Orders' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Orders')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Orders</span>
                {activeOrders.length > 0 && <span className={styles.countBadge}>{activeOrders.length}</span>}
              </button>

              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Gig Requests' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Gig Requests')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Gig Requests</span>
                {gigRequests.length > 0 && <span className={styles.countBadge}>{gigRequests.length}</span>}
              </button>

              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Past Collaborations' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Past Collaborations')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Past Collaborations</span>
                {pastCollaborations.length > 0 && <span className={styles.countBadge}>{pastCollaborations.length}</span>}
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Inventory' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Inventory')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Inventory</span>
              </button>
              
              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Earnings' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Earnings')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Revenue</span>
              </button>
            </>
          ) : (
            <>
              <button 
                type="button"
                className={styles.sidebarItem}
                onClick={() => navigate('/jobs')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Find Jobs</span>
              </button>

              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'My Gigs' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('My Gigs')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>My Products</span>
                {myGigs.length > 0 && <span className={styles.countBadge}>{myGigs.length}</span>}
              </button>

              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Orders' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Orders')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Orders</span>
                {activeOrders.length > 0 && <span className={styles.countBadge}>{activeOrders.length}</span>}
              </button>

              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Gig Requests' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Gig Requests')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Gig Requests</span>
                {gigRequests.length > 0 && <span className={styles.countBadge}>{gigRequests.length}</span>}
              </button>

              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Past Collaborations' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Past Collaborations')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Past Collaborations</span>
                {pastCollaborations.length > 0 && <span className={styles.countBadge}>{pastCollaborations.length}</span>}
              </button>

              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Reviews' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Reviews')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Reviews</span>
              </button>

              <button 
                type="button"
                className={`${styles.sidebarItem} ${activeTab === 'Earnings' ? styles.sidebarItemActive : ''}`}
                onClick={() => handleSidebarClick('Earnings')}
              >
                <span className={styles.sidebarItemIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                </span>
                <span className={styles.sidebarItemLabel}>Earnings</span>
              </button>
            </>
          )}

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Messages' ? styles.sidebarItemActive : ''}`}
            onClick={() => handleSidebarClick('Messages')}
          >
            <span className={styles.sidebarItemIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </span>
            <span className={styles.sidebarItemLabel}>Messages</span>
            {messages.length > 0 && <span className={styles.countBadge}>{messages.length}</span>}
          </button>

          <div className={styles.divider} aria-hidden="true" />

          <button 
            type="button"
            className={`${styles.sidebarItem} ${activeTab === 'Settings' ? styles.sidebarItemActive : ''}`}
            onClick={() => handleSidebarClick('Settings')}
          >
            <span className={styles.sidebarItemIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </span>
            <span className={styles.sidebarItemLabel}>Settings</span>
          </button>

          <button 
            type="button"
            className={styles.sidebarItem}
            onClick={handleLogout}
            id="dashboard-logout-btn"
          >
            <span className={styles.sidebarItemIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </span>
            <span className={styles.sidebarItemLabel}>Log Out</span>
          </button>
        </aside>

        {/* 3. MAIN CONTENT WORKSPACE AREA */}
        <main className={styles.mainArea}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Good morning, {currentUser.full_name.split(' ')[0]}</h1>
                <p className={styles.welcomeSubtitle}>Here's what's happening with your account today.</p>
              </div>

              {/* Stat grid (stat-grid-59) */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>₹{totalEarnings.toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>Total Earnings</span>
                  <span className={`${styles.statFooter} ${styles.trendNeutral}`}>0% this month</span>
                </div>
                
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{orders.length}</span>
                  <span className={styles.statLabel}>Active Orders</span>
                  <span className={`${styles.statFooter} ${styles.trendNeutral}`}>0 due this week</span>
                </div>
                
                <div className={styles.statCard}>
                  <span className={styles.statValue}>0.0</span>
                  <span className={styles.statLabel}>Avg. Rating</span>
                  <span className={`${styles.statFooter} ${styles.trendNeutral}`}>0 reviews</span>
                </div>
                
                <div className={styles.statCard}>
                  <span className={styles.statValue}>0</span>
                  <span className={styles.statLabel}>Profile Views</span>
                  <span className={`${styles.statFooter} ${styles.trendNeutral}`}>0% this week</span>
                </div>
              </div>

              {/* Active Orders List (tbl-85) */}
              <section aria-labelledby="active-orders-heading">
                <h2 className={styles.sectionTitle} id="active-orders-heading">Active Orders</h2>
                
                {activeOrders.length > 0 ? (
                  <div className={styles.tableCard}>
                    <div className={styles.tableWrapper}>
                      <table className={styles.table}>
                        <thead className={styles.thead}>
                          <tr>
                            <th scope="col" className={styles.th}>Client</th>
                            <th scope="col" className={styles.th}>Gig</th>
                            <th scope="col" className={styles.th}>Due Date</th>
                            <th scope="col" className={styles.th}>Value</th>
                            <th scope="col" className={styles.th}>Status</th>
                            <th scope="col" className={styles.th}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeOrders.map((order) => (
                            <tr key={order.id} className={styles.tbodyRow}>
                              <td className={styles.td}>
                                <div className={styles.clientCell}>
                                  <div 
                                    className={`${styles.clientAvatar} ${order.isAvatarOrange ? styles.avatarOrange : styles.avatarNavy}`}
                                    aria-hidden="true"
                                  >
                                    {order.clientInitials}
                                  </div>
                                  <span className={styles.clientName}>{order.clientName}</span>
                                </div>
                              </td>
                              <td className={styles.td}>
                                <span className={styles.gigTitle}>{order.gigTitle}</span>
                              </td>
                              <td className={styles.td}>{order.dueDate}</td>
                              <td className={styles.td}>
                                <span className={styles.orderValue}>₹{order.value.toLocaleString('en-IN')}</span>
                              </td>
                              <td className={styles.td}>
                                <span className={`
                                  ${styles.statusBadge} 
                                  ${order.status === 'In Progress' ? styles.statusInProgress : ''}
                                  ${order.status === 'Discovery Call' ? styles.statusReview : ''}
                                  ${order.status === 'completed' ? styles.statusOnTrack : ''}
                                  ${order.status === 'applied' ? styles.statusReview : ''}
                                `}>
                                  {order.status === 'applied' ? 'Pending Offer' : order.status}
                                </span>
                              </td>
                              <td className={styles.td}>
                                {order.roleType === 'buyer' ? (
                                  <>
                                    {order.status === 'applied' && (
                                      <span style={{ color: '#8A93A2', fontSize: 'var(--font-size-label)', fontStyle: 'italic' }}>Awaiting Seller</span>
                                    )}
                                    {order.status === 'In Progress' && (
                                      <button 
                                        type="button"
                                        className={styles.btnAccept}
                                        onClick={() => handleCompleteJob(order.id)}
                                      >
                                        Order Received
                                      </button>
                                    )}
                                    {order.status === 'completed' && !order.isRated && (
                                      <button 
                                        type="button"
                                        className={styles.btnAccept}
                                        onClick={() => navigate(`/dashboard/orders/${order.id}/rate`)}
                                      >
                                        Rate Seller
                                      </button>
                                    )}
                                    {order.status === 'completed' && order.isRated && (
                                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)' }}>Rated ✓</span>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {order.status === 'Discovery Call' && (
                                      <button
                                        type="button"
                                        onClick={() => handleAcceptRetainer(order.id, order.clientName)}
                                        className={styles.btnAccept}
                                      >
                                        Accept Retainer
                                      </button>
                                    )}
                                    {order.status === 'applied' && (
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                          type="button"
                                          onClick={() => handleAcceptDirectHire(order.id, order.clientName)}
                                          className={styles.btnAccept}
                                        >
                                          Accept
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeclineDirectHire(order.id)}
                                          className={styles.btnDecline}
                                        >
                                          Decline
                                        </button>
                                      </div>
                                    )}
                                    {order.status === 'In Progress' && (
                                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)' }}>Active Retainer</span>
                                    )}
                                    {order.status === 'completed' && (
                                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)' }}>Finished ✓</span>
                                    )}
                                  </>
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
                    <h3 className={styles.infoCardTitle}>No active orders found</h3>
                    <p className={styles.infoCardText}>You don't have any active contracts or orders at the moment.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB 2: MY GIGS */}
          {activeTab === 'My Gigs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>
                  My Products ({myGigs.length})
                </h1>
                <p className={styles.welcomeSubtitle}>
                  Active digital assets and products currently visible in the catalog.
                </p>
              </div>

              {myGigs.length > 0 ? (
                <div className={styles.gigsListGrid}>
                  {myGigs.map((gig) => (
                    <div 
                      key={gig.id} 
                      className={styles.gigItemCard}
                      onClick={() => navigate('/product/' + gig.id)}
                    >
                      <div className={styles.gigItemEmoji} aria-hidden="true" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {gig.images && gig.images.length > 0 ? (
                          <img 
                            src={gig.images[0]} 
                            alt={gig.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          gig.emoji
                        )}
                      </div>
                      <h3 className={styles.gigItemName}>{gig.name}</h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)', lineHeight: '1.4', margin: 0 }}>
                        {gig.description}
                      </p>
                      <div className={styles.gigItemMeta}>
                        <span style={{ color: 'var(--color-accent-orange)', fontWeight: 800 }}>
                           ₹{gig.price.toLocaleString('en-IN')}
                        </span>
                        <span>{gig.sales} sales</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUpdateVersionModal(gig);
                        }}
                        className={styles.completeBtn}
                        style={{
                          marginTop: '12px',
                          width: '100%',
                          padding: '6px 12px',
                          fontSize: 'var(--font-size-label)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          borderRadius: 'var(--border-radius-input)',
                          cursor: 'pointer'
                        }}
                      >
                        Update Version
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.infoCard}>
                  <h3 className={styles.infoCardTitle}>No active products found</h3>
                  <p className={styles.infoCardText}>You haven't listed any products yet. Click "List Product" to start selling!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'Orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>All Orders</h1>
                <p className={styles.welcomeSubtitle}>Track milestones and delivery schedules for active contracts.</p>
              </div>
              
              {activeOrders.length > 0 ? (
                <div className={styles.tableCard}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.thead}>
                        <tr>
                          <th scope="col" className={styles.th}>Client</th>
                          <th scope="col" className={styles.th}>Gig Details</th>
                          <th scope="col" className={styles.th}>Due</th>
                          <th scope="col" className={styles.th}>Value</th>
                          <th scope="col" className={styles.th}>Status</th>
                          <th scope="col" className={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeOrders.map((order) => (
                          <tr key={order.id} className={styles.tbodyRow}>
                            <td className={styles.td}>
                              <div className={styles.clientCell}>
                                <div 
                                  className={`${styles.clientAvatar} ${order.isAvatarOrange ? styles.avatarOrange : styles.avatarNavy}`}
                                  aria-hidden="true"
                                >
                                  {order.clientInitials}
                                </div>
                                <span className={styles.clientName}>{order.clientName}</span>
                              </div>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.gigTitle}>{order.gigTitle}</span>
                            </td>
                            <td className={styles.td}>{order.dueDate}</td>
                            <td className={styles.td}>
                              <span className={styles.orderValue}>₹{order.value.toLocaleString('en-IN')}</span>
                            </td>
                            <td className={styles.td}>
                              <span className={`
                                ${styles.statusBadge} 
                                ${order.status === 'In Progress' ? styles.statusInProgress : ''}
                                ${order.status === 'Discovery Call' ? styles.statusReview : ''}
                                ${order.status === 'completed' ? styles.statusOnTrack : ''}
                                ${order.status === 'applied' ? styles.statusReview : ''}
                              `}>
                                {order.status === 'applied' ? 'Pending Offer' : order.status}
                              </span>
                            </td>
                            <td className={styles.td}>
                              {order.roleType === 'buyer' ? (
                                <>
                                  {order.status === 'applied' && (
                                    <span style={{ color: '#8A93A2', fontSize: 'var(--font-size-label)', fontStyle: 'italic' }}>Awaiting Seller</span>
                                  )}
                                  {order.status === 'In Progress' && (
                                    <button 
                                      type="button"
                                      className={styles.btnAccept}
                                      onClick={() => handleCompleteJob(order.id)}
                                    >
                                      Order Received
                                    </button>
                                  )}
                                  {order.status === 'completed' && !order.isRated && (
                                    <button 
                                      type="button"
                                      className={styles.btnAccept}
                                      onClick={() => navigate(`/dashboard/orders/${order.id}/rate`)}
                                    >
                                      Rate Seller
                                    </button>
                                  )}
                                  {order.status === 'completed' && order.isRated && (
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)' }}>Rated ✓</span>
                                  )}
                                </>
                              ) : (
                                <>
                                  {order.status === 'Discovery Call' && (
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptRetainer(order.id, order.clientName)}
                                      className={styles.btnAccept}
                                    >
                                      Accept Retainer
                                    </button>
                                  )}
                                  {order.status === 'applied' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <button
                                        type="button"
                                        onClick={() => handleAcceptDirectHire(order.id, order.clientName)}
                                        className={styles.btnAccept}
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeclineDirectHire(order.id)}
                                        className={styles.btnDecline}
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  )}
                                  {order.status === 'In Progress' && (
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)' }}>Active Retainer</span>
                                  )}
                                  {order.status === 'completed' && (
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label)' }}>Finished ✓</span>
                                  )}
                                </>
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
                  <h3 className={styles.infoCardTitle}>No active orders found</h3>
                  <p className={styles.infoCardText}>You don't have any active contracts or orders at the moment.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: GIG REQUESTS */}
          {activeTab === 'Gig Requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Incoming Gig Requests</h1>
                <p className={styles.welcomeSubtitle}>Review and accept custom contract offers and service requests from clients.</p>
              </div>
              
              {gigRequests.length > 0 ? (
                <div className={styles.tableCard}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.thead}>
                        <tr>
                          <th scope="col" className={styles.th}>Client</th>
                          <th scope="col" className={styles.th}>Gig Scope / Requirements</th>
                          <th scope="col" className={styles.th}>Duration</th>
                          <th scope="col" className={styles.th}>Budget Offered</th>
                          <th scope="col" className={styles.th}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gigRequests.map((req) => (
                          <tr key={req.id} className={styles.tbodyRow}>
                            <td className={styles.td}>
                              <div className={styles.clientCell}>
                                <div 
                                  className={`${styles.clientAvatar} ${req.isAvatarOrange ? styles.avatarOrange : styles.avatarNavy}`}
                                  aria-hidden="true"
                                >
                                  {req.clientInitials}
                                </div>
                                <span className={styles.clientName}>{req.clientName}</span>
                              </div>
                            </td>
                            <td className={styles.td}>
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
                                 <strong className={styles.gigTitle} style={{ fontSize: 'var(--font-size-body)' }}>{req.gigTitle}</strong>
                                 <span style={{ color: '#8A93A2', fontSize: 'var(--font-size-label)', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                                   {req.proposalMessage && req.proposalMessage.length > 120 
                                     ? `${req.proposalMessage.substring(0, 120)}...` 
                                     : req.proposalMessage}
                                 </span>
                                 {req.proposalMessage && req.proposalMessage.length > 120 && (
                                   <button
                                     type="button"
                                     onClick={() => setSelectedGigRequest(req)}
                                     style={{
                                       background: 'none',
                                       border: 'none',
                                       color: 'var(--color-accent-orange)',
                                       cursor: 'pointer',
                                       fontSize: 'var(--font-size-label)',
                                       fontWeight: '700',
                                       padding: '2px 0',
                                       textAlign: 'left',
                                       textDecoration: 'underline',
                                       outline: 'none',
                                       width: 'fit-content'
                                     }}
                                   >
                                     View Full Scope
                                   </button>
                                 )}
                               </div>
                             </td>
                            <td className={styles.td}>{req.dueDate}</td>
                            <td className={styles.td}>
                              <span className={styles.orderValue}>₹{req.value.toLocaleString('en-IN')}</span>
                            </td>
                            <td className={styles.td}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleAcceptDirectHire(req.id, req.clientName)}
                                  className={styles.btnAccept}
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeclineDirectHire(req.id)}
                                  className={styles.btnDecline}
                                >
                                  Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={styles.infoCard}>
                  <h3 className={styles.infoCardTitle}>No gig requests found</h3>
                  <p className={styles.infoCardText}>You don't have any pending contract or gig requests at the moment.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: PAST COLLABORATIONS */}
          {activeTab === 'Past Collaborations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Past Collaborations</h1>
                <p className={styles.welcomeSubtitle}>History of successfully delivered projects and rated contracts.</p>
              </div>
              
              {pastCollaborations.length > 0 ? (
                <div className={styles.tableCard}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead className={styles.thead}>
                        <tr>
                          <th scope="col" className={styles.th}>Client</th>
                          <th scope="col" className={styles.th}>Gig Scope</th>
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
                                <div 
                                  className={`${styles.clientAvatar} ${collab.isAvatarOrange ? styles.avatarOrange : styles.avatarNavy}`}
                                  aria-hidden="true"
                                >
                                  {collab.clientInitials}
                                </div>
                                <span className={styles.clientName}>{collab.clientName}</span>
                              </div>
                            </td>
                            <td className={styles.td}>
                              <span className={styles.gigTitle}>{collab.gigTitle}</span>
                            </td>
                            <td className={styles.td}>{collab.dueDate}</td>
                            <td className={styles.td}>
                              <span className={styles.orderValue}>₹{collab.value.toLocaleString('en-IN')}</span>
                            </td>
                            <td className={styles.td}>
                              <span className={`${styles.statusBadge} ${styles.statusOnTrack}`}>
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
                  <h3 className={styles.infoCardTitle}>No past collaborations</h3>
                  <p className={styles.infoCardText}>You don't have any fully completed and rated contracts yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MESSAGES */}
          {activeTab === 'Messages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Inbox Messages</h1>
                <p className={styles.welcomeSubtitle}>Communicate with buyers, review requirements, and coordinate delivery.</p>
              </div>

              <MessagingInbox currentUser={currentUser} activeRole={currentUser?.active_role} />
            </div>
          )}


          {/* TAB 5: REVIEWS */}
          {activeTab === 'Reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>My Reviews</h1>
                <p className={styles.welcomeSubtitle}>Feedback left by clients on your delivered services.</p>
              </div>

              <div className={styles.infoCard}>
                <div style={{ fontSize: 'calc(var(--font-size-display) * 1.7)', marginBottom: '12px' }}>★</div>
                <h3 className={styles.infoCardTitle}>No reviews yet</h3>
                <p className={styles.infoCardText}>
                  {currentUser.full_name} hasn't received any reviews yet. Complete customer orders to receive reviews!
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: EARNINGS */}
          {activeTab === 'Earnings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>
                  {currentUser?.active_role === 'seller_only' ? 'Revenue & Sales' : 'Earnings & Payouts'}
                </h1>
                <p className={styles.welcomeSubtitle}>
                  {currentUser?.active_role === 'seller_only'
                    ? 'Track product sales volume, pending credits, and payouts.'
                    : 'Manage withdrawal logs, pending balances, and escrow clearances.'}
                </p>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>₹{completedEscrow.toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>Withdrawn to Bank</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>₹{pendingEscrow.toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>Pending Escrow</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>₹0</span>
                  <span className={styles.statLabel}>Available for Withdrawal</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: INVENTORY */}
          {activeTab === 'Inventory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1 className={styles.welcomeTitle}>Product Inventory</h1>
                <p className={styles.welcomeSubtitle}>Manage stocks, downloads, and version updates for prebuilt code templates.</p>
              </div>

              <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead className={styles.thead}>
                      <tr>
                        <th scope="col" className={styles.th}>Product Name</th>
                        <th scope="col" className={styles.th}>Stock Status</th>
                        <th scope="col" className={styles.th}>Version</th>
                        <th scope="col" className={styles.th}>File Size</th>
                        <th scope="col" className={styles.th}>Downloads</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myGigs.length > 0 ? myGigs.map(gig => (
                        <tr key={gig.id} className={styles.tbodyRow}>
                          <td className={styles.td}>{gig.name}</td>
                          <td className={styles.td}>
                            <span className={styles.statusBadge} style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>INSTANT DELIVERY</span>
                          </td>
                          <td className={styles.td}>v1.0.0</td>
                          <td className={styles.td}>14.2 MB</td>
                          <td className={styles.td}>{gig.sales}</td>
                        </tr>
                      )) : (
                        <tr className={styles.tbodyRow}>
                          <td colSpan="5" className={styles.td} style={{ textAlign: 'center', padding: '40px' }}>
                            No products in inventory.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS (Figma Screen 13) */}
          {activeTab === 'Settings' && (
            <div className={styles.settingsLayoutContainer}>
              
              {/* Settings Sub-sidebar Menu */}
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
                  className={`${styles.settingsSubSidebarItem} ${settingsTab === 'LinkedIn' ? styles.settingsSubSidebarItemActive : ''}`}
                  onClick={() => setSettingsTab('LinkedIn')}
                >
                  LinkedIn
                </button>
                
                <button
                  type="button"
                  className={`${styles.settingsSubSidebarItem} ${settingsTab === 'Notifications' ? styles.settingsSubSidebarItemActive : ''}`}
                  onClick={() => setSettingsTab('Notifications')}
                >
                  Notifications
                </button>
                
                <button
                  type="button"
                  className={`${styles.settingsSubSidebarItem} ${settingsTab === 'Security' ? styles.settingsSubSidebarItemActive : ''}`}
                  onClick={() => setSettingsTab('Security')}
                >
                  Security
                </button>
                
                <button
                  type="button"
                  className={`${styles.settingsSubSidebarItem} ${settingsTab === 'Payments' ? styles.settingsSubSidebarItemActive : ''}`}
                  onClick={() => setSettingsTab('Payments')}
                >
                  Payment Methods
                </button>
                
                <button
                  type="button"
                  className={`${styles.settingsSubSidebarItem} ${settingsTab === 'Delete' ? styles.settingsSubSidebarItemActive : ''}`}
                  onClick={() => setSettingsTab('Delete')}
                >
                  Delete Account
                </button>
              </aside>

              {/* Settings Sub-content Panel */}
              <div className={styles.settingsSubContent}>
                {settingsTab === 'Roles' && (
                  <AccountRolesSettings />
                )}
                {settingsTab === 'Profile' && (
                  <form onSubmit={handleSaveChanges} className={styles.settingsForm}>
                    <h2 className={styles.settingsFormTitle}>Profile Settings</h2>
                    
                    {/* Avatar upload (Cloudinary) */}
                     <div className={styles.avatarUploadCard}>
                       <div className={styles.avatarLargeCircle} style={{ overflow: 'hidden' }}>
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
                         <h4 className={styles.avatarUploadTitle}>Profile Photo</h4>
                         <p className={styles.avatarUploadDesc}>JPG or PNG, max 2MB</p>
                         <div className={styles.avatarUploadActions}>
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

                    {/* Name Input Grid */}
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

                    {/* Professional Title */}
                    <div className={styles.formFieldGroup}>
                      <label className={styles.formLabel}>Professional Title</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        value={professionalTitle}
                        onChange={(e) => setProfessionalTitle(e.target.value)}
                        required
                        placeholder="e.g. Full Stack Developer · FastAPI · React"
                      />
                    </div>

                    {/* Location */}
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

                    {/* Bio */}
                    <div className={styles.formFieldGroup}>
                      <label className={styles.formLabel}>Bio</label>
                      <textarea
                        className={styles.formTextarea}
                        rows="4"
                        value={bioVal}
                        onChange={(e) => setBioVal(e.target.value)}
                        placeholder="Brief summary of your skills, credentials, and experience..."
                      />
                    </div>

                    {currentUser?.role !== 'Client' && (
                      <>
                        <div className={styles.formFieldGroup}>
                          <label className={styles.formLabel}>Professional Categories (Select one or more)</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '8px' }}>
                            {FREELANCER_CATEGORIES.map((cat) => {
                              const isChecked = selectedCategories.includes(cat);
                              return (
                                <label 
                                  key={cat} 
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px',
                                    border: isChecked ? '1.5px solid #E05A26' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 'var(--border-radius-input)',
                                    backgroundColor: isChecked ? 'rgba(224, 90, 38, 0.05)' : 'transparent',
                                    cursor: 'pointer',
                                    color: isChecked ? '#fff' : '#8A93A2',
                                    fontSize: 'var(--font-size-label)',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleCategoryToggle(cat)}
                                    style={{ accentColor: '#E05A26' }}
                                  />
                                  {cat}
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {selectedCategories.length > 0 && (
                          <div className={styles.formFieldGroup} style={{ marginTop: '16px', marginBottom: '24px' }}>
                            <label className={styles.formLabel}>Select Subcategories (Select one or more)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', marginTop: '8px' }}>
                              {selectedCategories.flatMap(cat => SUB_CATEGORIES_MAP[cat] || []).map((sub) => {
                                const isChecked = selectedSubcategories.includes(sub);
                                return (
                                  <label 
                                    key={sub} 
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '10px',
                                      border: isChecked ? '1.5px solid #E05A26' : '1px solid rgba(255, 255, 255, 0.1)',
                                      borderRadius: 'var(--border-radius-input)',
                                      backgroundColor: isChecked ? 'rgba(224, 90, 38, 0.05)' : 'transparent',
                                      cursor: 'pointer',
                                      color: isChecked ? '#fff' : '#8A93A2',
                                      fontSize: 'var(--font-size-label)',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleSubcategoryToggle(sub)}
                                      style={{ accentColor: '#E05A26' }}
                                    />
                                    {sub}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Service Delivery Style */}
                    <div className={styles.formFieldGroup} style={{ marginBottom: '24px' }}>
                      <label className={styles.formLabel}>Service Delivery Style</label>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                        <div 
                          onClick={() => setEngagementTypeVal('task')}
                          style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: 'var(--border-radius-card)',
                            border: engagementTypeVal === 'task' ? '2px solid #E05A26' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: engagementTypeVal === 'task' ? 'rgba(224, 90, 38, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontSize: 'var(--font-size-title)', marginBottom: '6px' }}>⏱️</div>
                          <div style={{ fontWeight: '700', fontSize: 'var(--font-size-body)', color: '#fff' }}>One-off / Hourly</div>
                          <div style={{ fontSize: 'var(--font-size-label)', color: '#8A93A2', marginTop: '4px' }}>Charge by the hour for general tasks</div>
                        </div>
                        <div 
                          onClick={() => setEngagementTypeVal('fractional')}
                          style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: 'var(--border-radius-card)',
                            border: engagementTypeVal === 'fractional' ? '2px solid #E05A26' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: engagementTypeVal === 'fractional' ? 'rgba(224, 90, 38, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '24px' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', color: engagementTypeVal === 'fractional' ? '#E05A26' : '#8A93A2' }}>
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                          </div>
                          <div style={{ fontWeight: '700', fontSize: 'var(--font-size-body)', color: '#fff' }}>Fractional / Retainer</div>
                          <div style={{ fontSize: 'var(--font-size-label)', color: '#8A93A2', marginTop: '4px' }}>Senior role retainer (e.g. CFO, CTO)</div>
                        </div>
                      </div>
                    </div>

                    {engagementTypeVal === 'task' ? (
                      <div className={styles.formGridTwoCol}>
                        <div className={styles.formFieldGroup}>
                          <label className={styles.formLabel}>Hourly Rate (₹)</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={hourlyRateVal}
                            onChange={(e) => setHourlyRateVal(e.target.value)}
                            required
                            min="0"
                          />
                        </div>
                        <div className={styles.formFieldGroup}>
                          <label className={styles.formLabel}>Availability</label>
                          <select
                            className={styles.formSelect}
                            value={availabilityVal}
                            onChange={(e) => setAvailabilityVal(e.target.value)}
                          >
                            <option value="Available Now">Available Now</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Busy">Busy</option>
                            <option value="Unavailable">Unavailable</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <div className={styles.formGridTwoCol}>
                          <div className={styles.formFieldGroup}>
                            <label className={styles.formLabel}>Monthly Retainer Rate (₹)</label>
                            <input
                              type="number"
                              className={styles.formInput}
                              value={monthlyRateVal}
                              onChange={(e) => setMonthlyRateVal(e.target.value)}
                              required
                              min="0"
                            />
                          </div>
                          <div className={styles.formFieldGroup}>
                            <label className={styles.formLabel}>Availability</label>
                            <select
                              className={styles.formSelect}
                              value={availabilityVal}
                              onChange={(e) => setAvailabilityVal(e.target.value)}
                            >
                              <option value="Available Now">Available Now</option>
                              <option value="Part-Time">Part-Time</option>
                              <option value="Busy">Busy</option>
                              <option value="Unavailable">Unavailable</option>
                            </select>
                          </div>
                        </div>
                        <div className={styles.formGridTwoCol}>
                          <div className={styles.formFieldGroup}>
                            <label className={styles.formLabel}>Hours / Week</label>
                            <input
                              type="number"
                              className={styles.formInput}
                              value={hoursPerWeekVal}
                              onChange={(e) => setHoursPerWeekVal(e.target.value)}
                              required
                              min="1"
                            />
                          </div>
                          <div className={styles.formFieldGroup}>
                            <label className={styles.formLabel}>Min Commitment (Months)</label>
                            <input
                              type="number"
                              className={styles.formInput}
                              value={minimumCommitmentMonthsVal}
                              onChange={(e) => setMinimumCommitmentMonthsVal(e.target.value)}
                              required
                              min="1"
                            />
                          </div>
                        </div>
                        <div className={styles.formFieldGroup}>
                          <label className={styles.formLabel}>Fractional Role / Domain</label>
                          <select 
                            className={styles.formSelect} 
                            value={domainVal}
                            onChange={(e) => setDomainVal(e.target.value)}
                          >
                            <option value="CTO">Fractional CTO (Technology)</option>
                            <option value="CFO">Fractional CFO (Finance)</option>
                            <option value="CMO">Fractional CMO (Marketing)</option>
                            <option value="CEO">Fractional CEO (Strategy)</option>
                            <option value="COO">Fractional COO (Operations)</option>
                            <option value="HR">Fractional HR Leader</option>
                            <option value="Product">Fractional Product Officer</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Form actions */}
                    <div className={styles.formActionsRow}>
                      <button
                        type="submit"
                        disabled={savingSettings}
                        className={styles.btnPrimarySave}
                      >
                        {savingSettings ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDiscard}
                        className={styles.btnSecondaryDiscard}
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                )}

                {settingsTab === 'LinkedIn' && (
                  <div className={styles.settingsMockCard}>
                    <h3 className={styles.settingsMockTitle}>LinkedIn Accounts</h3>
                    <p className={styles.settingsMockText}>
                      Your profile is successfully connected and verified under **{currentUser.full_name}**.
                    </p>
                    <button
                      type="button"
                      className={styles.btnDangerSmall}
                      onClick={() => alert("LinkedIn account disconnected.")}
                    >
                      Disconnect Account
                    </button>
                  </div>
                )}

                {settingsTab === 'Notifications' && (
                  <div className={styles.settingsMockCard}>
                    <h3 className={styles.settingsMockTitle}>Notification Settings</h3>
                    <p className={styles.settingsMockText}>Configure email alerts for messages, active order deliveries, and transactions.</p>
                    <label className={styles.mockCheckboxLabel}>
                      <input type="checkbox" defaultChecked /> Email alerts for incoming messages
                    </label>
                    <label className={styles.mockCheckboxLabel}>
                      <input type="checkbox" defaultChecked /> Order contract milestone status updates
                    </label>
                  </div>
                )}

                {settingsTab === 'Security' && (
                  <div className={styles.settingsMockCard}>
                    <h3 className={styles.settingsMockTitle}>Security Settings</h3>
                    <p className={styles.settingsMockText}>Update password and manage active browser session terminations.</p>
                    <button
                      type="button"
                      className={styles.btnSecondarySmall}
                      onClick={() => alert("Password reset link sent to your email.")}
                    >
                      Reset Password
                    </button>
                  </div>
                )}

                {settingsTab === 'Payments' && (
                  <div className={styles.settingsMockCard}>
                    <h3 className={styles.settingsMockTitle}>Payment Methods</h3>
                    <p className={styles.settingsMockText}>Link active bank accounts or UPI IDs to manage payouts.</p>
                    <button
                      type="button"
                      className={styles.btnSecondarySmall}
                      onClick={() => alert("Simulated Bank/UPI setup triggered.")}
                    >
                      Add Payment Method
                    </button>
                  </div>
                )}

                {settingsTab === 'Delete' && (
                  <div className={styles.settingsMockCard} style={{ borderColor: '#FCA5A5' }}>
                    <h3 className={styles.settingsMockTitle} style={{ color: '#DC2626' }}>Delete Account</h3>
                    <p className={styles.settingsMockText}>
                      WARNING: This action is permanent and cannot be undone. All active orders, message history, and published digital listings will be deleted forever.
                    </p>
                    <button
                      type="button"
                      className={styles.btnDangerSmall}
                      onClick={() => {
                        if (confirm("Are you absolutely sure you want to delete your AdFreelancin account? This cannot be undone.")) {
                          localStorage.removeItem('currentUser');
                          navigate('/');
                        }
                      }}
                    >
                      Delete Account Permanently
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </main>

      </div>

      {/* 4. FOOTER (footer-mini-144) */}
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

      {/* UPDATE VERSION MODAL FOR PRODUCTS */}
      {isVerModalOpen && (
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
            maxWidth: '450px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-title)', color: '#fff' }}>📦 Update Product Version</h3>
            <p style={{ color: '#8A93A2', fontSize: 'var(--font-size-label)', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              Publish an update version note for <strong>{selectedGigForVer?.name}</strong> to notify buyers about changes/fixes.
            </p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-label)', color: '#8A93A2', marginBottom: '6px', fontWeight: '600' }}>Version Number</label>
              <input 
                type="text" 
                value={newVersionNum}
                onChange={(e) => setNewVersionNum(e.target.value)}
                placeholder="e.g. 1.1 or 2.0"
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
              <label style={{ display: 'block', fontSize: 'var(--font-size-label)', color: '#8A93A2', marginBottom: '6px', fontWeight: '600' }}>Change Note</label>
              <textarea 
                value={verChangeNote}
                onChange={(e) => setVerChangeNote(e.target.value)}
                placeholder="Describe what changed in this version..."
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
                onClick={() => setIsVerModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--border-radius-input)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'transparent',
                  color: '#8A93A2',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={savingVersion}
                onClick={handleSaveVersionConfirm}
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--border-radius-input)',
                  border: 'none',
                  backgroundColor: '#E05A26',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: '600'
                }}
              >
                {savingVersion ? 'Saving...' : 'Publish Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GIG REQUEST DETAILS MODAL */}
      {selectedGigRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }} onClick={() => setSelectedGigRequest(null)}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--border-radius-card)',
            padding: '28px',
            width: '95%',
            maxWidth: '600px',
            maxHeight: '85vh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-title)', color: '#1E293B', fontWeight: '700' }}>Gig Request Scope</h3>
              <button 
                onClick={() => setSelectedGigRequest(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748B', 
                  fontSize: 'var(--font-size-title)', 
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong style={{ color: '#1E293B', fontSize: 'var(--font-size-body)' }}>{selectedGigRequest.gigTitle}</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: 'var(--font-size-label)', color: '#64748B' }}>
                <span><strong>Client:</strong> {selectedGigRequest.clientName}</span>
                <span><strong>Budget:</strong> ₹{selectedGigRequest.value.toLocaleString('en-IN')}</span>
                <span><strong>Duration:</strong> {selectedGigRequest.dueDate}</span>
              </div>
            </div>

            <div style={{ 
              overflowY: 'auto', 
              backgroundColor: '#F8FAFC',
              padding: '16px', 
              borderRadius: 'var(--border-radius-card)', 
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: 'var(--font-size-body)',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '45vh'
            }}>
              {selectedGigRequest.proposalMessage}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button"
                onClick={() => setSelectedGigRequest(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--border-radius-input)',
                  border: '1px solid #CBD5E1',
                  backgroundColor: 'transparent',
                  color: '#475569',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Close
              </button>
              <button 
                type="button"
                onClick={() => {
                  const req = selectedGigRequest;
                  setSelectedGigRequest(null);
                  handleAcceptDirectHire(req.id, req.clientName);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--border-radius-input)',
                  border: 'none',
                  backgroundColor: '#10B981',
                  color: '#fff',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                Accept Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
