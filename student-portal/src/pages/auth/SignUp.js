import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../config/firebase';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rollNumber: '',
    department: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signUp(formData.email, formData.password, {
        name: formData.name,
        rollNumber: formData.rollNumber,
        department: formData.department,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create account: ' + error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign up with Google: ' + error.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    const confirmed = window.confirm(
      `Send password reset link to ${formData.email}?`
    );
    
    if (!confirmed) return;

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
      setError('');
    } catch (error) {
      setError('Failed to send reset email: ' + error.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
        <div className="text-center mb-20">
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            color: 'white',
            fontWeight: 'bold'
          }}>
            SE
          </div>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Join Sri Eshwar College
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>Create your account to get started</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {resetEmailSent && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              📧 Password reset email sent! Check your inbox.
            </div>
          )}

          {/* Google Sign Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #dadce0',
              borderRadius: '12px',
              background: 'white',
              color: '#3c4043',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '25px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '25px 0',
            color: '#666',
            fontSize: '14px'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
            <span style={{ padding: '0 15px' }}>or sign up with email</span>
            <div style={{ flex: 1, height: '1px', background: '#ddd' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <input
              type="text"
              name="name"
              required
              className="form-control"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              style={{ fontSize: '16px', padding: '15px 20px' }}
            />
            <input
              type="text"
              name="rollNumber"
              className="form-control"
              placeholder="Roll Number"
              value={formData.rollNumber}
              onChange={handleChange}
              style={{ fontSize: '16px', padding: '15px 20px' }}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              required
              className="form-control"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              style={{ fontSize: '16px', padding: '15px 20px' }}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="department"
              className="form-control"
              placeholder="Department (e.g., Computer Science)"
              value={formData.department}
              onChange={handleChange}
              style={{ fontSize: '16px', padding: '15px 20px' }}
            />
          </div>

          <div className="form-group">
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              style={{ fontSize: '16px', padding: '15px 20px', display: 'none' }}
            >
              <option value="student">🎓 Student</option>
              <option value="faculty">👨‍🏫 Faculty</option>
              <option value="admin">👨‍💼 Admin</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <input
              type="password"
              name="password"
              required
              className="form-control"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={{ fontSize: '16px', padding: '15px 20px' }}
            />
            <input
              type="password"
              name="confirmPassword"
              required
              className="form-control"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{ fontSize: '16px', padding: '15px 20px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '16px',
              fontWeight: '700',
              marginBottom: '20px'
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px', margin: '0' }}></div>
                Creating Account...
              </div>
            ) : '🚀 Create Account'}
          </button>

          <div className="text-center">
            <Link 
              to="/login" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none', 
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Already have an account? Sign in here →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;