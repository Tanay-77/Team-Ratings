import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, LogOut, User, Home, Menu, X, Plus, Shield, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { isAdmin } from '../utils/admin';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/20' 
        : 'bg-white/70 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
              Rate My Team
            </span>
          </Link>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <motion.button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 backdrop-blur-sm transition-all duration-200"
              aria-label="Toggle mobile menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {user && (
              <div className="flex items-center space-x-3 mr-6">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-gray-50/50 backdrop-blur-sm">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                  title="Sign out"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            )}
            
            <NavLink
              to="/"
              icon={Home}
              label="Home"
              isActive={location.pathname === '/'}
            />
            <NavLink
              to="/create-team"
              icon={Plus}
              label="Create Team"
              isActive={location.pathname === '/create-team'}
              variant="success"
            />
            <NavLink
              to="/my-team"
              icon={Users}
              label="My Team"
              isActive={location.pathname === '/my-team'}
            />
            {user && isAdmin(user.email) && (
              <NavLink
                to="/admin"
                icon={Shield}
                label="Admin"
                isActive={location.pathname === '/admin'}
                variant="danger"
              />
            )}
            <NavLink
              to="/leaderboard"
              icon={Trophy}
              label="Leaderboard"
              isActive={location.pathname === '/leaderboard'}
              variant="primary"
            />
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/20"
            >
              <div className="px-4 py-6 space-y-3">
                {user && (
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-200/50 mb-4">
                    <div className="flex items-center space-x-3">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <span className="font-medium text-gray-800">
                        {user.displayName || user.email}
                      </span>
                    </div>
                    <motion.button
                      onClick={handleLogout}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Sign out"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
                
                <MobileNavLink
                  to="/"
                  icon={Home}
                  label="Home"
                  isActive={location.pathname === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <MobileNavLink
                  to="/create-team"
                  icon={Plus}
                  label="Create Team"
                  isActive={location.pathname === '/create-team'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="success"
                />
                <MobileNavLink
                  to="/my-team"
                  icon={Users}
                  label="My Team"
                  isActive={location.pathname === '/my-team'}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                {user && isAdmin(user.email) && (
                  <MobileNavLink
                    to="/admin"
                    icon={Shield}
                    label="Admin"
                    isActive={location.pathname === '/admin'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="danger"
                  />
                )}
                <MobileNavLink
                  to="/leaderboard"
                  icon={Trophy}
                  label="Leaderboard"
                  isActive={location.pathname === '/leaderboard'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

// Desktop Navigation Link Component
interface NavLinkProps {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
  isActive: boolean;
  variant?: 'primary' | 'success' | 'danger';
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, label, isActive, variant = 'default' }) => {
  const getVariantStyles = () => {
    if (isActive) {
      switch (variant) {
        case 'primary':
          return 'bg-blue-100/80 text-blue-700 border-blue-200/50';
        case 'success':
          return 'bg-green-100/80 text-green-700 border-green-200/50';
        case 'danger':
          return 'bg-red-100/80 text-red-700 border-red-200/50';
        default:
          return 'bg-gray-100/80 text-gray-700 border-gray-200/50';
      }
    }
    return 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50 border-transparent';
  };

  return (
    <Link to={to}>
      <motion.div
        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border backdrop-blur-sm flex items-center space-x-2 ${getVariantStyles()}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </motion.div>
    </Link>
  );
};

// Mobile Navigation Link Component
interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, icon: Icon, label, isActive, variant = 'default', onClick }) => {
  const getVariantStyles = () => {
    if (isActive) {
      switch (variant) {
        case 'primary':
          return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'success':
          return 'bg-green-50 text-green-700 border-green-200';
        case 'danger':
          return 'bg-red-50 text-red-700 border-red-200';
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    }
    return 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-transparent';
  };

  return (
    <Link to={to} onClick={onClick}>
      <motion.div
        className={`p-4 rounded-xl font-medium transition-all duration-200 border flex items-center space-x-3 ${getVariantStyles()}`}
        whileHover={{ scale: 1.01, x: 5 }}
        whileTap={{ scale: 0.99 }}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </motion.div>
    </Link>
  );
};

export default Navigation;