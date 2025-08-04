import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Trophy, 
  Wallet, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Plus,
  History,
  Shield,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/contests', label: 'Contests', icon: Trophy },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/transactions', label: 'Transactions', icon: History },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // Add admin panel for admin users
  if (user?.is_admin) {
    navLinks.push({ path: '/admin', label: 'Admin Panel', icon: Shield });
  }

  if (!user) {
    return (
      <nav className="gaming-nav">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-gaming-neon-cyan gaming-glow" />
              <span className="gaming-title text-xl font-bold">Reflexive Esports</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-2">
                <Link to="/login">
                  <Button variant="ghost" className="gaming-nav-item">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="gaming-btn-primary">Sign Up</Button>
                </Link>
              </div>
              
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu for non-authenticated users */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="gaming-nav sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-gaming-neon-cyan gaming-glow" />
            <span className="gaming-title text-xl font-bold">Reflexive Esports</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant="ghost"
                  className={`clean-nav-item flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ease-in-out ${
                    isActive(path) 
                      ? 'bg-purple-600/20 text-cyan-400 shadow-lg shadow-purple-500/20' 
                      : 'text-gray-300 hover:text-cyan-400 hover:bg-purple-600/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
            
            {/* Only show create contest for admin users */}
            {user?.is_admin && (
              <Link to="/admin/contests/create">
                <Button className="clean-admin-btn flex items-center space-x-2 ml-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30">
                  <Plus className="h-4 w-4" />
                  <span>Create Contest</span>
                </Button>
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* User info and logout */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1 gaming-card rounded-lg">
                <Wallet className="h-4 w-4 text-gaming-neon-green" />
                <span className="text-sm font-medium gaming-text-primary">{user.wallet_balance?.toFixed(2)}₹</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{user.username}</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-2">
              {/* User info */}
              <div className="px-3 py-2 bg-secondary rounded-lg mb-2">
                <div className="text-sm font-medium">{user.username}</div>
                <div className="text-xs text-muted-foreground flex items-center space-x-1">
                  <Wallet className="h-3 w-3" />
                  <span>{user.wallet_balance?.toFixed(2)}₹</span>
                </div>
              </div>
              
              {/* Navigation links */}
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isActive(path) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                </Link>
              ))}
              
              <Link to="/contests/create" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Contest
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

