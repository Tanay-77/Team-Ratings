import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Team } from '../types/team';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Trophy, Users, Code, Star, MessageSquare, Calendar, TrendingUp, Plus, ChevronDown, Sparkles, BarChart3 } from 'lucide-react';
import Footer from '../components/Footer';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 glass-card p-12 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to view your team dashboard</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 glass-card p-12 text-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Fetching your team data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 text-center max-w-md"
        >
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <MessageSquare className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something Went Wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="btn-stripe px-6 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!myTeams || myTeams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-green-400 to-blue-400 opacity-20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10 max-w-lg mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="glass-card p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Welcome to Your Dashboard
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-gray-600 mb-8"
            >
              You haven't created a team yet. Start by creating your first team to showcase your amazing work!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link
                to="/create-team"
                className="btn-stripe text-lg px-8 py-4 inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your Team
              </Link>
            </motion.div>
          </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Team Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          {/* Team Selector Dropdown */}
          {myTeams.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setShowTeamDropdown(!showTeamDropdown)}
                  className="w-full md:w-auto glass-card px-6 py-4 flex items-center justify-between hover:bg-white/40 transition-all duration-200"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100/50 backdrop-blur-sm border border-blue-200/30 shadow-sm mr-3">
                      <Sparkles className="w-3 h-3 text-blue-600 mr-1" />
                      <span className="text-xs font-medium text-blue-800">Team Selector</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {selectedTeam.teamName} ({myTeams.length} teams)
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: showTeamDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </motion.button>
                
                {showTeamDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 md:right-auto md:w-80 mt-2 glass-card shadow-xl z-20 overflow-hidden"
                  >
                    <div className="py-2">
                      {myTeams.map((team, index) => (
                        <motion.button
                          key={team.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowTeamDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-white/50 flex items-center transition-all duration-200 ${
                            selectedTeam.id === team.id ? 'bg-blue-50/80 text-blue-700 border-l-4 border-blue-500' : 'text-gray-900'
                          }`}
                          whileHover={{ x: 4 }}
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
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Star className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6"
          >
            <div className="flex items-start">
              {selectedTeam.logoUrl ? (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  src={selectedTeam.logoUrl}
                  alt={`${selectedTeam.teamName} logo`}
                  className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg mr-4 flex-shrink-0"
                />
              ) : (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-4 border-white shadow-lg mr-4 flex-shrink-0"
                >
                  <Users className="w-10 h-10 text-blue-600" />
                </motion.div>
              )}
              <div className="text-left min-w-0 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center gap-3 flex-wrap"
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{selectedTeam.teamName}</h1>
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedTeam.status === 'approved' 
                        ? 'bg-green-100/80 text-green-700 border border-green-200/50' 
                        : selectedTeam.status === 'rejected'
                        ? 'bg-red-100/80 text-red-700 border border-red-200/50'
                        : 'bg-yellow-100/80 text-yellow-700 border border-yellow-200/50'
                    }`}
                  >
                    {selectedTeam.status === 'approved' && '✓ Approved'}
                    {selectedTeam.status === 'rejected' && '✗ Rejected'}
                    {selectedTeam.status === 'pending' && '⏳ Pending Review'}
                  </motion.span>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-base sm:text-lg text-gray-600 flex items-center mt-1 break-words"
                >
                  <Code className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  {selectedTeam.projectName}
                </motion.p>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <Link
                to="/create-team"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm whitespace-nowrap lg:ml-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Team
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6 hover:bg-white/40 transition-all duration-200"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 shadow-sm"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Trophy className="w-6 h-6 text-amber-600" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Rank</p>
                <p className="text-2xl font-bold text-gray-900">#{teamRank}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-card p-6 hover:bg-white/40 transition-all duration-200"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 shadow-sm"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Star className="w-6 h-6 text-blue-600" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Average Rating</p>
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-gray-900 mr-1">
                    {selectedTeam.averageRating > 0 ? selectedTeam.averageRating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500 mb-0.5">/10</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="glass-card p-6 hover:bg-white/40 transition-all duration-200"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 shadow-sm"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="w-6 h-6 text-green-600" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900">{selectedTeam.totalRatings}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="glass-card p-6 hover:bg-white/40 transition-all duration-200"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center">
              <motion.div 
                className="p-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 shadow-sm"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Suggestions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedTeam.suggestions.length}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Suggestions and Feedback */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-card p-6 mb-8"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-xl font-bold text-gray-900 mb-6 flex items-center"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
            </motion.div>
            Suggestions & Feedback
          </motion.h2>
          
          {selectedTeam.suggestions.length > 0 ? (
            <div className="space-y-4">
              {selectedTeam.suggestions.map((suggestion, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="border border-gray-200/50 rounded-2xl p-6 bg-white/30 backdrop-blur-sm hover:bg-white/50 transition-all duration-200"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </motion.div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">Anonymous Feedback</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {suggestion.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30">
                    <p className="text-gray-700 leading-relaxed">{suggestion.suggestion}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-500 font-medium">No suggestions or feedback yet</p>
              <p className="text-sm text-gray-400 mt-2">Feedback will appear here when users rate your team</p>
            </motion.div>
          )}
        </motion.div>

        {/* Rating Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="glass-card p-4 sm:p-6"
        >
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-xl font-bold text-gray-900 mb-6 flex items-center"
          >
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            </motion.div>
            Rating Distribution
          </motion.h2>
          
          {selectedTeam.totalRatings > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="space-y-6"
            >
              {/* Histogram */}
              <div className="relative bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30">
                <div className="flex items-end justify-between h-48 sm:h-64 px-2 sm:px-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating, index) => {
                    const count = selectedTeam.ratings.filter(r => r === rating).length;
                    const maxCount = Math.max(...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => 
                      selectedTeam.ratings.filter(rt => rt === r).length
                    ));
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <motion.div 
                        key={rating} 
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                        className="flex-1 flex flex-col items-center group"
                      >
                        {/* Bar */}
                        <div className="w-full max-w-8 sm:max-w-12 flex flex-col items-center">
                          <motion.div
                            className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-xl transition-all duration-300 group-hover:from-blue-700 group-hover:to-blue-600 relative shadow-lg"
                            style={{ 
                              height: `${Math.max(percentage, count > 0 ? 10 : 0)}%`,
                              minHeight: count > 0 ? '12px' : '0px'
                            }}
                            whileHover={{ 
                              scale: 1.05,
                              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
                            }}
                          >
                            {/* Count label on top of bar */}
                            {count > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 1.4 + index * 0.1 }}
                                className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                              >
                                <span className="text-xs font-bold text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm border border-blue-200/50">
                                  {count}
                                </span>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                        
                        {/* Rating label */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 1.5 + index * 0.1 }}
                          className="mt-3 text-xs sm:text-sm font-semibold text-gray-600"
                        >
                          {rating}
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Y-axis label */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 2 }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                >
                  <div className="transform -rotate-90 text-xs sm:text-sm text-gray-600 font-semibold whitespace-nowrap">
                    Count
                  </div>
                </motion.div>
              </div>
              
              {/* X-axis label */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 2.2 }}
                className="text-center"
              >
                <p className="text-xs sm:text-sm text-gray-600 font-semibold">Rating (1-10)</p>
              </motion.div>
              
              {/* Statistics */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200/50"
              >
                <motion.div 
                  className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-gray-200/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Most Common</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
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
                </motion.div>
                <motion.div 
                  className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-gray-200/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Ratings</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{selectedTeam.totalRatings}</p>
                </motion.div>
                <motion.div 
                  className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-gray-200/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Average</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{selectedTeam.averageRating}/10</p>
                </motion.div>
                <motion.div 
                  className="text-center p-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-gray-200/30"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Range</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {selectedTeam.ratings.length > 0 
                      ? `${Math.min(...selectedTeam.ratings)}-${Math.max(...selectedTeam.ratings)}`
                      : 'N/A'
                    }
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-center py-16 bg-gradient-to-r from-gray-50/50 to-blue-50/30 backdrop-blur-sm rounded-2xl border border-gray-200/30"
            >
              <motion.div
                animate={{ 
                  y: [-10, 10, -10],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No ratings to display yet</h3>
              <p className="text-sm text-gray-500">Your beautiful histogram will appear here when your team receives ratings</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MyTeamPage;
