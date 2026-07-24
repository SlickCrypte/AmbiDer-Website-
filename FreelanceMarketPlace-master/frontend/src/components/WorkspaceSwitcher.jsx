import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WorkspaceSwitcher.module.css';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://freelancemarketplace-backend.onrender.com';

const ROLE_MAP = {
  'client': {
    title: 'Hiring Client',
    desc: 'Hire top developers & manage contracts',
    roleLabel: 'Client'
  },
  'freelancer_seller': {
    title: 'Freelancer + Seller',
    desc: 'Offer services & sell custom code',
    roleLabel: 'Freelancer'
  },
  'seller_only': {
    title: 'Seller-only',
    desc: 'Sell digital products & prebuilt themes',
    roleLabel: 'seller'
  }
};

export default function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load user session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) return null;

  // Make sure enabled_roles array exists (backward compatibility)
  const enabledRoles = currentUser.enabled_roles || [currentUser.account_type || 'freelancer_seller'];
  const activeRole = currentUser.active_role || currentUser.account_type || 'freelancer_seller';

  const handleSwitchRole = async (newRole) => {
    if (newRole === activeRole) {
      setIsOpen(false);
      return;
    }

    try {
      // 1. Sync updated active_role to backend
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          active_role: newRole,
          role: ROLE_MAP[newRole]?.roleLabel || 'Freelancer'
        })
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        
        // 2. Update local session storage
        const newSession = {
          ...currentUser,
          ...updatedProfile,
          // compute dynamic setup flag
          is_profile_setup: !!(updatedProfile.bio && updatedProfile.location)
        };
        localStorage.setItem('currentUser', JSON.stringify(newSession));
        setCurrentUser(newSession);
        setIsOpen(false);

        // 3. Navigate/Reload to trigger clean dashboard rerender
        navigate('/dashboard');
        window.location.reload();
      } else {
        alert("Failed to switch workspace role.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Could not contact server to switch workspace.");
    }
  };

  const handleBecomeRole = () => {
    setIsOpen(false);
    navigate('/dashboard?tab=Settings&sub=Roles');
  };

  const activeInfo = ROLE_MAP[activeRole] || ROLE_MAP['freelancer_seller'];

  return (
    <div className={styles.switcherContainer} ref={dropdownRef}>
      <button 
        className={`${styles.switcherTrigger} ${isOpen ? styles.activeMenu : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.avatar} style={{ backgroundColor: currentUser.avatar_bg }}>
          {currentUser.avatar_url ? (
            <img 
              src={currentUser.avatar_url} 
              alt={currentUser.full_name} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
            />
          ) : (
            currentUser.initials || currentUser.full_name?.slice(0, 2).toUpperCase() || 'US'
          )}
        </div>
        <div className={styles.metaInfo}>
          <span className={styles.userName}>{currentUser.full_name}</span>
          <span className={styles.activeRole}>{activeInfo.title}</span>
        </div>
        <span className={styles.arrowIcon}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <span className={styles.dropdownTitle}>Switch Workspace</span>
          {enabledRoles.map((role) => {
            const info = ROLE_MAP[role];
            if (!info) return null;
            const isActive = role === activeRole;
            return (
              <button 
                key={role}
                className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
                onClick={() => handleSwitchRole(role)}
              >
                <span className={styles.roleTitle}>{info.title}</span>
                <span className={styles.roleDesc}>{info.desc}</span>
              </button>
            );
          })}

          {enabledRoles.length < 3 && (
            <>
              <div className={styles.divider} />
              <button className={styles.menuItem} onClick={handleBecomeRole}>
                <span className={styles.becomeTitle}>
                  ✨ Enable Additional Roles
                </span>
                <span className={styles.roleDesc}>Become Client, Freelancer, or Seller</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
