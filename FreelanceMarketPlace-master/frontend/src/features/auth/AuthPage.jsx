import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AuthPage.module.css';
import Header from '../../components/Header';

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

function getRoleForAccountType(accountType) {
  if (accountType === 'client') return 'Client';
  if (accountType === 'seller_only') return 'seller';
  return 'Freelancer';
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active form mode: 'login' or 'signup'
  const [authMode, setAuthMode] = useState('login');

  // Form input field state variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState('freelancer_seller'); // 'client', 'seller_only', or 'freelancer_seller'
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Field validation error triggers
  const [errors, setErrors] = useState({});

  // Sync initial tab based on route path (/signup vs /login)
  useEffect(() => {
    if (location.pathname === '/signup') {
      setAuthMode('signup');
    } else {
      setAuthMode('login');
    }
    // Reset form states on tab transition
    setEmail('');
    setPassword('');
    setFullName('');
    setAgreeToTerms(false);
    setErrors({});
  }, [location.pathname]);

  const handleTabToggle = (mode) => {
    setAuthMode(mode);
    setErrors({});
  };

  const validateForm = () => {
    const formErrors = {};

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      formErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email)) {
      formErrors.email = 'Please enter a valid email address.';
    }

    // Password strength check
    if (!password) {
      formErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      formErrors.password = 'Password must be at least 6 characters.';
    }

    // Signup-only fields
    if (authMode === 'signup') {
      if (!fullName.trim()) {
        formErrors.fullName = 'Full name is required.';
      } else if (fullName.trim().length < 2) {
        formErrors.fullName = 'Full name must be at least 2 characters.';
      }

      if (!agreeToTerms) {
        formErrors.terms = 'You must agree to the Terms of Service.';
      }
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(`Authentication success: Mode=${authMode}, AccountType=${accountType}, User=${email}`);
      
      const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : email.slice(0, 2).toUpperCase();
      const userPayload = {
        id: generateUUID(),
        full_name: fullName || email.split('@')[0],
        email: email,
        password: password,
        role: getRoleForAccountType(accountType),
        account_type: accountType,
        hourly_rate: 2000,
        skills: [],
        is_verified: false,
        initials: initials,
        avatar_bg: '#1B2A41',
        is_profile_setup: false
      };

      if (authMode === 'signup') {
        const postPayload = { ...userPayload };
        delete postPayload.is_profile_setup;
        
        try {
          const response = await fetch(`${API_BASE_URL}/users/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(postPayload)
          });
          if (response.ok) {
            console.log("Registered profile to Supabase database!");
          } else {
            let errorMsg = "Registration failed. Email might already exist.";
            try {
              const errData = await response.json();
              if (errData && errData.detail) {
                errorMsg = errData.detail;
              }
            } catch (pErr) {
              // Ignore parser errors and use default message
            }
            alert(errorMsg);
            return;
          }
        } catch (err) {
          console.warn("Failed to register profile to backend:", err);
          alert("Network error: Registration failed.");
          return;
        }

        // Clean password from session storage
        delete userPayload.password;
        localStorage.setItem('currentUser', JSON.stringify(userPayload));
        alert(`Account Created Successfully!\n\nWelcome: ${userPayload.full_name}\n\nPlease complete your account setup next.`);
        navigate('/profile-setup');
      } else {
        // Log in: verify password and credentials securely on the backend
        let loggedInUser = null;
        try {
          const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              password: password
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            const profile = result.profile;
            // Check if profile details are fully setup (requires both bio and location to be filled)
            const isSetup = !!(profile.bio && profile.location);
            
            loggedInUser = {
              id: profile.id,
              full_name: profile.full_name || profile.name,
              email: profile.email,
              role: profile.role,
              account_type: profile.account_type || 'freelancer_seller',
              hourly_rate: profile.hourly_rate || 2000,
              skills: profile.skills || [],
              is_verified: profile.is_verified || false,
              initials: profile.initials || (profile.full_name || profile.name || 'US').split(' ').map(n => n[0]).join('').toUpperCase(),
              avatar_bg: profile.avatar_bg || '#1B2A41',
              bio: profile.bio || '',
              location: profile.location || '',
              is_profile_setup: isSetup
            };
          } else {
            const errData = await response.json();
            alert(errData.detail || "Invalid email or password.");
            return;
          }
        } catch (err) {
          console.warn("Error logging in:", err);
          alert("Network error: Failed to connect to authentication server.");
          return;
        }

        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
        alert(`Welcome Back!\n\nUser: ${loggedInUser.full_name}\n\nRedirecting to portal...`);
        if (loggedInUser.is_profile_setup) {
          navigate('/dashboard');
        } else {
          navigate('/profile-setup');
        }
      }
    }
  };

  // LinkedIn OAuth - Redirect to real LinkedIn authorization
  const handleLinkedInOAuth = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = window.location.origin + '/linkedin-callback';

    if (!clientId || clientId === 'your_linkedin_client_id_here') {
      alert('LinkedIn OAuth is not configured. Please set VITE_LINKEDIN_CLIENT_ID in your .env file.');
      return;
    }

    // Generate CSRF state token and store in sessionStorage
    const state = generateUUID();
    sessionStorage.setItem('linkedin_oauth_state', state);
    sessionStorage.setItem('linkedin_auth_context', 'auth'); // full auth flow (not just verification)

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;
    window.location.href = authUrl;
  };

  // GitHub OAuth - Redirect to real GitHub authorization
  const handleGitHubOAuth = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = window.location.origin + '/github-callback';

    if (!clientId || clientId === 'your_github_client_id_here') {
      alert('GitHub OAuth is not configured. Please set VITE_GITHUB_CLIENT_ID in your .env file.');
      return;
    }

    // Generate CSRF state token and store in sessionStorage
    const state = generateUUID();
    sessionStorage.setItem('github_oauth_state', state);

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}&prompt=select_account`;
    window.location.href = authUrl;
  };

  // Google OAuth - Redirect to real Google authorization
  const handleGoogleOAuth = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin + '/google-callback';

    if (!clientId || clientId === 'your_google_client_id_here') {
      alert('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    // Generate CSRF state token and store in sessionStorage
    const state = generateUUID();
    sessionStorage.setItem('google_oauth_state', state);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&state=${state}&prompt=select_account`;
    window.location.href = authUrl;
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. BRAND HEADER NAVBAR */}
      <Header />

      {/* 2. CENTERED AUTH SPLIT CARD */}
      <main className={styles.contentContainer}>
        <section className={styles.authCard}>
          
          {/* Left Column: Branding banner */}
          <div className={styles.promoCol}>
            <span className={styles.logoAccent} aria-hidden="true">AdFreelancin</span>
            <h2 className={styles.promoTitle}>Discover verified talent &amp; services</h2>
            <p className={styles.promoText}>
              Join the network of verified elite independent contractors and digital creators. Scale your engineering, design, and analysis capacities with complete escrow protection.
            </p>
          </div>

          {/* Right Column: Interactive Form */}
          <div className={styles.formCol}>
            
            {/* Log In / Sign Up tab header */}
            <div className={styles.tabRow} role="tablist" aria-label="Auth Forms Mode Switcher">
              <button 
                type="button"
                className={`${styles.tabBtn} ${authMode === 'login' ? styles.tabBtnActive : ''}`}
                onClick={() => handleTabToggle('login')}
                role="tab"
                aria-selected={authMode === 'login'}
              >
                Log In
              </button>
              <button 
                type="button"
                className={`${styles.tabBtn} ${authMode === 'signup' ? styles.tabBtnActive : ''}`}
                onClick={() => handleTabToggle('signup')}
                role="tab"
                aria-selected={authMode === 'signup'}
              >
                Sign Up
              </button>
            </div>

            {/* OAuth Connection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <button 
                type="button" 
                className={styles.oauthBtn}
                onClick={handleLinkedInOAuth}
                id="auth-linkedin-oauth-btn"
              >
                <svg className={styles.oauthIcon} viewBox="0 0 24 24" width="18" height="18">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span>{authMode === 'login' ? 'Continue with LinkedIn' : 'Sign up with LinkedIn'}</span>
              </button>

              <button 
                type="button" 
                className={styles.githubOauthBtn}
                onClick={handleGitHubOAuth}
                id="auth-github-oauth-btn"
                style={{ marginTop: '0px' }}
              >
                <svg className={styles.oauthIcon} viewBox="0 0 24 24" width="18" height="18" fill="white">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>{authMode === 'login' ? 'Continue with GitHub' : 'Sign up with GitHub'}</span>
              </button>

              <button 
                type="button" 
                className={styles.googleOauthBtn}
                onClick={handleGoogleOAuth}
                id="auth-google-oauth-btn"
                style={{ marginTop: '0px' }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '4px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.24-.71-.38-1.47-.38-2.26s.14-1.55.38-2.26L1.5 3c-.96 1.9-1.5 4.05-1.5 6.31s.54 4.41 1.5 6.31l3.96-3.05z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{authMode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
              </button>
            </div>

            {/* Separator line */}
            <div className={styles.separator} aria-hidden="true">
              <span className={styles.separatorText}>or use email address</span>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className={styles.form}>
              
              {/* Sign up name field */}
              {authMode === 'signup' && (
                <div className={styles.field}>
                  <label htmlFor="auth-fullname" className={styles.label}>Full Name</label>
                  <input 
                    type="text" 
                    id="auth-fullname"
                    placeholder="e.g. Priya Sharma" 
                    className={styles.input}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {errors.fullName && <span className={styles.errorText} role="alert">{errors.fullName}</span>}
                </div>
              )}

              {/* Email address input */}
              <div className={styles.field}>
                <label htmlFor="auth-email" className={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  id="auth-email"
                  placeholder="e.g. name@company.com" 
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <span className={styles.errorText} role="alert">{errors.email}</span>}
              </div>

              {/* Password input */}
              <div className={styles.field}>
                <label htmlFor="auth-password" className={styles.label}>Password</label>
                <input 
                  type="password" 
                  id="auth-password"
                  placeholder="Minimum 6 characters" 
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <span className={styles.errorText} role="alert">{errors.password}</span>}
              </div>

              {/* Sign up account type selectors */}
              {authMode === 'signup' && (
                <div className={styles.field}>
                  <span className={styles.label}>Account Type</span>
                  <div className={styles.typeContainer} role="radiogroup" aria-label="Select Account Role type">
                    <button 
                      type="button"
                      className={`${styles.typeBox} ${accountType === 'client' ? styles.typeBoxActive : ''}`}
                      onClick={() => setAccountType('client')}
                      role="radio"
                      aria-checked={accountType === 'client'}
                    >
                      <span className={styles.typeTitle}>Hiring Client</span>
                      <span className={styles.typeDesc}>Looking to hire contractors</span>
                    </button>
                    
                    <button 
                      type="button"
                      className={`${styles.typeBox} ${accountType === 'seller_only' ? styles.typeBoxActive : ''}`}
                      onClick={() => setAccountType('seller_only')}
                      role="radio"
                      aria-checked={accountType === 'seller_only'}
                    >
                      <span className={styles.typeTitle}>Seller-only</span>
                      <span className={styles.typeDesc}>Sell pre-built or redeveloped products only</span>
                    </button>

                    <button 
                      type="button"
                      className={`${styles.typeBox} ${accountType === 'freelancer_seller' ? styles.typeBoxActive : ''}`}
                      onClick={() => setAccountType('freelancer_seller')}
                      role="radio"
                      aria-checked={accountType === 'freelancer_seller'}
                    >
                      <span className={styles.typeTitle}>Freelancer + Seller</span>
                      <span className={styles.typeDesc}>Offer freelance services and sell products</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sign up terms conditions check */}
              {authMode === 'signup' && (
                <div className={styles.field}>
                  <div className={styles.checkboxRow}>
                    <input 
                      type="checkbox" 
                      id="auth-terms" 
                      className={styles.checkbox}
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                    />
                    <label htmlFor="auth-terms" className={styles.checkboxLabel}>
                      I agree to the AdFreelancin <a href="#terms" className={styles.footerLink}>Terms of Service</a> and <a href="#privacy" className={styles.footerLink}>Privacy Policy</a>.
                    </label>
                  </div>
                  {errors.terms && <span className={styles.errorText} role="alert">{errors.terms}</span>}
                </div>
              )}

              {/* Submit CTA */}
              <button 
                type="submit" 
                className={styles.submitBtn}
                id="auth-submit-btn"
              >
                {authMode === 'login' ? 'Log In to Account' : 'Create Account'}
              </button>

            </form>

            {/* Bottom Form Toggles */}
            <div className={styles.footerRow}>
              {authMode === 'login' ? (
                <>
                  <span>New to AdFreelancin?</span>
                  <button 
                    type="button" 
                    className={styles.footerLink}
                    onClick={() => handleTabToggle('signup')}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>
                  <button 
                    type="button" 
                    className={styles.footerLink}
                    onClick={() => handleTabToggle('login')}
                  >
                    Log In
                  </button>
                </>
              )}
            </div>

          </div>

        </section>
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
