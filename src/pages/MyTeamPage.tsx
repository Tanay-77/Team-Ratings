import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Team } from '../types/team';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Trophy, Users, Code, Star, MessageSquare, Calendar, TrendingUp, Plus, ChevronDown } from 'lucide-react';

const MyTeamPage: React.FC = () => {
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMyTeams = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Get all teams (including pending ones) so users can see their own teams
        const teams = await api.getTeams();
        const userTeams = teams.filter(team => team.createdBy === user.uid);
        setMyTeams(userTeams);
        
        // Set the first team as selected by default
        if (userTeams.length > 0) {
          setSelectedTeam(userTeams[0]);
        }
      } catch (err) {
        setError('Failed to load team data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTeams();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTeamDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to view your team</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your team data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!myTeams || myTeams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Team Found</h2>
          <p className="text-gray-600 mb-6">You haven't created a team yet</p>
          <Link
            to="/create-team"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your Team
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedTeam) {
    return null; // This shouldn't happen if we have teams
  }

  // Get team rank (you'll need to implement this logic based on your requirements)
  const teamRank = 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Team Selector */}
        <div className="mb-8">
          {/* Team Selector Dropdown */}
          {myTeams.length > 1 && (
            <div className="mb-6">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  className="w-full md:w-auto flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {selectedTeam.teamName} ({myTeams.length} teams)
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showTeamDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showTeamDropdown && (
                  <div className="absolute top-full left-0 right-0 md:right-auto md:w-80 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                    <div className="py-1">
                      {myTeams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowTeamDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center transition-colors ${
                            selectedTeam.id === team.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                          }`}
                        >
                          {team.logoUrl ? (
                            <img
                              src={team.logoUrl}
                              alt={`${team.teamName} logo`}
                              className="w-8 h-8 rounded-lg border border-gray-200 mr-3 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-3 flex-shrink-0">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{team.teamName}</p>
                            <p className="text-sm text-gray-500 truncate">{team.projectName}</p>
                          </div>
                          {selectedTeam.id === team.id && (
                            <Star className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex items-start">
              {selectedTeam.logoUrl ? (
                <img
                  src={selectedTeam.logoUrl}
                  alt={`${selectedTeam.teamName} logo`}
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg mr-4 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-4 border-white shadow-lg mr-4 flex-shrink-0">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
              )}
              <div className="text-left min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{selectedTeam.teamName}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedTeam.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : selectedTeam.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedTeam.status === 'approved' && '✓ Approved'}
                    {selectedTeam.status === 'rejected' && '✗ Rejected'}
                    {selectedTeam.status === 'pending' && '⏳ Pending Review'}
                  </span>
                </div>
                <p className="text-base sm:text-lg text-gray-600 flex items-center mt-1 break-words">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  {selectedTeam.projectName}
                </p>
              </div>
            </div>
            <Link
              to="/create-team"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm whitespace-nowrap lg:ml-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Team
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{teamRank}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                              <div className="flex items-end">
              <span className="text-2xl font-bold text-gray-900 mr-1">
                {selectedTeam.averageRating > 0 ? selectedTeam.averageRating.toFixed(1) : 'N/A'}
              </span>
              <span className="text-sm text-gray-500 mb-0.5">/10</span>
            </div>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{selectedTeam.totalRatings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Suggestions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedTeam.suggestions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions and Feedback */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
            Suggestions & Feedback
          </h2>
          
          {selectedTeam.suggestions.length > 0 ? (
            <div className="space-y-4">
              {selectedTeam.suggestions.map((suggestion, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">Anonymous Feedback</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {suggestion.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700">{suggestion.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No suggestions or feedback yet</p>
              <p className="text-sm text-gray-400 mt-2">Feedback will appear here when users rate your team</p>
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Rating Distribution
          </h2>
          
          {selectedTeam.totalRatings > 0 ? (
            <div className="space-y-4">
              {/* Histogram */}
              <div className="relative">
                <div className="flex items-end justify-between h-48 sm:h-64 px-2 sm:px-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => {
                    const count = selectedTeam.ratings.filter(r => r === rating).length;
                    const maxCount = Math.max(...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => 
                      selectedTeam.ratings.filter(rt => rt === r).length
                    ));
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex-1 flex flex-col items-center group">
                        {/* Bar */}
                        <div className="w-full max-w-8 sm:max-w-12 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-md transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-600 relative"
                            style={{ 
                              height: `${Math.max(percentage, count > 0 ? 10 : 0)}%`,
                              minHeight: count > 0 ? '8px' : '0px'
                            }}
                          >
                            {/* Count label on top of bar */}
                            {count > 0 && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                <span className="text-xs font-medium text-gray-700 bg-white px-1 py-0.5 rounded shadow-sm">
                                  {count}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Rating label */}
                        <div className="mt-2 text-xs sm:text-sm font-medium text-gray-600">
                          {rating}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-axis label */}
                <div className="absolute left-0 top-0 h-full flex items-center">
                  <div className="transform -rotate-90 text-xs sm:text-sm text-gray-600 font-medium whitespace-nowrap">
                    Count
                  </div>
                </div>
              </div>
              
              {/* X-axis label */}
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Rating (1-10)</p>
              </div>
              
              {/* Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Most Common</p>
                  <p className="text-sm font-bold text-gray-900">
                    {(() => {
                      const counts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => ({
                        rating: r,
                        count: selectedTeam.ratings.filter(rt => rt === r).length
                      }));
                      const maxCount = Math.max(...counts.map(c => c.count));
                      const mostCommon = counts.find(c => c.count === maxCount);
                      return mostCommon && mostCommon.count > 0 ? `${mostCommon.rating}/10` : 'N/A';
                    })()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Ratings</p>
                  <p className="text-sm font-bold text-gray-900">{selectedTeam.totalRatings}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="text-sm font-bold text-gray-900">{selectedTeam.averageRating}/10</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Range</p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedTeam.ratings.length > 0 
                      ? `${Math.min(...selectedTeam.ratings)}-${Math.max(...selectedTeam.ratings)}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No ratings to display yet</p>
              <p className="text-sm text-gray-400 mt-2">Histogram will appear here when your team receives ratings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTeamPage;
