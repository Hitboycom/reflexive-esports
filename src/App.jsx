import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import Profile from './components/Profile';
import Contests from './components/Contests';
import CreateContest from './components/CreateContest';
import ContestDetails from './components/ContestDetails';
import Transactions from './components/Transactions';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminCreateContest from './components/admin/CreateContest';
import ManageUsers from './components/admin/ManageUsers';
import ManageContests from './components/admin/ManageContests';
import ContestRegistration from './components/contest/ContestRegistration';
import ContestLobby from './components/contest/ContestLobby';
import LoadingSpinner from './components/ui/LoadingSpinner';
import IntroLogo from './components/ui/IntroLogo';
import './App.css';
import './styles/gaming-theme.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!user.is_admin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/dashboard" /> : children;
};

function AppContent() {
  const { loading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  useEffect(() => {
    // Check if user has seen intro in this session
    const seenIntro = sessionStorage.getItem('hasSeenIntro');
    if (seenIntro) {
      setShowIntro(false);
      setHasSeenIntro(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setHasSeenIntro(true);
    sessionStorage.setItem('hasSeenIntro', 'true');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (showIntro && !hasSeenIntro) {
    return <IntroLogo onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-background gaming-theme">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/contests" element={
            <ProtectedRoute>
              <Contests />
            </ProtectedRoute>
          } />
          <Route path="/contests/:contestId" element={
            <ProtectedRoute>
              <ContestDetails />
            </ProtectedRoute>
          } />
          <Route path="/contests/:contestId/register" element={
            <ProtectedRoute>
              <ContestRegistration />
            </ProtectedRoute>
          } />
          <Route path="/contests/:contestId/lobby" element={
            <ProtectedRoute>
              <ContestLobby />
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/contests/create" element={
            <AdminRoute>
              <AdminCreateContest />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <ManageUsers />
            </AdminRoute>
          } />
          <Route path="/admin/contests" element={
            <AdminRoute>
              <ManageContests />
            </AdminRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
              <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

