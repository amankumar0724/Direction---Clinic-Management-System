import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { authService } from './services/auth';
import { logger } from './services/logger';

// Components
import Login from './components/Login';
import DoctorDashboard from './components/DoctorDashboard';
import ReceptionistDashboard from './components/ReceptionistDashboard';
import LoadingSpinner from './components/LoadingSpinner';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info('App initialized');
    
    const unsubscribe = authService.onAuthStateChange((userData) => {
      if (userData) {
        setUser(userData.user);
        setUserRole(userData.role);
        logger.info('User authenticated', { 
          userId: userData.user.uid, 
          role: userData.role 
        });
      } else {
        setUser(null);
        setUserRole(null);
        logger.info('User not authenticated');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={(userData) => {
                  setUser(userData.user);
                  setUserRole(userData.role);
                }} />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              user ? (
                userRole === 'doctor' ? (
                  <DoctorDashboard user={user} />
                ) : (
                  <ReceptionistDashboard user={user} />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;