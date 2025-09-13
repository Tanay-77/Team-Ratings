import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, LogOut, User, Home, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Team Ratings</h1>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3 mr-4">
                <div className="flex items-center space-x-2">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 
                text-gray-600 hover:text-gray-900 hover:bg-gray-100
              `}
            >
              <Home className="inline-block w-4 h-4 mr-2" />
              Home
            </Link>
            <Link
              to="/teams"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/teams'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              Teams
            </Link>
            <Link
              to="/leaderboard"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === '/leaderboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Trophy className="inline-block w-4 h-4 mr-2" />
              Leaderboard
            </Link>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-2 pb-3 space-y-1 border-t border-gray-200">
            {user && (
              <div className="flex items-center justify-between px-2 py-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="inline-block w-5 h-5 mr-2" />
              Home
            </Link>
            <Link
              to="/teams"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/teams'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users className="inline-block w-5 h-5 mr-2" />
              Teams
            </Link>
            <Link
              to="/leaderboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/leaderboard'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Trophy className="inline-block w-5 h-5 mr-2" />
              Leaderboard
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;