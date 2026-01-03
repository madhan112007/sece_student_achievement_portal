import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentDashboard from '../student/StudentDashboard';
import AdminDashboard from '../admin/AdminDashboard';

const Dashboard = () => {
  const { userRole } = useAuth();

  if (userRole === 'admin' || userRole === 'faculty') {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
};

export default Dashboard;