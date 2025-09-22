import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StationOwnerDashboard from './pages/station-owner/Dashboard';
import StationOwnerProfile from './pages/station-owner/Profile';
import StationOwnerStations from './pages/station-owner/MyStations';
import StationOwnerBookings from './pages/station-owner/MyBookings';
import EVOwnerProfile from './pages/ev-owner/Profile';
import EVOwnerBookings from './pages/ev-owner/MyBookings';
import Services from './pages/ev-owner/Services';
import NearbyStations from './pages/ev-owner/NearbyStations';
import AllStationsMap from './pages/ev-owner/AllStationsMap';
import BookingDetails from './pages/BookingDetails';
import Checkout from './pages/Checkout';
import LoadingSpinner from './components/LoadingSpinner';

// Normalize/compat helper for role values coming from backend or legacy data
const normalizeRole = (role?: string): 'station_owner' | 'ev_owner' | '' => {
  const r = (role || '').toLowerCase();
  if (r === 'station_owner' || r === 'ev_owner') return r as any;
  if (r === 'user') return 'ev_owner';
  if (r === 'owner') return 'station_owner';
  return '';
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - user:', user, 'loading:', loading, 'allowedRoles:', allowedRoles); // Debug log

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log('No user found, redirecting to login'); // Debug log
    return <Navigate to="/login" replace />;
  }

  // Normalize role comparison (defensive against unexpected casing/legacy values)
  if (allowedRoles) {
    const role = normalizeRole(user.role);
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (!allowed.includes(role)) {
      console.log('User role not allowed:', user.role, 'allowed:', allowedRoles); // Debug log
      // Redirect to role-appropriate landing instead of root
      const fallback = role === 'station_owner'
        ? '/station-owner/dashboard'
        : role === 'ev_owner'
          ? '/ev-owner/services'
          : '/';
      return <Navigate to={fallback} replace />;
    }
  }

  if (allowedRoles && !user.role) {
    console.log('User has no role set, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      
      {/* Station Owner Routes */}
      <Route 
        path="/station-owner/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['station_owner']}>
            <StationOwnerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/station-owner/profile" 
        element={
          <ProtectedRoute allowedRoles={['station_owner']}>
            <StationOwnerProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/station-owner/stations" 
        element={
          <ProtectedRoute allowedRoles={['station_owner']}>
            <StationOwnerStations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/station-owner/bookings" 
        element={
          <ProtectedRoute allowedRoles={['station_owner']}>
            <StationOwnerBookings />
          </ProtectedRoute>
        } 
      />
      
      {/* EV Owner Routes */}
      <Route 
        path="/ev-owner/profile" 
        element={
          <ProtectedRoute allowedRoles={['ev_owner']}>
            <EVOwnerProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ev-owner/bookings" 
        element={
          <ProtectedRoute allowedRoles={['ev_owner']}>
            <EVOwnerBookings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ev-owner/services" 
        element={
          <ProtectedRoute allowedRoles={['ev_owner']}>
            <Services />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ev-owner/nearby-stations" 
        element={
          <ProtectedRoute allowedRoles={['ev_owner']}>
            <NearbyStations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ev-owner/all-stations" 
        element={
          <ProtectedRoute allowedRoles={['ev_owner']}>
            <AllStationsMap />
          </ProtectedRoute>
        } 
      />
      
      {/* Shared Routes */}
      <Route 
        path="/booking/:id" 
        element={
          <ProtectedRoute>
            <BookingDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout/:id" 
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <AppRoutes />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;





