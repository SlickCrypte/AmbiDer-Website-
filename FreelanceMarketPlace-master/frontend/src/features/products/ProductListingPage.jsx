import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, PRODUCT_CATEGORIES } from '../../data/productsData';
import styles from './ProductListingPage.module.css';
import Header from '../../components/Header';
import { Package, ArrowCounterClockwise, Plus, Compass, Coins, PlusCircle, X, MagnifyingGlass, Palette, Presentation, Table, FileCode, BookOpen, ClipboardText } from '@phosphor-icons/react';

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

function sanitizeDescriptionSnippet(desc) {
  if (!desc) return '';
  // Strip markdown headings (e.g. #, ##, ###)
  let cleaned = desc.replace(/#+\s+/g, '');
  // Strip bold/italic markdown symbols
  cleaned = cleaned.replace(/\*\*|__/g, '');
  // Strip list item markers at the beginning of lines
  cleaned = cleaned.replace(/^\s*[\*\-]\s+/gm, '');
  // Normalize whitespace and collapse newlines into single spaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  // Truncate cleanly for catalog view
  if (cleaned.length > 110) {
    cleaned = cleaned.substring(0, 107).trim() + '...';
  }
  return cleaned.trim();
}

export default function ProductListingPage() {
  const navigate = useNavigate();

  // Load user session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('adfreelancin_products_onboarded') !== 'true';
  });

  const handleDismissOnboarding = () => {
    localStorage.setItem('adfreelancin_products_onboarded', 'true');
    setShowOnboarding(false);
  };


  // Load products list from localStorage reactive cache
  const [productsList, setProductsList] = useState(() => getProducts());

  // Loading state for fetching products list
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/listings/`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Filter only service listings (exclude jobs and direct service contracts)
            const servicesOnly = data.filter(item =>
              item.listing_type === 'service' &&
              !item.title?.startsWith('Direct Service Contract')
            );
            const formatted = servicesOnly.map(item => ({
              id: item.id,
              sellerId: item.seller_id,
              emoji: item.emoji || '💻',
              name: item.title || item.name || 'Digital Product',
              description: item.description || '',
              price: item.price || 0,
              sales: item.sales || 0,
              category: item.category || 'All',
              breadcrumbCategory: item.breadcrumb_category || '',
              images: item.images || []
            }));
            setProductsList(prev => {
              const existingIds = new Set(formatted.map(f => f.id));
              const localGigsFiltered = prev.filter(p => !existingIds.has(p.id));
              const merged = [...formatted, ...localGigsFiltered];
              const seen = new Set();
              const unique = merged.filter(prod => {
                const nameKey = prod.name?.trim().toLowerCase();
                if (!nameKey) return true;
                if (seen.has(nameKey)) return false;
                seen.add(nameKey);
                return true;
              });
              try {
                localStorage.setItem('adfreelancin_products', JSON.stringify(unique));
              } catch (e) {
                console.error("Failed to sync products cache:", e);
              }
              return unique;
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch listings from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('Products');

  // LinkedIn Connection simulation state
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(() => localStorage.getItem('adfreelancin_linkedin_connected') !== 'false');

  // Selected horizontal category
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Search & Sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

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
        sessionStorage.setItem('linkedin_return_to', '/products');
        const redirectUri = window.location.origin + '/linkedin-callback';
        window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;
      } else {
        setIsLinkedInConnected(true);
        localStorage.setItem('adfreelancin_linkedin_connected', 'true');
      }
    }
  };

  // Navigations
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

  // Buy Now checkout request flow
  const handleBuyClick = async (product) => {
    if (!currentUser) {
      alert("Please log in to purchase digital products.");
      navigate('/login');
      return;
    }

    const sellerId = product.sellerId;
    if (!sellerId) {
      alert("Seller details not found for this product.");
      return;
    }

    if (currentUser.id === sellerId) {
      alert("You cannot purchase your own product.");
      return;
    }

    const confirmPurchase = window.confirm(`Confirm purchase request of "${product.name}" for ₹${product.price.toLocaleString('en-IN')}?`);
    if (!confirmPurchase) return;

    const orderPayload = {
      id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }),
      buyer_id: currentUser.id,
      seller_id: sellerId,
      listing_id: product.id,
      gig_title: product.name,
      total_price: product.price,
      status: 'applied',
      due_date: JSON.stringify({
        duration: 'Instant Delivery',
        proposal: `Product purchase request for: "${product.name}"`,
        skills: [],
        is_direct_hire: true,
        is_product: true
      }),
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
          message: `[Automated Message] Hi! I would like to purchase your product: "${product.name}" for ₹${product.price.toLocaleString('en-IN')}. Please accept my order request!`,
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

  // Real-time products filtering with title-based deduplication
  const seenNames = new Set();
  const uniqueProductsList = productsList.filter(prod => {
    const nameKey = prod.name?.trim().toLowerCase();
    if (!nameKey) return true;
    if (seenNames.has(nameKey)) return false;
    seenNames.add(nameKey);
    return true;
  });

  const filteredProducts = uniqueProductsList.filter(prod => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      (prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (prod.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return b.sales - a.sales; // popular
  });

  return (
    <div className={styles.pageWrapper}>

      {/* 1. HEADER NAVIGATION BAR */}
      <Header activeTab="Products" isLinkedInConnected={isLinkedInConnected} setIsLinkedInConnected={setIsLinkedInConnected} />

      {/* 2. PAGE HEADER TITLE SECTION */}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Digital Products</h1>
        <p className={styles.subtitle}>Ready-made templates, kits, and tools: buy once, use forever.</p>
      </div>

      {/* 3. PRODUCT CATALOG SECTION */}
      <main className={styles.contentSection}>

        {/* Onboarding welcome banner */}
        {showOnboarding && (
          <section className={styles.onboardingBanner} aria-label="Digital Products Welcome Guide">
            <button 
              type="button" 
              className={styles.onboardCloseBtn} 
              onClick={handleDismissOnboarding}
              aria-label="Close welcome guide"
            >
              <X size={18} weight="bold" />
            </button>
            
            <div className={styles.onboardIntro}>
              <h2 className={styles.onboardTitle}>Unlock Pre-Built Assets</h2>
              <p className={styles.onboardSubtitle}>
                Instantly procure templates, code snippets, and custom tools curated by verified expert consultants to accelerate your workflow.
              </p>
              <div className={styles.onboardActions}>
                <button 
                  type="button" 
                  className={styles.onboardExploreBtn} 
                  onClick={handleDismissOnboarding}
                >
                  Explore Catalog
                </button>
                <button 
                  type="button" 
                  className={styles.onboardListBtn} 
                  onClick={() => navigate('/post-product')}
                >
                  List a Product
                </button>
              </div>
            </div>

            <div className={styles.onboardSteps}>
              <div className={styles.onboardStepCard}>
                <div className={styles.onboardStepIconContainer}>
                  <Compass size={22} weight="duotone" />
                </div>
                <h3 className={styles.onboardStepTitle}>1. Browse & Filter</h3>
                <p className={styles.onboardStepDesc}>Explore developer-focused categories from UI Kits to accounting spreadsheets.</p>
              </div>

              <div className={styles.onboardStepCard}>
                <div className={styles.onboardStepIconContainer}>
                  <Coins size={22} weight="duotone" />
                </div>
                <h3 className={styles.onboardStepTitle}>2. Instant Order</h3>
                <p className={styles.onboardStepDesc}>Tap buy now to request terms. The system sets up a secure workspace message.</p>
              </div>

              <div className={styles.onboardStepCard}>
                <div className={styles.onboardStepIconContainer}>
                  <PlusCircle size={22} weight="duotone" />
                </div>
                <h3 className={styles.onboardStepTitle}>3. Start Earning</h3>
                <p className={styles.onboardStepDesc}>Have ready-made kits? Easily list products to monetise your daily engineering work.</p>
              </div>
            </div>
          </section>
        )}

        <div className={styles.catalogLayout}>
          {/* Left Sidebar Filter Section */}
          <aside className={styles.sidebar}>
            {/* Search filter block */}
            <div className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>Search</h2>
              <div className={styles.searchWrapper}>
                <MagnifyingGlass className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search digital products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={14} weight="bold" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories filter block */}
            <div className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>Categories</h2>
              <div className={styles.sidebarCategories} role="tablist" aria-label="Product Categories">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.sidebarCategoryBtn} ${selectedCategory === cat ? styles.sidebarCategoryBtnActive : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                    role="tab"
                    aria-selected={selectedCategory === cat}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting filter block */}
            <div className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>Sort By</h2>
              <div className={styles.selectWrapper}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                  aria-label="Sort digital products"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Catalog Main Content Area (Right column) */}
          <div className={styles.catalogMain}>
            {loading ? (
              <div className={styles.productsGrid}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className={`${styles.productCard} ${styles.skeletonCard} ${styles.skeletonPulse}`}>
                    <div className={`${styles.cardPreview} ${styles.skeletonItem}`} style={{ border: 'none' }} />
                    <div className={styles.cardContent}>
                      <div className={`${styles.skeletonItem} ${styles.skeletonTitle}`} />
                      <div className={`${styles.skeletonItem} ${styles.skeletonText}`} style={{ width: '100%' }} />
                      <div className={`${styles.skeletonItem} ${styles.skeletonText}`} style={{ width: '85%' }} />

                      <div className={styles.footerRow} style={{ borderTop: 'none', paddingTop: 0 }}>
                        <div className={`${styles.skeletonItem} ${styles.skeletonPrice}`} />
                        <div className={`${styles.skeletonItem} ${styles.skeletonSales}`} />
                      </div>

                      <div className={`${styles.skeletonItem} ${styles.skeletonBtn}`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className={styles.productsGrid}>
                {sortedProducts.map((prod) => (
                  <article
                    key={prod.id}
                    className={styles.productCard}
                    onClick={() => navigate('/product/' + prod.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className={styles.cardPreview}
                      aria-hidden="true"
                    >
                      {prod.images && prod.images.length > 0 ? (
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.fallbackContainer}>
                          <div className={styles.fallbackPattern} />
                          <div className={styles.fallbackBadge}>
                            {getProductCategoryIcon(prod.category, 28, "duotone")}
                          </div>
                          <div className={styles.fallbackBrandText}>ADFREELANCIN</div>
                        </div>
                      )}
                    </div>
                    <div className={styles.cardContent}>
                      <h2 className={styles.productName}>{prod.name}</h2>
                      <p className={styles.productDescription}>{sanitizeDescriptionSnippet(prod.description)}</p>
     
                      <div className={styles.footerRow}>
                        <span className={styles.price}>₹{prod.price.toLocaleString('en-IN')}</span>
                        <span className={styles.salesCount}>{prod.sales} sales</span>
                      </div>
     
                      <button
                        className={styles.buyBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyClick(prod);
                        }}
                        aria-label={`Buy ${prod.name} for ₹${prod.price}`}
                      >
                        Buy Now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIconContainer}>
                  <Package size={48} weight="duotone" className={styles.emptyStateIcon} />
                </div>
                <h3 className={styles.emptyStateTitle}>No products found</h3>
                <p className={styles.emptyStateText}>
                  {searchQuery ? (
                    <>We couldn't find any products matching <strong>"{searchQuery}"</strong> under the <strong>{selectedCategory}</strong> category.</>
                  ) : (
                    <>We don't have digital products listed under the <strong>{selectedCategory}</strong> category right now. Check back soon or list one yourself!</>
                  )}
                </p>
                <div className={styles.emptyStateActions}>
                  <button
                    className={styles.emptyStateResetBtn}
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    aria-label="Reset filters"
                  >
                    <ArrowCounterClockwise size={18} weight="bold" />
                    Reset Filters
                  </button>
                  <button
                    className={styles.emptyStatePostBtn}
                    onClick={() => navigate('/post-product')}
                    aria-label="Publish a new product"
                  >
                    <Plus size={18} weight="bold" />
                    List a Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
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
