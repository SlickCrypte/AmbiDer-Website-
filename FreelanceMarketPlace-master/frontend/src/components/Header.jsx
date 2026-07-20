import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import styles from './Header.module.css';

export default function Header({ activeTab, isLinkedInConnected: propConnected, setIsLinkedInConnected: propSetConnected }) {
  const navigate = useNavigate();

  // Load user session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  // Track isLinkedInConnected state (either from parent props or local fallback)
  const [localConnected, setLocalConnected] = useState(() => {
    return localStorage.getItem('adfreelancin_linkedin_connected') !== 'false';
  });

  const isLinkedInConnected = propSetConnected !== undefined ? propConnected : localConnected;

  const handleToggleLinkedIn = () => {
    const nextState = !isLinkedInConnected;
    if (propSetConnected !== undefined) {
      propSetConnected(nextState);
    } else {
      setLocalConnected(nextState);
    }
    localStorage.setItem('adfreelancin_linkedin_connected', String(nextState));

    // If connecting, handle OAuth redirection
    if (nextState === true) {
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      if (clientId && clientId !== 'your_linkedin_client_id_here') {
        const state = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        sessionStorage.setItem('linkedin_oauth_state', state);
        sessionStorage.setItem('linkedin_auth_context', 'verify');
        // Dynamic return URL mapping based on current view
        sessionStorage.setItem('linkedin_return_to', window.location.pathname);
        const redirectUri = window.location.origin + '/linkedin-callback';
        window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${state}`;
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <header className={styles.navbar}>
      {/* BRAND LOGO */}
      <div className={styles.logoContainer} onClick={() => { window.location.href = 'http://127.0.0.1:5500/AmbiDer-Website--main/index.html'; }} style={{ cursor: 'pointer' }}>
        <div className={styles.logoText}>
          <span className={styles.logoTextNavy}>Ad</span>
          <span className={styles.logoTextOrange}>Freelancin</span>
        </div>
        <div className={styles.logoDivider} />
        <div className={styles.logoWrapperGroup}>
          <span className={styles.parentLabel}>by</span>
          <div className={styles.logoImageWrapper}>
            <img src="/logo.png" alt="Ambider Logo" className={styles.logoImage} />
          </div>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className={styles.navLinks}>
        <button
          className={`${styles.navLink} ${activeTab === 'Find Talent' ? styles.activeNavLink : ''}`}
          onClick={() => navigate('/')}
        >
          Find Talent
        </button>

        <button
          className={`${styles.navLink} ${activeTab === 'Browse Jobs' ? styles.activeNavLink : ''}`}
          onClick={() => navigate('/jobs')}
        >
          Browse Jobs
        </button>

        <button
          className={`${styles.navLink} ${activeTab === 'Products' ? styles.activeNavLink : ''}`}
          onClick={() => navigate('/products')}
        >
          Products
        </button>

        <button
          className={`${styles.navLink} ${activeTab === 'Post a Project' ? styles.activeNavLink : ''}`}
          onClick={() => navigate('/post-job')}
        >
          Post a Project
        </button>

        <button
          className={`${styles.navLink} ${activeTab === 'List Product' ? styles.activeNavLink : ''}`}
          onClick={() => navigate('/post-product')}
        >
          List Product
        </button>
      </nav>

      {/* HEADER ACTIONS */}
      <div className={styles.navActions}>
        {/* LinkedIn Simulation Connection Button */}
        <button
          className={`${styles.linkedinToggleBtn} ${isLinkedInConnected ? styles.linkedinConnected : ''}`}
          onClick={handleToggleLinkedIn}
          title={isLinkedInConnected ? "Click to disconnect LinkedIn Sandbox" : "Click to connect LinkedIn Sandbox"}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
          <span>{isLinkedInConnected ? 'LinkedIn Linked' : 'Connect LinkedIn'}</span>
        </button>

        {currentUser ? (
          <>
            <button className={styles.dashboardBtn} onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <WorkspaceSwitcher />
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <button className={styles.loginBtn} onClick={() => navigate('/login')}>Log in</button>
            <button className={styles.joinBtn} onClick={() => navigate('/signup')}>Join Free</button>
          </>
        )}
      </div>
    </header>
  );
}
