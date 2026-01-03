import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const { currentUser } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'submissions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submissionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmissions(submissionsData);
      setFilteredSubmissions(submissionsData);
      
      // Calculate stats
      const newStats = {
        total: submissionsData.length,
        pending: submissionsData.filter(s => s.status === 'pending').length,
        approved: submissionsData.filter(s => s.status === 'approved').length,
        rejected: submissionsData.filter(s => s.status === 'rejected').length
      };
      setStats(newStats);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let filtered = submissions;
    
    if (filters.category) {
      filtered = filtered.filter(sub => sub.category === filters.category);
    }
    
    if (filters.status) {
      filtered = filtered.filter(sub => sub.status === filters.status);
    }
    
    setFilteredSubmissions(filtered);
  }, [filters, submissions]);

  const handleStatusUpdate = async (submissionId, newStatus) => {
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        reviewedBy: currentUser.uid
      });

      if (reviewComment) {
        await addDoc(collection(db, 'reviews'), {
          submissionId,
          reviewerId: currentUser.uid,
          comment: reviewComment,
          status: newStatus,
          createdAt: new Date().toISOString()
        });
      }

      setReviewModal(null);
      setReviewComment('');
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return { bg: 'linear-gradient(135deg, #10b981, #34d399)', text: '#065f46' };
      case 'rejected': return { bg: 'linear-gradient(135deg, #ef4444, #f87171)', text: '#7f1d1d' };
      default: return { bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', text: '#92400e' };
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Certification': '🏆',
      'Internship': '💼',
      'Project': '🚀',
      'Workshop': '🎯',
      'Hackathon': '⚡'
    };
    return icons[category] || '📄';
  };

  const categories = ['Certification', 'Internship', 'Project', 'Workshop', 'Hackathon'];
  const statuses = ['pending', 'approved', 'rejected'];

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'bounce 2s infinite' }}>👨‍💼</div>
        <h1 style={{
          fontSize: '42px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '15px'
        }}>
          Admin Control Center
        </h1>
        <p style={{ color: '#666', fontSize: '20px' }}>Manage and review student achievements</p>
      </div>

      {/* Stats Dashboard */}
      <div className="stats-grid" style={{ marginBottom: '40px' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
          <div style={{ color: 'white', fontSize: '48px', marginBottom: '10px' }}>📊</div>
          <div style={{ color: 'white', fontSize: '36px', fontWeight: '800' }}>{stats.total}</div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600' }}>TOTAL SUBMISSIONS</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
          <div style={{ color: 'white', fontSize: '48px', marginBottom: '10px' }}>⏳</div>
          <div style={{ color: 'white', fontSize: '36px', fontWeight: '800' }}>{stats.pending}</div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600' }}>PENDING REVIEW</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
          <div style={{ color: 'white', fontSize: '48px', marginBottom: '10px' }}>✅</div>
          <div style={{ color: 'white', fontSize: '36px', fontWeight: '800' }}>{stats.approved}</div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600' }}>APPROVED</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
          <div style={{ color: 'white', fontSize: '48px', marginBottom: '10px' }}>❌</div>
          <div style={{ color: 'white', fontSize: '36px', fontWeight: '800' }}>{stats.rejected}</div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600' }}>REJECTED</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: '#333' }}>🔍 Filter Submissions</h3>
        <div className="filters">
          <div>
            <label style={{ marginBottom: '8px', display: 'block', fontWeight: '600' }}>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="form-control"
              style={{ fontSize: '16px', padding: '12px 16px' }}
            >
              <option value="">🌟 All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ marginBottom: '8px', display: 'block', fontWeight: '600' }}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="form-control"
              style={{ fontSize: '16px', padding: '12px 16px' }}
            >
              <option value="">📋 All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px'
            }}>
              📊 Showing {filteredSubmissions.length} of {submissions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="card">
        <div style={{ padding: '0 0 25px 0', borderBottom: '3px solid rgba(102, 126, 234, 0.2)', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#333' }}>📝 Student Submissions</h3>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="loading-spinner" style={{ width: '60px', height: '60px' }}></div>
            <p style={{ marginTop: '20px', fontSize: '18px', color: '#666' }}>Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>No submissions found</h3>
            <p style={{ fontSize: '16px' }}>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div>
            {filteredSubmissions.map((submission, index) => {
              const statusStyle = getStatusColor(submission.status);
              return (
                <div 
                  key={submission.id} 
                  className="submission-item"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))`,
                    border: `2px solid rgba(102, 126, 234, 0.1)`,
                    borderRadius: '20px',
                    padding: '25px',
                    marginBottom: '20px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Animated background accent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '6px',
                    height: '100%',
                    background: statusStyle.bg,
                    animation: `pulse 2s infinite`
                  }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingLeft: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ fontSize: '32px', marginRight: '15px' }}>
                          {getCategoryIcon(submission.category)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '22px', fontWeight: '700', color: '#333', marginBottom: '5px' }}>
                            {submission.title}
                          </h4>
                          <div style={{
                            display: 'inline-block',
                            background: statusStyle.bg,
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {submission.status}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#666', fontSize: '16px', fontWeight: '600' }}>
                          🏢 {submission.category} • {submission.organization}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#888', fontSize: '14px' }}>
                          👤 {submission.userEmail}
                        </span>
                      </div>
                      
                      {submission.duration && (
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ color: '#888', fontSize: '14px' }}>
                            📅 {submission.duration}
                          </span>
                        </div>
                      )}
                      
                      {submission.description && (
                        <p style={{ color: '#555', marginBottom: '15px', lineHeight: '1.6', fontSize: '15px' }}>
                          {submission.description}
                        </p>
                      )}
                      
                      <p style={{ color: '#999', fontSize: '12px' }}>
                        📅 Submitted: {new Date(submission.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginLeft: '25px' }}>
                      {submission.fileURL && (
                        <a
                          href={submission.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            fontSize: '14px',
                            padding: '10px 16px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          📎 View Certificate
                        </a>
                      )}
                      <button
                        onClick={() => setReviewModal(submission)}
                        className="btn btn-primary"
                        style={{
                          fontSize: '14px',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        ⚖️ Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚖️</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>Review Submission</h3>
            </div>
            
            <div style={{ marginBottom: '25px', padding: '20px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '15px' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{reviewModal.title}</h4>
              <p style={{ color: '#666', fontSize: '16px' }}>👤 {reviewModal.userEmail}</p>
              <p style={{ color: '#666', fontSize: '14px' }}>🏢 {reviewModal.category} • {reviewModal.organization}</p>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '16px' }}>
                💬 Review Comment (Optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows="4"
                className="form-control"
                placeholder="Add your review comments, feedback, or suggestions..."
                style={{ fontSize: '16px', padding: '15px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => handleStatusUpdate(reviewModal.id, 'approved')}
                className="btn btn-success"
                style={{ flex: 1, padding: '15px', fontSize: '16px', fontWeight: '600' }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleStatusUpdate(reviewModal.id, 'rejected')}
                className="btn btn-danger"
                style={{ flex: 1, padding: '15px', fontSize: '16px', fontWeight: '600' }}
              >
                ❌ Reject
              </button>
              <button
                onClick={() => setReviewModal(null)}
                className="btn"
                style={{ 
                  flex: 1, 
                  padding: '15px', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#666',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}
              >
                🚫 Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;