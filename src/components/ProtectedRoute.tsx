// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token'); // Check if JWT is present

  if (!token) {
    // Redirect to login if not logged in
    return <Navigate to="/login" />;
  }

  return children; // Render children if logged in
};

export default ProtectedRoute;
