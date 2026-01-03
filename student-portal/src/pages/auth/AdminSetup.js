import React, { useState } from 'react';
import { createAdminUser } from '../../utils/setupAdmin';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateAdmin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await createAdminUser();
      setMessage('Admin user created successfully! Email: codethetrend@gmail.com');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Admin user already exists. You can login with the credentials.');
      } else {
        setMessage('Error: ' + error.message);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Setup</h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-900">Admin Credentials:</h3>
          <p className="text-sm text-blue-700">Email: codethetrend@gmail.com</p>
          <p className="text-sm text-blue-700">Password: sample123</p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleCreateAdmin}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Creating Admin...' : 'Create Admin User'}
        </button>

        <div className="mt-4 text-center">
          <a href="/login" className="text-primary-600 hover:text-primary-500">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;