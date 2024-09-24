import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../Context/Current-User-Context'; // Adjust the path as needed

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  console.log(user)

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
