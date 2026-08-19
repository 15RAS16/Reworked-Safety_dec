/**
 * SafeRoute Guardian - Crowdsourced Community Safety Reviews Component
 * Dedicated review system with safety tags, 1-5 star ratings, filters, and moderation badges.
 */

window.CommunityReviewsView = function({
  onBackToWorkspace,
  onOpenExploreSafely,
  communityReviews = [],
  onAddReview
}) {
  const [activeFilter, setActiveFilter] = React.useState('ALL');
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [submissionSuccessToast, setSubmissionSuccessToast] = React.useState(null);

  // Form State
  const [rating, setRating] = React.useState(5);
  const [locationText, setLocationText] = React.useState('');
  const [authorName, setAuthorName] = React.useState('');
  const [reviewText, setReviewText] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState(['Safe for Solo Travel', 'Well-lit']);

  const AVAILABLE_TAGS = [
    'Well-lit',
    'Crowded',
    'Isolated',
    'Scam Risk',
    'Harassment Concern',
    'Safe for Solo Travel',
    'Poor Network',
    'Unsafe at Night',
    'Helpful Staff'
  ];

  const FILTERS = [
    { key: 'ALL', label: 'All Reviews' },
    { key: 'SOLO', label: 'Solo Traveller', matchTag: 'Safe for Solo Travel' },
    { key: 'WOMEN', label: 'Women Traveller', matchTag: 'Safe for Solo Travel' },
    { key: 'NIGHT', label: 'Night Travel', matchTag: 'Unsafe at Night' },
    { key: 'NETWORK', label: 'Network', matchTag: 'Poor Network' },
    { key: 'LIGHTING', label: 'Lighting', matchTag: 'Well-lit' },
    { key: 'SCAM', label: 'Scam Risk', matchTag: 'Scam Risk' }
  ];

  // Filter reviews
  const filteredReviews = React.useMemo(() => {
    if (activeFilter === 'ALL') return communityReviews;
    const filterObj = FILTERS.find(f => f.key === activeFilter);
    if (!filterObj || !filterObj.matchTag) return communityReviews;
    return communityReviews.filter(r => (r.tags || []).includes(filterObj.matchTag));
  }, [communityReviews, activeFilter]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !locationText.trim()) {
      alert('Please enter a location and your safety review text.');
      return;
    }

    const newRev = {
      author: authorName.trim() || 'Anonymous Traveler',
      avatar: '🧭',
      location: locationText.trim(),
      rating: rating,
      tags: selectedTags,
      review: reviewText.trim(),
      moderationStatus: 'Community Report'
    };

    if (onAddReview) {
      onAddReview(newRev);
    }

    setShowSubmitModal(false);
    setLocationText('');
    setReviewText('');
    setAuthorName('');
    setSelectedTags(['Safe for Solo Travel', 'Well-lit']);

    setSubmissionSuccessToast('Thank you! Your safety review has been submitted to the community network.');
    setTimeout(() => setSubmissionSuccessToast(null), 4000);
  };

  return (
    <div className="srg-community-view">
      {/* Top Bar */}
      <div className="srg-workspace-topbar" style={{ marginBottom: '1.5rem' }}>
        <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onBackToWorkspace}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Workspace
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="srg-btn srg-btn-primary srg-btn-sm" onClick={() => setShowSubmitModal(true)}>
            + Submit Safety Review
          </button>
          <button className="srg-btn srg-btn-outline srg-btn-sm" onClick={onOpenExploreSafely}>
            🧭 Explore Safely Overview
          </button>
        </div>
      </div>

      {/* Hero Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#F59E0B', padding: '0.3rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          <span>⭐</span> Crowdsourced Safety Intelligence
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#FFFFFF' }}>
          Community Safety Reviews & Signals
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
          Real feedback from travelers regarding lighting quality, crowd density, solo travel safety, scam alerts, and cellular coverage.
        </p>
      </div>

      {/* Success Toast */}
      {submissionSuccessToast && (
        <div style={{ background: '#10B981', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{submissionSuccessToast}</span>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`srg-tab-btn ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredReviews.length === 0 ? (
          <div style={{ background: 'var(--bg-card-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center', color: '#94A3B8', gridColumn: '1 / -1' }}>
            No reviews matching the "{activeFilter}" filter yet. Be the first to share a safety report!
          </div>
        ) : (
          filteredReviews.map(rev => (
            <div 
              key={rev.id}
              style={{
                background: 'var(--bg-card-dark)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{rev.avatar || '🧭'}</span>
                    <div>
                      <div style={{ fontWeight: '700', color: '#FFFFFF', fontSize: '0.95rem' }}>{rev.author}</div>
                      <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>📍 {rev.location} • <span style={{ color: '#94A3B8' }}>{rev.date}</span></div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    background: rev.moderationStatus === 'Verified Traveler' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                    color: rev.moderationStatus === 'Verified Traveler' ? '#10B981' : '#38BDF8',
                    border: `1px solid ${rev.moderationStatus === 'Verified Traveler' ? '#10B981' : '#38BDF8'}40`
                  }}>
                    {rev.moderationStatus}
                  </span>
                </div>

                {/* Rating Stars */}
                <div style={{ display: 'flex', gap: '2px', color: '#F59E0B', marginBottom: '0.75rem', fontSize: '1rem' }}>
                  {'★'.repeat(rev.rating)}
                  {'☆'.repeat(5 - rev.rating)}
                  <span style={{ fontSize: '0.78rem', color: '#CBD5E1', marginLeft: '6px' }}>({rev.rating}/5 Safety)</span>
                </div>

                <p style={{ fontSize: '0.88rem', color: '#E2E8F0', lineHeight: '1.5', marginBottom: '1rem' }}>
                  "{rev.review}"
                </p>
              </div>

              {/* Safety Tag Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {(rev.tags || []).map((t, idx) => (
                  <span key={idx} style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)', color: '#CBD5E1', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem' }}>
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Submission Modal */}
      {showSubmitModal && (
        <div className="srg-modal-backdrop" onClick={() => setShowSubmitModal(false)}>
          <div className="srg-checkin-modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '540px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Submit a Community Safety Report
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              Help other travelers understand lighting, network availability, and safety along this route.
            </p>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Your Name / Handle</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Maya S. (Solo Traveler)"
                    value={authorName} 
                    onChange={e => setAuthorName(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Route Segment / Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Marina Gate to Promenade"
                    value={locationText} 
                    onChange={e => setLocationText(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem' }}
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Safety Rating (1 = Poor, 5 = Excellent)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        background: rating >= star ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${rating >= star ? '#F59E0B' : 'var(--border-subtle)'}`,
                        color: rating >= star ? '#F59E0B' : '#94A3B8',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Tags Multi-select */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Select Safety Tags (Optional):</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {AVAILABLE_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        style={{
                          background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${isSelected ? '#38BDF8' : 'var(--border-subtle)'}`,
                          color: isSelected ? '#38BDF8' : '#94A3B8',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        {isSelected ? '✓ ' : '+ '}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Safety Experience & Observations</label>
                <textarea 
                  rows="3"
                  placeholder="Describe lighting, cell reception, crowds, or notable safety advice for other travelers..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem', background: '#0F172A', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff', marginTop: '0.25rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="srg-btn srg-btn-outline" onClick={() => setShowSubmitModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="srg-btn srg-btn-primary">
                  Submit Safety Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
