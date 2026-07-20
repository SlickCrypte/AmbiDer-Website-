import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && isLocal)
  ? import.meta.env.VITE_API_BASE_URL
  : 'https://freelancemarketplace-backend.onrender.com';

export default function LinkedInCallbackPage() {
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

      // LinkedIn returned an error (e.g. user denied consent)
      if (error) {
        setStatus('error');
        setErrorMessage(errorDescription || `LinkedIn authorization failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received from LinkedIn.');
        return;
      }

      // Validate CSRF state token
      const savedState = sessionStorage.getItem('linkedin_oauth_state');
      if (savedState && state !== savedState) {
        setStatus('error');
        setErrorMessage('Security validation failed. Please try again.');
        return;
      }

      // Determine flow context: 'auth' (login/signup) or 'verify' (badge only)
      const authContext = sessionStorage.getItem('linkedin_auth_context') || 'auth';
      const redirectUri = window.location.origin + '/linkedin-callback';

      // Build request payload
      const payload = { code, redirect_uri: redirectUri };

      // If this is a verification-only flow, attach the existing user's ID
      if (authContext === 'verify') {
        const session = localStorage.getItem('currentUser');
        const currentUser = session ? JSON.parse(session) : null;
        if (currentUser?.id) {
          payload.verify_user_id = currentUser.id;
        }
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/linkedin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errDetail = 'LinkedIn authentication failed.';
          try {
            const errData = await response.json();
            if (errData?.detail) errDetail = errData.detail;
          } catch (_) { /* ignore parse errors */ }
          setStatus('error');
          setErrorMessage(errDetail);
          return;
        }

        const data = await response.json();
        const profile = data.profile;

        localStorage.setItem('adfreelancin_linkedin_connected', 'true');
        setStatus('success');
        sessionStorage.removeItem('linkedin_oauth_state');
        sessionStorage.removeItem('linkedin_auth_context');

        const isSetup = !!(profile.bio && profile.location);
        const loggedInUser = {
          ...profile,
          skills: profile.skills || [],
          hourly_rate: profile.hourly_rate || 2000,
          initials: profile.initials || (profile.full_name || 'LI').split(' ').map(n => n[0]).join('').toUpperCase(),
          is_profile_setup: isSetup,
        };
        localStorage.setItem('currentUser', JSON.stringify(loggedInUser));

        setTimeout(() => {
          if (authContext === 'verify') {
            const returnTo = sessionStorage.getItem('linkedin_return_to') || '/';
            sessionStorage.removeItem('linkedin_return_to');
            navigate(returnTo);
          } else {
            if (data.is_new_user || !isSetup) {
              navigate('/profile-setup');
            } else {
              navigate('/dashboard');
            }
          }
        }, 2000);
      } catch (err) {
        console.error('LinkedIn callback error:', err);
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
              backgroundColor: '#0077B5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 'var(--font-size-display)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-title)', fontWeight: '800', marginBottom: '12px', color: 'var(--color-navy-dark)' }}>
              Connecting with LinkedIn...
            </h2>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              Securely exchanging credentials. Please wait.
            </p>
            {/* Animated dots */}
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
              LinkedIn Connected!
            </h2>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              Your LinkedIn identity has been verified successfully. Redirecting you now...
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
                onClick={() => {
                  const authContext = sessionStorage.getItem('linkedin_auth_context') || 'auth';
                  if (authContext === 'verify') {
                    navigate(sessionStorage.getItem('linkedin_return_to') || '/');
                  } else {
                    navigate('/login');
                  }
                }}
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
                {sessionStorage.getItem('linkedin_auth_context') === 'verify' ? '← Back' : '← Back to Login'}
              </button>
              <button
                onClick={() => {
                  const authContext = sessionStorage.getItem('linkedin_auth_context') || 'auth';
                  if (authContext === 'verify') {
                    navigate(sessionStorage.getItem('linkedin_return_to') || '/');
                  } else {
                    navigate('/login');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--border-radius-card)',
                  border: 'none',
                  backgroundColor: 'var(--color-accent-orange)',
                  color: '#FFFFFF',
                  fontSize: 'var(--font-size-label)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </div>

      {/* Pulse keyframe animation */}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
