import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './RatingPage.module.css';
import Header from '../../components/Header';

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = isLocal
  ? (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000')
  : 'https://freelancemarketplace-backend.onrender.com';

export default function RatingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Load current user from session
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('currentUser');
    return session ? JSON.parse(session) : null;
  });

  const [order, setOrder] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    async function fetchOrderDetails() {
      try {
        // Fetch order details
        const orderRes = await fetch(`${API_BASE_URL}/orders/detail/${orderId}`);
        if (!orderRes.ok) {
          throw new Error("Order not found");
        }
        const orderData = await orderRes.json();
        setOrder(orderData);

        // Security check: Verify order belongs to this client
        if (orderData.buyer_id !== currentUser.id) {
          throw new Error("Unauthorized: You do not own this order");
        }

        // Check if already rated
        if (orderData.is_rated) {
          throw new Error("This job contract has already been rated");
        }

        // Check if job is completed
        if (orderData.status !== 'completed') {
          throw new Error("Job is not completed yet. Please mark it as completed first.");
        }

        // Fetch freelancer profile details
        const profileRes = await fetch(`${API_BASE_URL}/users/${orderData.seller_id}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setFreelancer(profileData);
        } else {
          setFreelancer({
            full_name: 'Freelancer Specialist',
            initials: 'FL',
            avatar_bg: '#1B2A41'
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      alert("Please write a review comment.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: currentUser.id,
          rating: rating,
          review_text: reviewText.trim()
        })
      });

      if (response.ok) {
        alert("Review submitted successfully!");
        navigate('/dashboard');
      } else {
        const errData = await response.json();
        alert(errData.detail || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error: Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loadingText}>Loading contract details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrapper}>
        <div className={styles.errorCard}>
          <h2>⚠️ Access Denied</h2>
          <p>{error}</p>
          <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const freelancerName = freelancer?.full_name || freelancer?.name || 'Freelancer';
  const initials = freelancer?.initials || freelancerName.split(' ').map(n => n[0]).join('').toUpperCase();
  const avatarBg = freelancer?.avatar_bg || '#1b2a41';

  return (
    <div className={styles.pageWrapper}>
      {/* 1. NAVBAR */}
      <Header activeTab="Dashboard" />

      {/* 2. RATING CONTENT CONTAINER */}
      <main className={styles.mainContainer}>
        <div className={styles.ratingCard}>
          <div className={styles.headerSection}>
            <span className={styles.badge}>Completed Job Contract</span>
            <h1 className={styles.title}>Submit Freelancer Review</h1>
            <p className={styles.subtitle}>
              Your rating will be displayed publicly on their profile to help other clients hire confidently.
            </p>
          </div>

          {/* Freelancer Profile Badge */}
          <div className={styles.freelancerBanner}>
            <div className={styles.avatar} style={{ backgroundColor: avatarBg }}>
              {initials}
            </div>
            <div className={styles.freelancerMeta}>
              <h2 className={styles.freelancerName}>{freelancerName}</h2>
              <p className={styles.gigTitle}>{order?.gig_title || 'Project Milestone Scope'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.ratingForm}>
            {/* Interactive Stars Selector */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Select Rating</label>
              <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isActive = hoverRating ? starValue <= hoverRating : starValue <= rating;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      className={`${styles.starBtn} ${isActive ? styles.starActive : ''}`}
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${starValue} Stars`}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
              <span className={styles.ratingDescriptor}>
                {rating === 5 && 'Excellent: Exceeded expectations!'}
                {rating === 4 && 'Good: Met requirements.'}
                {rating === 3 && 'Average: Minor issues.'}
                {rating === 2 && 'Poor: Disappointed.'}
                {rating === 1 && 'Terrible: Major failures.'}
              </span>
            </div>

            {/* Review Feedback Textarea */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="review-feedback">
                Write Your Review
              </label>
              <textarea
                id="review-feedback"
                className={styles.textarea}
                placeholder="Share your experience working with this freelancer (communication, timeliness, code quality)..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className={styles.actionRow}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? 'Submitting Review...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
