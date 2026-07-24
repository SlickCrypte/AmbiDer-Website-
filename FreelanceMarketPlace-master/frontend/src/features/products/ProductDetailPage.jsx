import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../../data/productsData';
import styles from './ProductDetailPage.module.css';
import Header from '../../components/Header';
import { Package, Palette, Presentation, Table, FileCode, BookOpen, Coins, ClipboardText } from '@phosphor-icons/react';

function getProductCategoryIcon(category, size = 24, weight = "duotone") {
  switch (category) {
    case 'UI Kits':
    case 'Icons':
      return <Palette size={size} weight={weight} />;
    case 'Templates':
      return <Presentation size={size} weight={weight} />;
    case 'Spreadsheets':
    case 'Accounting & Finance':
      return <Table size={size} weight={weight} />;
    case 'Code Snippets':
      return <FileCode size={size} weight={weight} />;
    case 'Ebooks':
      return <BookOpen size={size} weight={weight} />;
    case 'Sales & Marketing':
      return <Coins size={size} weight={weight} />;
    case 'Human Resources':
    case 'Legal & Compliance':
    case 'Operations & Management':
      return <ClipboardText size={size} weight={weight} />;
    default:
      return <Package size={size} weight={weight} />;
  }
}

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && isLocal)
  ? import.meta.env.VITE_API_BASE_URL
  : 'https://freelancemarketplace-backend.onrender.com';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load user session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(`${API_BASE_URL}/listings/${id}`);
        if (response.ok) {
          const data = await response.json();
          let sellerInfo = {
            id: data.seller_id || 't2',
            name: 'Creator',
            role: 'Professional Creator',
            avatarBg: '#E05A26',
            initials: 'CR',
            rating: 5.0,
            reviewsCount: 18,
            isVerified: true
          };
          if (data.seller_id) {
            try {
              const sellerRes = await fetch(`${API_BASE_URL}/users/${data.seller_id}`);
              if (sellerRes.ok) {
                const seller = await sellerRes.json();
                sellerInfo = {
                  id: seller.id,
                  name: seller.full_name || seller.name || 'Professional Creator',
                  role: seller.role || 'Specialist',
                  avatarBg: seller.avatar_bg || '#E05A26',
                  initials: seller.initials || (seller.full_name || seller.name || 'CR').split(' ').map(n => n[0]).join('').toUpperCase(),
                  avatarUrl: seller.avatar_url || null,
                  rating: seller.rating || 5.0,
                  reviewsCount: seller.reviews_count || 0,
                  isVerified: (seller.is_verified && !!seller.linkedin_id) || false
                };
              }
            } catch (err) {
              console.warn("Failed to fetch product seller info:", err);
            }
          }
          setProduct({
            id: data.id,
            emoji: data.emoji || '💻',
            name: data.title || data.name || 'Digital Product',
            description: data.description || '',
            price: data.price || 0,
            sales: data.sales || 0,
            category: data.category || 'All',
            breadcrumbCategory: data.breadcrumb_category || 'Products',
            creator: sellerInfo,
            about: data.about || data.description || '',
            whatsIncluded: data.whats_included || [],
            deliveryDays: data.delivery_days || 1,
            addons: data.addons || [],
            reviews: (data.reviews || []).map((rev, index) => ({
              id: rev.id || String(index),
              reviewerName: rev.reviewer_name || 'Hiring Client',
              reviewerInitials: (rev.reviewer_name || 'Hiring Client').split(' ').map(n => n[0]).join('').toUpperCase(),
              avatarBg: '#E05A26',
              rating: rev.rating || 5,
              date: rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently',
              text: rev.comment || rev.review_text || ''
            })),
            versionHistory: data.version_history || [],
            images: data.images || []
          });
        } else {
          const mock = getProducts().find(p => p.id === id);
          setProduct(mock);
        }
      } catch (err) {
        const mock = getProducts().find(p => p.id === id);
        setProduct(mock);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('Products');

  // LinkedIn Connection simulation state
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(() => localStorage.getItem('adfreelancin_linkedin_connected') !== 'false');

  // State to track checkable add-ons (FR-18: updates total price)
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Check if loading
  if (loading) {
    return (
      <div className={styles.pageWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: 'var(--font-size-title)', color: '#1B2A41', fontWeight: '600' }}>Loading product details...</div>
      </div>
    );
  }

  // Check if product profile exists
  if (!product) {
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
          <h2 style={{ color: '#1B2A41', marginBottom: '16px' }}>Digital Product Not Found</h2>
          <p style={{ color: '#8A93A2', marginBottom: '24px' }}>
            The product you are looking for does not exist or has been removed from our catalog.
          </p>
          <button 
            className={styles.orderBtn} 
            onClick={() => navigate('/products')}
          >
            &larr; Return to Products
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

  // Toggle add-on inclusion state (FR-18)
  const handleToggleAddon = (addonId) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  // Compute total price dynamically based on checked add-ons (FR-18)
  const basePrice = product.price;
  const addonsTotal = product.addons
    ? product.addons
        .filter(addon => selectedAddons.includes(addon.id))
        .reduce((sum, addon) => sum + addon.price, 0)
    : 0;
  const totalPrice = basePrice + addonsTotal;

  const handleOrderClick = async () => {
    if (!currentUser) {
      alert("Please log in to purchase digital products.");
      navigate('/login');
      return;
    }

    const sellerId = product.creator.id;
    if (currentUser.id === sellerId) {
      alert("You cannot purchase your own product.");
      return;
    }
 
    const activeAddonsNames = product.addons
      ? product.addons
          .filter(addon => selectedAddons.includes(addon.id))
          .map(addon => addon.name)
      : [];
 
    const confirmPurchase = window.confirm(`Confirm purchase request of ${product.name} for ₹${totalPrice.toLocaleString('en-IN')}?`);
    if (!confirmPurchase) return;
 
    const orderPayload = {
      id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }),
      buyer_id: currentUser.id,
      seller_id: sellerId,
      listing_id: product.id,
      gig_title: product.name,
      total_price: totalPrice,
      status: 'applied',
      due_date: JSON.stringify({ 
        duration: `Delivered in ${product.deliveryDays || 3} days`, 
        proposal: `Product purchase request for: "${product.name}"${activeAddonsNames.length > 0 ? ` with addons: ${activeAddonsNames.join(', ')}` : ''}`, 
        skills: [], 
        is_direct_hire: true,
        is_product: true
      }),
      addons_selected: activeAddonsNames,
      is_rated: false
    };
 
    try {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (response.ok) {
        // Send automated buyer -> seller request message
        const messagePayload = {
          sender_id: currentUser.id,
          receiver_id: sellerId,
          message: `[Automated Message] Hi! I would like to purchase your product: "${product.name}" for ₹${totalPrice.toLocaleString('en-IN')}. Please accept my order request!`,
          is_read: false
        };
        
        await fetch(`${API_BASE_URL}/messages/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messagePayload)
        });

        alert(`Successfully created order request for "${product.name}"!\n\nAn automated message has been sent to the seller. You can track your purchase on the dashboard.`);
        navigate('/dashboard');
      } else {
        alert("Failed to initialize purchase order.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to reach server.");
    }
  };

  const handleMessageClick = () => {
    if (!currentUser) {
      alert("Please log in to message creators.");
      navigate('/login');
      return;
    }
    navigate(`/dashboard?tab=Messages&partnerId=${product.creator.id}`);
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
    navigate('/signup');
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. HEADER NAVIGATION BAR */}
      <Header activeTab="Products" isLinkedInConnected={isLinkedInConnected} setIsLinkedInConnected={setIsLinkedInConnected} />

      {/* 2. MAIN CONTAINER */}
      <main className={styles.detailContainer}>
        
        {/* Breadcrumb row (Figma 15) */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumbRow}>
          <span className={styles.breadcrumbItem} onClick={() => navigate('/')}>Home</span>
          <span className={styles.breadcrumbDivider}>&gt;</span>
          <span className={styles.breadcrumbItem} onClick={() => navigate('/products')}>{product.breadcrumbCategory}</span>
          <span className={styles.breadcrumbDivider}>&gt;</span>
          <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>{product.name}</span>
        </nav>

        {/* Two Column Grid */}
        <div className={styles.contentGrid}>
          
          {/* LEFT COLUMN: Summary, Emoji Banner, Description, Checklist */}
          <div className={styles.leftCol}>
            
            {/* Title & Creator Summary card */}
            <div>
              <h1 className={styles.productTitle}>{product.name}</h1>
              
              <div className={styles.creatorRow}>
                 <div 
                   className={styles.avatarMd}
                   style={{ backgroundColor: product.creator.avatarBg, overflow: 'hidden' }}
                   aria-hidden="true"
                 >
                   {product.creator.avatarUrl ? (
                     <img 
                       src={product.creator.avatarUrl} 
                       alt={product.creator.name} 
                       style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                     />
                   ) : (
                     product.creator.initials
                   )}
                 </div>
                
                <div className={styles.creatorInfo}>
                  <h3 className={styles.creatorName}>{product.creator.name}</h3>
                  <p className={styles.creatorRole}>{product.creator.role}</p>
                </div>
                
                {product.creator.isVerified && (
                  <span className={styles.verifiedBadge}>Verified</span>
                )}
                
                <div className={styles.starsRow}>
                  <div className={styles.stars} aria-label={`Rating: ${product.creator.rating.toFixed(1)} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span 
                        key={idx} 
                        className={styles.starIcon} 
                        style={{ opacity: idx < Math.round(product.creator.rating) ? 1 : 0.2 }}
                        aria-hidden="true"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span>{product.creator.rating.toFixed(1)} ({product.creator.reviewsCount})</span>
                </div>
              </div>
            </div>

            {/* Giant category Emoji Box OR Product Image Carousel */}
            {product.images && product.images.length > 0 ? (
              <ProductImageCarousel images={product.images} />
            ) : (
              <div className={styles.bannerCard} aria-hidden="true">
                <div className={styles.fallbackContainer}>
                  <div className={styles.fallbackPattern} />
                  <div className={styles.fallbackBadge}>
                    {getProductCategoryIcon(product.category, 48, "duotone")}
                  </div>
                  <div className={styles.fallbackBrandText}>ADFREELANCIN DIGITAL PRODUCTS</div>
                </div>
              </div>
            )}

            {/* About this gig */}
            <article className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>About this gig</h2>
              <p className={styles.aboutText}>{product.about ? product.about.replace(/^[ \t]*#+[ \t]*/gm, '') : ''}</p>
            </article>

            {/* What's included check tags list */}
            <article className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>What's included</h2>
              <div className={styles.checklist}>
                {product.whatsIncluded.map((includeItem, idx) => (
                  <div key={idx} className={styles.checklistItem}>
                    <span className={styles.checkIcon} aria-hidden="true">✓</span>
                    <span>{includeItem}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Version History Section */}
            <article className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>Version History</h2>
              {product.versionHistory && product.versionHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {product.versionHistory.map((ver, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      borderRadius: 'var(--border-radius-input)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '700', color: '#fff', fontSize: 'var(--font-size-body)' }}>v{ver.version_number}</span>
                        <span style={{ fontSize: 'var(--font-size-label)', color: '#8A93A2' }}>
                          {ver.updated_at ? new Date(ver.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                        </span>
                      </div>
                      <p style={{ color: '#8A93A2', fontSize: 'var(--font-size-label)', margin: 0, lineHeight: '1.4' }}>{ver.change_note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)', fontStyle: 'italic', margin: 0 }}>
                  v1.0 (Original Release) - No updates published yet.
                </p>
              )}
            </article>
 
            {/* Reviews Section */}
            <section className={styles.sectionCard} aria-labelledby="reviews-heading">
              <h2 className={styles.sectionTitle} id="reviews-heading">Reviews</h2>
              
              {product.reviews && product.reviews.length > 0 ? (
                <div className={styles.reviewList}>
                  {product.reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div 
                          className={styles.avatarMd}
                          style={{ backgroundColor: review.avatarBg, width: '38px', height: '38px', fontSize: 'var(--font-size-body)' }}
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
                  No reviews have been written for this product yet.
                </p>
              )}
            </section>

          </div>

          {/* RIGHT COLUMN: Price Card & Addons */}
          <div className={styles.rightCol}>
            
            {/* Checkout Pricing Card Widget */}
            <aside className={styles.checkoutCard} aria-labelledby="checkout-card-heading">
              <h2 className={styles.sectionTitle} id="checkout-card-heading" style={{ display: 'none' }}>Checkout Widget</h2>
              
              <div className={styles.priceBlock}>
                <div className={styles.priceRow}>
                  {/* Dynamic price changes in real-time when add-ons are check toggled (FR-18) */}
                  <span className={styles.price}>₹{totalPrice.toLocaleString('en-IN')}</span>
                  <span className={styles.priceLabel}>Per project</span>
                </div>
                <div className={styles.deliveryDays}>
                  Delivered in {product.deliveryDays} days
                </div>
              </div>

              <div className={styles.checkoutBtns}>
                <button 
                  className={styles.orderBtn}
                  onClick={handleOrderClick}
                  id="checkout-order-btn"
                >
                  Order Now
                </button>
                <button 
                  className={styles.messageCreatorBtn}
                  onClick={handleMessageClick}
                  id="checkout-message-btn"
                >
                  Message {product.creator.name.split(' ')[0]}
                </button>
              </div>

              {/* Add-ons Checklist Section */}
              {product.addons && product.addons.length > 0 && (
                <div className={styles.addonsSection}>
                  <h3 className={styles.addonsTitle}>Add-ons</h3>
                  
                  {product.addons.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <div 
                        key={addon.id} 
                        className={`${styles.addonCard} ${isChecked ? styles.addonCardActive : ''}`}
                        onClick={() => handleToggleAddon(addon.id)}
                      >
                        <div className={styles.addonInfo}>
                          <span className={styles.addonName}>{addon.name}</span>
                          <span className={styles.addonPrice}>+₹{addon.price.toLocaleString('en-IN')}</span>
                        </div>
                        
                        <div 
                          className={styles.addonCheckRow} 
                          role="checkbox" 
                          aria-checked={isChecked}
                        >
                          <div className={`${styles.customCheckbox} ${isChecked ? styles.customCheckboxActive : ''}`}>
                            {isChecked && '✓'}
                          </div>
                          <span className={styles.addonLabelText}>Add</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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

    </div>
  );
}
 
function ProductImageCarousel({ images }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = () => {
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '350px',
      borderRadius: 'var(--border-radius-card)',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: '#111C2A',
      marginBottom: '28px'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={images[activeIdx]} 
          alt={`Product slide ${activeIdx + 1}`} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      </div>

      {images.length > 1 && (
        <>
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            style={{
              position: 'absolute',
              top: '50%',
              left: '16px',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: 'var(--font-size-title)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'background-color 0.2s',
              zIndex: 10
            }}
          >
            ‹
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            style={{
              position: 'absolute',
              top: '50%',
              right: '16px',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: 'var(--font-size-title)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'background-color 0.2s',
              zIndex: 10
            }}
          >
            ›
          </button>

          {/* Dots Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}>
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                style={{
                  border: 'none',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px',
                  backgroundColor: idx === activeIdx ? '#E05A26' : 'rgba(255, 255, 255, 0.4)',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
