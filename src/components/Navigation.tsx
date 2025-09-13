import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Users, LogOut, User, Home } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Team Ratings</h1>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
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
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
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
            </div>
            
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
      </div>
    </nav>
  );
};

export default Navigation;