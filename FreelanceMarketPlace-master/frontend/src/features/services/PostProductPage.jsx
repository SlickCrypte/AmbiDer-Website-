import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveProduct } from '../../data/productsData';
import styles from './PostProductPage.module.css';
import Header from '../../components/Header';
import { Sparkle, ShieldCheck, Check } from '@phosphor-icons/react';

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
  'Design': ['Figma', 'UI Kit', 'Design System', 'Icons', 'Illustrator', 'Mockup'],
  'Development': ['React', 'NodeJS', 'TypeScript', 'NextJS', 'Postgres', 'TailwindCSS'],
  'Data Analyst': ['Python', 'SQL', 'Tableau', 'Pandas', 'PowerBI', 'Data Pipeline'],
  'Writing & Translation': ['Copywriting', 'SEO Articles', 'Technical Doc', 'Localization', 'Proofreading'],
  'DevOps': ['Docker', 'AWS Config', 'CI/CD YAML', 'Kubernetes', 'GitHub Actions', 'Terraform'],
  'Accounting & Finance': ['Excel Template', 'QuickBooks', 'Tax Calculator', 'Financial Model', 'Bookkeeping'],
  'Sales & Marketing': ['SEO Checklist', 'Google Ads Template', 'Social Media Kit', 'Email Sequence', 'Sales Deck'],
  'Human Resources': ['Handbook Template', 'Onboarding Deck', 'HR Policies', 'Job Description', 'Compensation Model'],
  'Legal & Compliance': ['NDA Template', 'Privacy Policy', 'Contract Draft', 'Compliance Audit', 'GDPR Checklist'],
  'Operations & Management': ['Agile Board', 'Jira Template', 'Process Map', 'SOP Guide', 'Operations Tracker']
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

const DELIVERY_DURATION_OPTIONS = [
  { days: 1, title: '1 Day', label: 'Express Delivery', desc: 'Best for small scripts, assets, or immediate design resources.' },
  { days: 3, title: '3 Days', label: 'Standard Delivery', desc: 'Our standard delivery duration for complex kits, code bases, or decks.' },
  { days: 7, title: '7 Days', label: 'Extended Review', desc: 'Allows full QA/testing support and custom integrations setup.' },
  { days: 14, title: '14 Days', label: 'Extended Setup', desc: 'Allows comprehensive system adjustments and post-handover support.' },
  { days: 30, title: '30 Days', label: 'Enterprise Custom', desc: 'For bespoke assets requiring continuous custom engineering work.' }
];

const EMOMIS_LIST = ['🎨', '📊', '💻', '⚡', '📧', '💰', '✏️', '📚', '⚙️', '📁', '🚀', '💡'];

export default function PostProductPage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  const [activeStep, setActiveStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Development');
  const [subcategory, setSubcategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [price, setPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [selectedEmoji, setSelectedEmoji] = useState('💻');
  const [productImages, setProductImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(() => localStorage.getItem('adfreelancin_linkedin_connected') !== 'false');
  const [activeTab, setActiveTab] = useState('List Product');
  const [agreedToOwnership, setAgreedToOwnership] = useState(false);

  // Onboarding Tips state
  const [showTips, setShowTips] = useState(() => {
    return localStorage.getItem('adfreelancin_post_product_tips_dismissed') !== 'true';
  });

  const handleDismissTips = () => {
    localStorage.setItem('adfreelancin_post_product_tips_dismissed', 'true');
    setShowTips(false);
  };

  useEffect(() => {
    if (category && SUB_CATEGORIES_MAP[category]) {
      setSubcategory(SUB_CATEGORIES_MAP[category][0]);
    } else {
      setSubcategory('');
    }
  }, [category]);

  const handleTagChange = (e) => {
    const val = e.target.value;
    if (val.endsWith(',')) {
      const cleanTag = val.slice(0, -1).trim();
      addTag(cleanTag);
    } else {
      setTagInput(val);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (newTag) => {
    if (!newTag) return;
    if (tags.length >= 5) {
      setErrors({ ...errors, tags: 'You can add up to 5 skills & tags.' });
      return;
    }
    if (tags.includes(newTag)) {
      setTagInput('');
      return;
    }
    setTags([...tags, newTag]);
    setTagInput('');
    const updatedErrors = { ...errors };
    delete updatedErrors.tags;
    setErrors(updatedErrors);
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleGenerateSkeleton = () => {
    const skeleton = `### Product Overview\n[Describe who this is for and the main problems it solves]\n\n### Key Features\n- Feature 1: ...\n- Feature 2: ...\n- Feature 3: ...\n\n### What's Included\n- Main Asset: [e.g. .zip, .fig file, code snippets]\n- Documentation: [Instruction manual or read-me guide]\n\n### Requirements\n- [e.g. Node.js v18+, Figma Account, Excel v2021]`;
    setDescription(skeleton);
  };

  const handleGenerateAIDescription = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      alert("Please add VITE_GEMINI_API_KEY in your frontend/.env file.");
      return;
    }

    setIsGenerating(true);
    setDescription("Writing product description using Gemini AI...");

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Write a detailed, structured product description for: ${title.trim() || "My Product"}. Category: ${category} > ${subcategory}. Skills/Tags: ${tags.join(", ")}. Use clean markdown subheaders (e.g. ### Overview, ### Features, ### Included Files) and bullet points. Avoid using main '#' headers. Keep it informative, professional, and ready to publish.`;

      const result = await model.generateContent(prompt);
      const cleaned = result.response.text().trim();
      setDescription(cleaned);
    } catch (err) {
      console.error(err);
      alert("Error generating description: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};

    if (step === 1) {
      if (!title.trim()) {
        stepErrors.title = 'Product title is required.';
      } else if (title.length > 80) {
        stepErrors.title = 'Product title cannot exceed 80 characters.';
      } else if (title.length < 15) {
        stepErrors.title = 'Product title must be at least 15 characters.';
      }

      if (!category) {
        stepErrors.category = 'Category selection is required.';
      }

      if (!subcategory) {
        stepErrors.subcategory = 'Sub-category selection is required.';
      }

      if (!description.trim()) {
        stepErrors.description = 'Description is required.';
      } else if (description.length < 20) {
        stepErrors.description = 'Description must be at least 20 characters.';
      }
    }

    if (step === 2) {
      const priceNum = parseFloat(price);
      if (!price) {
        stepErrors.price = 'Price rate is required.';
      } else if (isNaN(priceNum) || priceNum <= 0) {
        stepErrors.price = 'Price must be a positive number.';
      }

      const daysNum = parseInt(deliveryDays, 10);
      if (!deliveryDays || isNaN(daysNum) || daysNum <= 0) {
        stepErrors.delivery = 'Delivery days must be a positive integer.';
      }
    }

    if (step === 4) {
      if (!agreedToOwnership) {
        stepErrors.ownership = 'You must certify ownership rights of these assets to publish.';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep(activeStep)) {
      if (activeStep < 4) {
        setActiveStep(activeStep + 1);
      } else {
        publishProduct();
      }
    }
  };

  const handleProductImageUploads = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !preset || cloudName === 'your_cloud_name') {
      alert("Please configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.");
      return;
    }
    
    setUploadingImages(true);
    const uploadedUrls = [];
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.secure_url);
        } else {
          console.warn("Failed to upload an image to Cloudinary");
        }
      }
      setProductImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error(err);
      alert("Error uploading images to Cloudinary.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    } else {
      navigate('/products');
    }
  };

  const publishProduct = async () => {
    if (!currentUser) {
      alert("You must be logged in to list a product.");
      return;
    }
    const sellerId = currentUser.id;
 
    const listingPayload = {
      id: generateUUID(),
      emoji: selectedEmoji,
      title: title,
      description: description.substring(0, 100) + '...',
      price: parseFloat(price),
      sales: 0,
      category: category === 'Design' ? 'UI Kits' : category === 'Spreadsheets' ? 'Spreadsheets' : ['Development', 'DevOps', 'Data Analyst'].includes(category) ? 'Code Snippets' : category,
      breadcrumb_category: category,
      seller_id: sellerId,
      listing_type: 'service',
      about: description,
      whats_included: tags.length > 0 ? tags.map(t => `${t} integration support`) : ['Delivery file template code'],
      delivery_days: parseInt(deliveryDays, 10),
      addons: [],
      images: productImages
    };
 
    try {
      const response = await fetch(`${API_BASE_URL}/listings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listingPayload)
      });
      if (response.ok) {
        console.log("Listing successfully published to Supabase database!");
      }
    } catch (err) {
      console.warn("Failed to publish listing to backend API, saving locally:", err);
    }
 
    const newProduct = {
      ...listingPayload,
      name: title,
      creator: {
        id: sellerId,
        name: currentUser.full_name || currentUser.name || 'Professional Creator',
        role: currentUser.role || 'Specialist',
        avatarBg: currentUser.avatar_bg || '#E05A26',
        initials: currentUser.initials || 'US',
        rating: currentUser.rating || 5.0,
        reviewsCount: currentUser.reviews_count || 0,
        isVerified: currentUser.is_verified || false
      },
      reviews: []
    };
 
    saveProduct(newProduct);
    setShowSuccessModal(true);
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
        sessionStorage.setItem('linkedin_return_to', '/post-product');
        const redirectUri = window.location.origin + '/linkedin-callback';
        window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;
      } else {
        setIsLinkedInConnected(true);
        localStorage.setItem('adfreelancin_linkedin_connected', 'true');
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. HEADER NAVIGATION BAR */}
      <Header activeTab="List Product" isLinkedInConnected={isLinkedInConnected} setIsLinkedInConnected={setIsLinkedInConnected} />

      {/* 2. BODY WIZARD FORMS */}
      <main className={styles.detailContainer}>
        
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumbRow}>
          <span className={styles.breadcrumbItem} onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className={styles.breadcrumbDivider}>&gt;</span>
          <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>List a Product</span>
        </nav>

        {/* Stepper details */}
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>List a new product</h1>
          <p className={styles.subtitle}>Fill in the details below to publish your product to thousands of verified clients.</p>
        </div>

        {/* Header Progress Indicators */}
        <div className={styles.wizardProgressRow} aria-label="Creation Steps Progress">
          {[1, 2, 3, 4].map((stepNum) => {
            const isCompleted = activeStep > stepNum;
            const isActive = activeStep === stepNum;
            const stepClass = `${styles.stepIndicator} ${isCompleted ? styles.stepIndicatorCompleted : ''} ${isActive ? styles.stepIndicatorActive : ''}`;
            return (
              <div key={stepNum} className={stepClass}>
                <div className={styles.indicatorCircle}>
                  {isCompleted ? (
                    <Check weight="bold" className={styles.checkIcon} />
                  ) : stepNum}
                </div>
                <span className={styles.indicatorLabel}>
                  {stepNum === 1 ? 'Overview' : stepNum === 2 ? 'Pricing' : stepNum === 3 ? 'Gallery' : 'Publish'}
                </span>
              </div>
            );
          })}
        </div>
        <div className={styles.divider} />

        {/* Onboarding Welcome tips box */}
        {activeStep === 1 && showTips && (
          <div className={styles.onboardingTipsCard} role="complementary" aria-label="Tips for listing a product">
            <div className={styles.onboardingTipsHeader}>
              <h3 className={styles.onboardingTipsTitle}>
                <Sparkle size={18} weight="duotone" className={styles.tipsSparkleIcon} />
                Seller Listing Guide
              </h3>
              <button 
                type="button" 
                className={styles.onboardingDismissBtn} 
                onClick={handleDismissTips}
                aria-label="Dismiss guide tips"
              >
                Dismiss Guide &times;
              </button>
            </div>
            <ul className={styles.onboardingTipsList}>
              <li className={styles.onboardingTipsItem}>
                <strong>Category Grid:</strong> Select a main category below to display your product inside the correct filters tab.
              </li>
              <li className={styles.onboardingTipsItem}>
                <strong>Product Description:</strong> Detail exactly what assets, files, or licenses are delivered. Use our <strong>AI Generator</strong> to draft structure instantly.
              </li>
              <li className={styles.onboardingTipsItem}>
                <strong>Product Symbol Badge:</strong> Choose a badge icon that clearly symbolizes your code, template, or kit.
              </li>
            </ul>
          </div>
        )}

        {/* Interactive steps wizard container */}
        <section className={styles.formCard}>
          
          {/* STEP 1: Overview */}
          {activeStep === 1 && (
            <div role="group" aria-label="Step 1 Overview Details" className={styles.stepContainer}>
              {/* Product Title */}
              <div className={styles.field}>
                <label htmlFor="product-title" className={styles.label}>Product Title</label>
                <input 
                  type="text" 
                  id="product-title"
                  className={styles.input} 
                  placeholder="e.g. Modern Figma UI kit for your startup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  disabled={isGenerating}
                  aria-describedby="title-helper"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span className={styles.inputHelper} id="title-helper">Max 80 characters</span>
                  <span className={styles.inputHelper}>{title.length}/80</span>
                </div>
                {errors.title && <span className={styles.errorText} role="alert">{errors.title}</span>}
              </div>

              {/* Visual Interactive Category Cards Grid */}
              <div className={styles.field}>
                <label className={styles.label}>Category</label>
                <p className={styles.inputHelper} style={{ marginBottom: '8px' }}>Select the primary vertical for your digital files</p>
                <div className={styles.categoryGrid}>
                  {Object.keys(SUB_CATEGORIES_MAP).map((cat) => {
                    const isActive = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`${styles.categoryCard} ${isActive ? styles.categoryCardActive : ''}`}
                        onClick={() => !isGenerating && setCategory(cat)}
                        disabled={isGenerating}
                      >
                        <span className={styles.categoryIcon}>
                          {CATEGORY_ICONS[cat]}
                        </span>
                        <span className={styles.categoryName}>{cat}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.category && <span className={styles.errorText} role="alert">{errors.category}</span>}
              </div>

              {/* Sub-category select chips */}
              {category && (
                <div className={styles.field}>
                  <label className={styles.label}>Sub-category</label>
                  <p className={styles.inputHelper} style={{ marginBottom: '8px' }}>Refine classification tags for direct filters</p>
                  <div className={styles.subcategoryChips}>
                    {SUB_CATEGORIES_MAP[category]?.map((sub) => {
                      const isActive = subcategory === sub;
                      return (
                        <button
                          key={sub}
                          type="button"
                          className={`${styles.subcategoryChip} ${isActive ? styles.subcategoryChipActive : ''}`}
                          onClick={() => !isGenerating && setSubcategory(sub)}
                          disabled={isGenerating}
                        >
                          {isActive && (
                            <Check size={12} weight="bold" className={styles.chipCheckIcon} />
                          )}
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                  {errors.subcategory && <span className={styles.errorText} role="alert">{errors.subcategory}</span>}
                </div>
              )}

              {/* Description */}
              <div className={styles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label htmlFor="product-description" className={styles.label} style={{ margin: 0 }}>Description</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      onClick={handleGenerateSkeleton}
                      disabled={isGenerating}
                      className={styles.helperBtn}
                    >
                      📝 Outline Draft
                    </button>
                    <button 
                      type="button" 
                      onClick={handleGenerateAIDescription}
                      disabled={isGenerating}
                      className={styles.aiBtn}
                    >
                      {isGenerating ? '⏳ Generating...' : '✨ Generate with AI'}
                    </button>
                  </div>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <textarea 
                    id="product-description"
                    className={styles.textarea} 
                    placeholder="Describe what you'll deliver, features, contents included, and requirements from buyers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isGenerating}
                    aria-describedby="desc-helper"
                  />
                  {isGenerating && (
                    <div className={styles.textareaLoadingOverlay}>
                      <div className={styles.loadingSpinner} />
                      <span className={styles.loadingText}>Gemini AI is crafting a high-conversion description...</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span className={styles.inputHelper} id="desc-helper">{description.length} characters written</span>
                  <span className={styles.inputHelper}>Minimum 20 required</span>
                </div>
                {errors.description && <span className={styles.errorText} role="alert">{errors.description}</span>}

                {/* Quality Checklist */}
                <div className={styles.validationList} aria-label="Description Requirements Checklist">
                  <div className={`${styles.validationItem} ${description.length >= 20 ? styles.validationItemValid : styles.validationItemInvalid}`}>
                    <span className={styles.validationBullet}>{description.length >= 20 ? '✓' : '○'}</span>
                    Contains at least 20 characters
                  </div>
                  <div className={`${styles.validationItem} ${!description.includes('#') ? styles.validationItemValid : styles.validationItemInvalid}`}>
                    <span className={styles.validationBullet}>{!description.includes('#') ? '✓' : '○'}</span>
                    No raw markdown headings (use standard text paragraphs)
                  </div>
                </div>
              </div>

              {/* Skills & Tags */}
              <div className={styles.field}>
                <label htmlFor="product-tags" className={styles.label}>Skills &amp; Tags (up to 5)</label>
                <input 
                  type="text" 
                  id="product-tags"
                  className={styles.input} 
                  placeholder="e.g. Figma, UI Kit, Design System, React…"
                  value={tagInput}
                  onChange={handleTagChange}
                  onKeyDown={handleTagKeyDown}
                  disabled={isGenerating}
                  aria-describedby="tags-helper"
                />
                <span className={styles.inputHelper} id="tags-helper">Press comma (,) or Enter to add a skill tag</span>
                
                {/* Suggested Tags Engine */}
                {category && SUGGESTED_SKILLS_MAP[category] && (
                  <div style={{ marginTop: '8px' }}>
                    <span className={styles.suggestedTitle}>Suggested tags based on category:</span>
                    <div className={styles.suggestedSkillsContainer}>
                      {SUGGESTED_SKILLS_MAP[category]
                        .filter(skill => !tags.includes(skill))
                        .map(skill => (
                          <button
                            key={skill}
                            type="button"
                            className={styles.suggestedTagBtn}
                            onClick={() => addTag(skill)}
                            disabled={isGenerating || tags.length >= 5}
                          >
                            + {skill}
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className={styles.tagContainer}>
                    {tags.map((tag) => (
                      <span key={tag} className={styles.tagPill}>
                        {tag}
                        <button 
                          type="button" 
                          className={styles.tagRemoveBtn}
                          onClick={() => removeTag(tag)}
                          aria-label={`Remove tag ${tag}`}
                          disabled={isGenerating}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.tags && <span className={styles.errorText} role="alert">{errors.tags}</span>}
              </div>
            </div>
          )}

          {/* STEP 2: Pricing */}
          {activeStep === 2 && (
            <div role="group" aria-label="Step 2 Pricing details" className={styles.stepContainer}>
              {/* Price */}
              <div className={styles.field}>
                <label htmlFor="product-price" className={styles.label}>Price (₹)</label>
                <input 
                  type="number" 
                  id="product-price"
                  className={styles.input} 
                  placeholder="e.g. 4500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  aria-describedby="price-helper"
                />
                <span className={styles.inputHelper} id="price-helper">Set your standard product pricing rate in Indian Rupees</span>
                {errors.price && <span className={styles.errorText} role="alert">{errors.price}</span>}
              </div>

              {/* Delivery Days Tactile Selector */}
              <div className={styles.field}>
                <label className={styles.label}>Delivery Duration</label>
                <p className={styles.inputHelper} style={{ marginBottom: '12px' }}>Choose the estimated delivery timeframe for clients after buying your product.</p>
                <div className={styles.durationSelector}>
                  {DELIVERY_DURATION_OPTIONS.map((opt) => {
                    const isActive = parseInt(deliveryDays, 10) === opt.days;
                    return (
                      <button
                        key={opt.days}
                        type="button"
                        className={`${styles.durationBox} ${isActive ? styles.durationBoxActive : ''}`}
                        onClick={() => setDeliveryDays(opt.days)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span className={styles.durationTitle}>{opt.title} ({opt.label})</span>
                          {isActive && (
                            <span className={styles.durationCheckDot}>✓</span>
                          )}
                        </div>
                        <span className={styles.durationDesc}>{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.delivery && <span className={styles.errorText} role="alert">{errors.delivery}</span>}
              </div>
            </div>
          )}

          {/* STEP 3: Gallery Emoji Badge Selection */}
          {activeStep === 3 && (
            <div role="group" aria-label="Step 3 Gallery Emoji selection" className={styles.stepContainer}>
              <span className={styles.label}>Select a Brand Emoji Symbol</span>
              <p className={styles.inputHelper} style={{ marginBottom: '16px' }}>Choose a representative badge icon to display on your product listing card.</p>
              
              <div className={styles.emojiGrid}>
                {EMOMIS_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`${styles.emojiItem} ${selectedEmoji === emoji ? styles.emojiItemActive : ''}`}
                    onClick={() => setSelectedEmoji(emoji)}
                    aria-label={`Select emoji badge ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
 
              {/* Product Images Upload */}
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-border-light)', paddingTop: '20px' }}>
                <span className={styles.label} style={{ display: 'block', marginBottom: '6px' }}>Upload Product Images (Optional)</span>
                <p className={styles.inputHelper} style={{ marginBottom: '16px' }}>
                  Upload screenshots or demo designs. The first image will act as the cover image.
                </p>
                
                <input 
                  type="file" 
                  id="product-images-input" 
                  accept="image/*" 
                  multiple 
                  style={{ display: 'none' }}
                  onChange={handleProductImageUploads}
                />
                
                <button
                  type="button"
                  className={styles.btnSecondarySmall}
                  style={{ backgroundColor: '#F9FAFB', color: 'var(--color-text-dark)', border: '1px solid var(--color-border-dark)', cursor: 'pointer', padding: '10px 16px', borderRadius: 'var(--border-radius-button)', fontWeight: '600' }}
                  onClick={() => document.getElementById('product-images-input').click()}
                  disabled={uploadingImages}
                >
                  {uploadingImages ? 'Uploading...' : '📁 Choose Files'}
                </button>
                
                {productImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                    {productImages.map((imgUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: 'var(--border-radius-input)', overflow: 'hidden', border: '1px solid var(--color-border-light)' }}>
                        <img src={imgUrl} alt={`Product screenshot ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setProductImages(productImages.filter((_, i) => i !== idx))}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          &times;
                        </button>
                        {idx === 0 && (
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#E05A26', color: '#fff', fontSize: '10px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold' }}>
                            Cover
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Summary Review */}
          {activeStep === 4 && (
            <div role="group" aria-label="Step 4 Summary Review details" className={styles.stepContainer}>
              <span className={styles.label} style={{ display: 'block', marginBottom: '16px' }}>Confirm your Product Details</span>
              
              <div className={styles.summaryCard}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Title:</span>
                  <span className={styles.summaryValue}>{title}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Category:</span>
                  <span className={styles.summaryValue}>{category} &gt; {subcategory}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Description:</span>
                  <span className={styles.summaryValue} style={{ whiteSpace: 'pre-wrap' }}>{description}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Price:</span>
                  <span className={styles.summaryValue} style={{ color: 'var(--color-accent-orange)', fontWeight: 800 }}>₹{parseFloat(price).toLocaleString('en-IN')}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Delivery:</span>
                  <span className={styles.summaryValue}>{deliveryDays} {parseInt(deliveryDays, 10) === 1 ? 'day' : 'days'}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Emoji Symbol:</span>
                  <span className={styles.summaryValue} style={{ fontSize: 'var(--font-size-headline)' }}>{selectedEmoji}</span>
                </div>
                {tags.length > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Tags:</span>
                    <span className={styles.summaryValue}>{tags.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Ownership Verification Guarantee Checklist */}
              <div className={styles.verificationBox}>
                <div className={styles.verificationHeader}>
                  <ShieldCheck size={20} weight="duotone" className={styles.verificationShieldIcon} />
                  <span className={styles.verificationTitle}>Distribution & Ownership Certification</span>
                </div>
                <p className={styles.verificationText}>
                  To maintain the security and high trust of the AdFreelancin marketplace catalog, all listings are vetted. You must verify and certify ownership rights of your files.
                </p>
                <label className={styles.verificationLabelContainer}>
                  <input
                    type="checkbox"
                    checked={agreedToOwnership}
                    onChange={(e) => setAgreedToOwnership(e.target.checked)}
                    className={styles.verificationCheckbox}
                    aria-describedby="ownership-error"
                  />
                  <span className={styles.verificationLabelText}>
                    I certify that this digital product contains only code, templates, designs, or files that I have full commercial ownership and redistribution rights to publish and resell.
                  </span>
                </label>
                {errors.ownership && (
                  <span className={styles.errorText} id="ownership-error" role="alert" style={{ display: 'block', marginTop: '8px' }}>
                    {errors.ownership}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bottom stepper action navigations */}
          <div className={styles.buttonsRow}>
            <button 
              type="button" 
              className={styles.backBtn}
              onClick={handleBack}
              disabled={isGenerating}
            >
              &larr; Back
            </button>
            <button 
              type="button" 
              className={`${styles.continueBtn} ${isGenerating ? styles.continueBtnDisabled : ''}`}
              onClick={handleContinue}
              disabled={isGenerating}
              id="stepper-continue-btn"
            >
              {activeStep === 4 ? 'Publish Product' : `Continue: ${activeStep === 1 ? 'Pricing' : activeStep === 2 ? 'Gallery' : 'Publish'} →`}
            </button>
          </div>

        </section>

      </main>

      {/* 3. SUCCESS MODAL REDIRECT DIALOG */}
      {showSuccessModal && (
        <div className={styles.successModalOverlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className={styles.successModal}>
            <div className={styles.successIcon} aria-hidden="true">✓</div>
            <h2 className={styles.successTitle} id="modal-title">Product Published Successfully!</h2>
            <p className={styles.successText}>
              Congratulations! Your new product has been published and is now live for thousands of verified business clients.
            </p>
            <button 
              type="button" 
              className={styles.successBtn}
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/products');
              }}
            >
              View Products Catalog
            </button>
          </div>
        </div>
      )}

      {/* 4. FOOTER */}
      <footer className={styles.footerMini}>
        <div className={styles.footerMiniLogo}>
          <span style={{ color: '#FFFFFF' }}>Free</span>
          <span style={{ color: 'var(--color-accent-orange)' }}>Lance</span>
          <span style={{ color: '#FFFFFF' }}>Hub</span>
        </div>
        
        <nav className={styles.footerMiniLinks} aria-label="Footer Navigation Links">
          <a href="#about" className={styles.footerMiniLink}>About</a>
          <a href="#privacy" className={styles.footerMiniLink}>Privacy</a>
          <a href="#terms" className={styles.footerMiniLink}>Terms</a>
        </nav>
        
        <p className={styles.footerCopyright}>&copy; 2026 AdFreelancin. All rights reserved.</p>
      </footer>

    </div>
  );
}
