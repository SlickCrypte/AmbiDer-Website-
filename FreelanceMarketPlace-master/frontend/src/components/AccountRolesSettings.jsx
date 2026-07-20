import React, { useState } from 'react';
import styles from './AccountRolesSettings.module.css';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal ? 'http://127.0.0.1:8000' : 'https://freelancemarketplace-backend.onrender.com';

const ROLE_DEFINITIONS = [
  {
    key: 'client',
    title: 'Hiring Client',
    desc: 'Post job descriptions, browse developer talent profiles, interview candidates, and manage milestone contracts.',
    badgeLabel: 'Client'
  },
  {
    key: 'freelancer_seller',
    title: 'Freelancer + Seller',
    desc: 'Offer custom software development services, pitch proposals, complete deliverables, and sell codebase templates.',
    badgeLabel: 'Freelancer'
  },
  {
    key: 'seller_only',
    title: 'Seller-only',
    desc: 'Publish prebuilt developer assets (themes, modules, plugins) to the catalog, track sales volume, and manage digital inventory.',
    badgeLabel: 'Seller'
  }
];

export default function AccountRolesSettings() {
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  const [activeModal, setActiveModal] = useState(null); // 'client', 'freelancer_seller', or 'seller_only'
  
  // Form setup states for new roles
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [hourlyRate, setHourlyRate] = useState(currentUser?.hourly_rate || '2000');
  const [skills, setSkills] = useState(currentUser?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) return null;

  const enabledRoles = currentUser.enabled_roles || [currentUser.account_type || 'freelancer_seller'];
  const activeRole = currentUser.active_role || currentUser.account_type || 'freelancer_seller';

  const handleOpenSetup = (roleKey) => {
    setBio(currentUser?.bio || '');
    setLocation(currentUser?.location || '');
    setHourlyRate(currentUser?.hourly_rate || '2000');
    setSkills(currentUser?.skills || []);
    setActiveModal(roleKey);
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleActivateRoleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (bio.trim().length < 20) {
      alert("Please enter a bio of at least 20 characters.");
      return;
    }
    if (!location.trim()) {
      alert("Location is required.");
      return;
    }

    setSubmitting(true);
    const newEnabledRoles = [...enabledRoles, activeModal];

    const updatePayload = {
      enabled_roles: newEnabledRoles,
      active_role: activeModal,
      bio: bio.trim(),
      location: location.trim(),
      is_verified: true
    };

    if (activeModal === 'freelancer_seller') {
      updatePayload.hourly_rate = parseFloat(hourlyRate) || 2000;
      updatePayload.skills = skills;
      updatePayload.role = 'Freelancer';
    } else if (activeModal === 'client') {
      updatePayload.role = 'Client';
    } else if (activeModal === 'seller_only') {
      updatePayload.role = 'seller';
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
        const updatedProfile = await response.json();
        const newSession = {
          ...currentUser,
          ...updatedProfile,
          is_profile_setup: true
        };
        localStorage.setItem('currentUser', JSON.stringify(newSession));
        alert(`Successfully enabled and switched to the ${ROLE_MAP_TITLE(activeModal)} role!`);
        setActiveModal(null);
        window.location.reload();
      } else {
        alert("Failed to activate role.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const ROLE_MAP_TITLE = (key) => {
    if (key === 'client') return 'Hiring Client';
    if (key === 'seller_only') return 'Seller-only';
    return 'Freelancer + Seller';
  };

  return (
    <div className={styles.rolesWrapper}>
      <div>
        <h2 className={styles.rolesTitle}>Account Roles</h2>
        <p className={styles.rolesSubtitle}>
          Enable multiple workspaces to hire developers, offer services, or sell prebuilt products from a single profile.
        </p>
      </div>

      <div className={styles.accountCard}>
        <div className={styles.avatar} style={{ backgroundColor: currentUser.avatar_bg || '#1B2A41' }}>
          {currentUser.initials}
        </div>
        <div className={styles.metaInfo}>
          <span className={styles.userName}>{currentUser.full_name}</span>
          <span className={styles.userEmail}>{currentUser.email}</span>
          <span className={styles.memberSince}>Member since {currentUser.member_since || 'Jan 2024'}</span>
        </div>
      </div>

      <div className={styles.rolesList}>
        {ROLE_DEFINITIONS.map((role) => {
          const isEnabled = enabledRoles.includes(role.key);
          const isActive = activeRole === role.key;

          return (
            <div 
              key={role.key} 
              className={`${styles.roleCard} ${isActive ? styles.roleCardActive : ''}`}
            >
              <div className={styles.roleDetails}>
                <div className={styles.roleHeader}>
                  <span className={styles.roleTitle}>{role.title}</span>
                  {isActive ? (
                    <span className={`${styles.badge} ${styles.activeBadge}`}>Active Workspace</span>
                  ) : isEnabled ? (
                    <span className={`${styles.badge} ${styles.enabledBadge}`}>Enabled</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.lockedBadge}`}>Not Enabled</span>
                  )}
                </div>
                <p className={styles.roleDesc}>{role.desc}</p>
              </div>

              <div>
                {isActive ? (
                  <button className={styles.actionBtn} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                    Active
                  </button>
                ) : isEnabled ? (
                  <button 
                    className={styles.actionBtn}
                    onClick={() => {
                      // Switch role triggers switch in workspace switcher
                      const switchFn = async () => {
                        try {
                          const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ active_role: role.key, role: role.key === 'client' ? 'Client' : role.key === 'seller_only' ? 'seller' : 'Freelancer' })
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            const newSession = { ...currentUser, ...updated, is_profile_setup: true };
                            localStorage.setItem('currentUser', JSON.stringify(newSession));
                            window.location.reload();
                          }
                        } catch (e) {
                          alert("Failed to switch workspace.");
                        }
                      };
                      switchFn();
                    }}
                  >
                    Switch Workspace
                  </button>
                ) : (
                  <button 
                    className={`${styles.actionBtn} ${styles.primaryBtn}`}
                    onClick={() => handleOpenSetup(role.key)}
                  >
                    Activate Role
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SETUP FORM MODAL */}
      {activeModal && (
        <div className={styles.setupModal}>
          <form className={styles.modalContent} onSubmit={handleActivateRoleSubmit}>
            <h3 className={styles.modalTitle}>Setup your {ROLE_MAP_TITLE(activeModal)} Profile</h3>
            
            <div className={styles.formField}>
              <label className={styles.label}>Location</label>
              <input 
                type="text" 
                className={styles.input} 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="e.g. Mumbai, India"
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Professional Summary / Bio</label>
              <textarea 
                className={styles.textarea} 
                rows="4" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Write a brief professional description (min 20 characters)..."
                required
              />
            </div>

            {activeModal === 'freelancer_seller' && (
              <>
                <div className={styles.formField}>
                  <label className={styles.label}>Hourly Rate (₹/hr)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={hourlyRate} 
                    onChange={(e) => setHourlyRate(e.target.value)} 
                    placeholder="2000"
                    required
                  />
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Core Skills (Press Enter to add)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={skillInput} 
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    placeholder="e.g. React, Python, FastAPI"
                  />
                  <div className={styles.skillsContainer}>
                    {skills.map((skill) => (
                      <span key={skill} className={styles.skillBadge}>
                        {skill}
                        <button type="button" className={styles.removeSkillBtn} onClick={() => handleRemoveSkill(skill)}>
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setActiveModal(null)}>
                Cancel
              </button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Activating...' : 'Activate & Switch'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
