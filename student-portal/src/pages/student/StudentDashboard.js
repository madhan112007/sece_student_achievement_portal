import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import SubmissionForm from '../../components/forms/SubmissionForm';
import FirebaseTest from '../../components/FirebaseTest';

const StudentDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('submissions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    console.log('Setting up listener for user:', currentUser.uid);

    try {
      const q = query(
        collection(db, 'submissions'),
        where('userId', '==', currentUser.uid)
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('Received snapshot with', snapshot.size, 'documents');
          const submissionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSubmissions(submissionsData);
          setLoading(false);
          setError('');
        },
        (err) => {
          console.error('Firestore error:', err);
          setError('Error loading submissions: ' + err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Setup error:', err);
      setError('Error setting up listener: ' + err.message);
      setLoading(false);
    }
  }, [currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'badge-approved';
      case 'rejected': return 'badge-rejected';
      default: return 'badge-pending';
    }
  };

  const getStats = () => {
    const total = submissions.length;
    const approved = submissions.filter(s => s.status === 'approved').length;
    const pending = submissions.filter(s => s.status === 'pending').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;
    return { total, approved, pending, rejected };
  };

  const stats = getStats();

  if (!currentUser) {
    return <div className="container"><div className="card">Please log in to view dashboard</div></div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '800', 
          marginBottom: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Student Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '18px' }}>Track and manage your academic achievements</p>
      </div>

      {/* Debug Info */}
      <FirebaseTest />

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      <div className="tabs">
        <div
          onClick={() => setActiveTab('submissions')}
          className={`tab ${activeTab === 'submissions' ? 'active' : ''}`}
        >
          📄 My Submissions
        </div>
        <div
          onClick={() => setActiveTab('new')}
          className={`tab ${activeTab === 'new' ? 'active' : ''}`}
        >
          ➕ New Submission
        </div>
      </div>

      {activeTab === 'submissions' && (
        <div className="card">
          <div style={{ padding: '0 0 20px 0', borderBottom: '2px solid rgba(255,255,255,0.3)', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#333' }}>Your Submissions</h3>
          </div>
          
          {loading ? (
            <div className="text-center">
              <div className="loading-spinner"></div>
              <p>Loading your submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center" style={{ padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
              <h3>No submissions yet</h3>
              <p>Click "New Submission" to add your first achievement!</p>
            </div>
          ) : (
            <div>
              {submissions.map((submission) => (
                <div key={submission.id} className="submission-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginRight: '15px' }}>
                          {submission.title}
                        </h4>
                        <span className={`badge ${getStatusColor(submission.status)}`}>
                          {submission.status.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ color: '#666', marginBottom: '8px', fontSize: '16px' }}>
                        🏢 {submission.category} • {submission.organization}
                      </p>
                      {submission.duration && (
                        <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>
                          📅 {submission.duration}
                        </p>
                      )}
                      {submission.description && (
                        <p style={{ color: '#555', marginBottom: '10px', lineHeight: '1.6' }}>
                          {submission.description}
                        </p>
                      )}
                      <p style={{ color: '#999', fontSize: '12px' }}>
                        Submitted: {new Date(submission.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {submission.fileURL && (
                      <div style={{ marginLeft: '20px' }}>
                        <a
                          href={submission.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: '14px', padding: '8px 16px' }}
                        >
                          📎 View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'new' && <SubmissionForm />}
    </div>
  );
};

export default StudentDashboard;