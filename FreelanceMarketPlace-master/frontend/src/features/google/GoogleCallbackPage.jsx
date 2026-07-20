import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL && isLocal)
  ? import.meta.env.VITE_API_BASE_URL
  : 'https://freelancemarketplace-backend.onrender.com';

export default function GoogleCallbackPage() {
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

      // Google returned an error
      if (error) {
        setStatus('error');
        setErrorMessage(`Google authorization failed: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received from Google.');
        return;
      }

      // Validate CSRF state token
      const savedState = sessionStorage.getItem('google_oauth_state');
      if (savedState && state !== savedState) {
        setStatus('error');
        setErrorMessage('Security validation failed. Please try again.');
        return;
      }

      const redirectUri = window.location.origin + '/google-callback';
      const payload = { code, redirect_uri: redirectUri };

      try {
        const response = await fetch(`${API_BASE_URL}/users/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errDetail = 'Google authentication failed.';
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
        sessionStorage.removeItem('google_oauth_state');

        const isSetup = !!(profile.bio && profile.location);
        const loggedInUser = {
          ...profile,
          skills: profile.skills || [],
          hourly_rate: profile.hourly_rate || 2000,
          initials: profile.initials || (profile.full_name || 'G').split(' ').map(n => n[0]).join('').toUpperCase(),
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
        console.error('Google callback error:', err);
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
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8EBEF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              <svg viewBox="0 0 24 24" width="36" height="36">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.24-.71-.38-1.47-.38-2.26s.14-1.55.38-2.26L1.5 3c-.96 1.9-1.5 4.05-1.5 6.31s.54 4.41 1.5 6.31l3.96-3.05z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-title)', fontWeight: '800', marginBottom: '12px', color: 'var(--color-navy-dark)' }}>
              Connecting with Google...
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
              Google Connected!
            </h2>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
              Your Google identity has been verified successfully. Redirecting you now...
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
