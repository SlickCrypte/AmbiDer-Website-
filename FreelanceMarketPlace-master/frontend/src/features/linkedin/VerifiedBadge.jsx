import React from 'react';

/**
 * VerifiedBadge Component
 * Displays a navy-blue badge with a LinkedIn "in" symbol/checkmark and "Verified" text.
 * Only rendered if the freelancer is LinkedIn-verified.
 */
export default function VerifiedBadge({ isVerified }) {
  if (!isVerified) return null;

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: 'var(--color-navy-dark)',
        color: '#FFFFFF',
        padding: '3px 8px',
        borderRadius: 'var(--border-radius-card)',
        fontSize: 'var(--font-size-label)',
        fontWeight: '600',
        letterSpacing: '0.3px',
        height: '20px',
        width: 'fit-content'
      }}
      title="LinkedIn Verified Freelancer"
    >
      {/* LinkedIn tiny logo */}
      <svg 
        viewBox="0 0 24 24" 
        width="10" 
        height="10" 
        fill="currentColor"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
      <span>Verified</span>
    </div>
  );
}
