import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && isLocal)
  ? import.meta.env.VITE_API_BASE_URL
  : 'https://freelancemarketplace-backend.onrender.com';

export default function GitHubCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const hasFetched = React.useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // GitHub returned an error
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || `GitHub authorization failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received from GitHub.');
        return;
      }

      // Validate CSRF state token
      const savedState = sessionStorage.getItem('github_oauth_state');
      if (savedState && state !== savedState) {
        setStatus('error');
        setErrorMessage('Security validation failed. Please try again.');
        return;
      }

      const redirectUri = window.location.origin + '/github-callback';
      const payload = { code, redirect_uri: redirectUri };

      try {
        const response = await fetch(`${API_BASE_URL}/users/github`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errDetail = 'GitHub authentication failed.';
          try {
            const errData = await response.json();
            if (errData?.detail) errDetail = errData.detail;
          } catch (_) { /* ignore */ }
          setStatus('error');
          setErrorMessage(errDetail);
          return;
        }

        const data = await response.json();
        const profile = data.profile;

        setStatus('success');
        sessionStorage.removeItem('github_oauth_state');

        const isSetup = !!(profile.bio && profile.location);
        const loggedInUser = {
          ...profile,
          skills: profile.skills || [],
          hourly_rate: profile.hourly_rate || 2000,
          initials: profile.initials || (profile.full_name || 'GH').split(' ').map(n => n[0]).join('').toUpperCase(),
          is_profile_setup: isSetup,
        };
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));

        setTimeout(() => {
          if (data.is_new_user || !isSetup) {
            navigate('/profile-setup');
          } else {
            navigate('/dashboard');
          }
        }, 2000);

      } catch (err) {
        console.error('GitHub callback error:', err);
        setStatus('error');
        setErrorMessage('Network error: Could not connect to the authentication server.');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--color-bg-light)',
      color: 'var(--color-text-dark)',
      fontFamily: 'Inter, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        padding: '40px',
        borderRadius: 'var(--border-radius-card)',
        backgroundColor: 'var(--color-card-white)',
        border: '1px solid #E8EBEF',
        boxShadow: 'var(--shadow-card)'
      }}>

        {/* Loading State */}
        {status === 'loading' && (
          <>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#24292e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 'var(--font-size-display)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-title)', fontWeight: '800', marginBottom: '12px', color: 'var(--color-navy-dark)' }}>
              Connecting with GitHub...
            </h2>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              Securely exchanging credentials. Please wait.
            </p>
            <div style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-orange)',
                  animation: `pulse 1s ease-in-out ${i * 0.2}s infinite alternate`
                }} />
              ))}
            </div>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 'var(--font-size-display)',
              fontWeight: 'bold'
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: 'var(--font-size-headline)', fontWeight: '800', marginBottom: '12px', color: 'var(--color-navy-dark)' }}>
              GitHub Connected!
            </h2>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              Your GitHub identity has been verified successfully. Redirecting you now...
            </p>
            <div style={{
              fontSize: 'var(--font-size-label)',
              color: 'var(--color-accent-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '700'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent-orange)',
                animation: 'pulse 1s infinite alternate'
              }}></span>
              <span>Redirecting...</span>
            </div>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 'var(--font-size-display)',
              fontWeight: 'bold'
            }}>
              ✕
            </div>
            <h2 style={{ fontSize: 'var(--font-size-headline)', fontWeight: '800', marginBottom: '12px', color: 'var(--color-navy-dark)' }}>
              Connection Failed
            </h2>
            <p style={{ fontSize: 'var(--font-size-body)', color: '#EF4444', lineHeight: '1.6', marginBottom: '24px' }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--border-radius-card)',
                  border: '1px solid #E8EBEF',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-label)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Back to Login
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
