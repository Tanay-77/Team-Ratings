import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team } from '../types/team';
import { api } from '../services/api';
import { Trophy, Users, Code, Search, X, Star, Crown, Medal, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SearchBar from './SearchBar';
import StarRating from './StarRating';

const Leaderboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [tempRating, setTempRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const { user } = useAuth();

  // Add custom animations for border effects
  const borderAnimationStyles = `
    @keyframes slideRight {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes slideDown {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    @keyframes slideLeft {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    @keyframes slideUp {
      0% { transform: translateY(100%); }
      100% { transform: translateY(-100%); }
    }
  `;

  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = borderAnimationStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const approvedTeams = await api.getApprovedTeams();
        // Sort by average rating (descending), then by total ratings (descending)
        const sortedTeams = approvedTeams.sort((a, b) => {
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.totalRatings - a.totalRatings;
        });
        setTeams(sortedTeams);
        setFilteredTeams(sortedTeams);
      } catch (err) {
        setError('Failed to load leaderboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Filter teams based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team =>
        team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [searchTerm, teams]);

  const handleRating = async (teamId: string, rating: number) => {
    if (!user) return;

    try {
      setIsSubmittingRating(true);
      const updatedTeam = await api.rateTeam(teamId, rating, user.uid, suggestion);
      
      // Update both teams and filteredTeams
      const updateTeamInList = (teamList: Team[]) =>
        teamList.map(team => team.id === teamId ? updatedTeam : team);
      
      setTeams(prev => updateTeamInList(prev));
      setFilteredTeams(prev => updateTeamInList(prev));
      
      // Close modal and reset form
      setShowRatingModal(false);
      setSelectedTeam(null);
      setSuggestion('');
      setTempRating(0);
    } catch (err) {
      console.error('Failed to rate team:', err);
      setError('Failed to rate team. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleTeamClick = (team: Team) => {
    if (!user) return;
    setSelectedTeam(team);
    setTempRating(getUserRating(team)); // Initialize with current rating
    setSuggestion(getUserSuggestion(team)); // Initialize with current suggestion
    setShowRatingModal(true);
  };

  const getUserRating = (team: Team): number => {
    if (!user) return 0;
    
    // Find user's rating index
    const userIndex = team.ratedBy.findIndex(userId => userId === user.uid);
    return userIndex !== -1 ? team.ratings[userIndex] : 0;
  };

  const getUserSuggestion = (team: Team): string => {
    if (!user) return '';
    
    // Find user's existing suggestion
    const userSuggestion = team.suggestions.find(s => s.userId === user.uid);
    return userSuggestion ? userSuggestion.suggestion : '';
  };

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
            <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Leaderboard</h2>
          <p className="text-gray-600">Fetching the top teams...</p>
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
            <Trophy className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Leaderboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="btn-stripe px-6 py-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Refresh Page
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 opacity-20 blur-3xl"
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white mb-6 shadow-xl"
          >
            <Crown className="w-10 h-10" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-4"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100/50 backdrop-blur-sm border border-amber-200/30 shadow-sm mb-4">
              <Sparkles className="w-4 h-4 text-amber-600 mr-2" />
              <span className="text-sm font-medium text-amber-800">Hall of Fame</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Leaderboard
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg text-gray-600 mb-6"
          >
            Teams ranked by average rating and community love
          </motion.p>

          {user ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-sm text-blue-600 bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl px-4 py-2 inline-block"
            >
              <Award className="w-4 h-4 inline mr-2" />
              Click on any team to rate it and share feedback
            </motion.p>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-sm text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 rounded-xl px-4 py-2 inline-block"
            >
              <Trophy className="w-4 h-4 inline mr-2" />
              Sign in to rate teams and join the competition
            </motion.p>
          )}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-8"
        >
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </motion.div>

        {filteredTeams.length === 0 && searchTerm ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="glass-card p-12 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h3>
            <p className="text-gray-500">No teams found matching <span className="font-semibold">"{searchTerm}"</span></p>
            <motion.button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear search
            </motion.button>
          </motion.div>
        ) : filteredTeams.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="glass-card p-12 text-center"
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Teams Yet</h3>
            <p className="text-gray-500">The leaderboard will light up when teams start joining</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredTeams.map((team, index) => {
              const rank = teams.findIndex(t => t.id === team.id) + 1; // Use original rank from full list
              
              const getRankIcon = (rank: number) => {
                if (rank === 1) return Crown;
                if (rank === 2) return Medal;
                if (rank === 3) return Award;
                return null; // No icon for rank 4 and onwards
              };

              const RankIcon = getRankIcon(rank);
              
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                  className={`glass-card transition-all duration-300 hover:bg-white/50 hover:shadow-xl hover:-translate-y-2 relative ${
                    rank === 1 ? 'border-2 border-amber-400/70 bg-gradient-to-br from-amber-50/80 to-yellow-50/80' :
                    rank === 2 ? 'border-2 border-gray-400/70 bg-gradient-to-br from-gray-50/80 to-slate-50/80' :
                    rank === 3 ? 'border-2 border-amber-300/70 bg-gradient-to-br from-amber-50/60 to-orange-50/60' :
                    'border-2 border-gray-300/60'
                  } ${user ? 'cursor-pointer' : ''}`}
                  onClick={() => user && handleTeamClick(team)}
                  whileHover={user ? { scale: 1.01 } : undefined}
                  whileTap={user ? { scale: 0.99 } : undefined}
                >
                  {/* Rank Badge - Outside overflow container */}
                  <motion.div 
                    className={`absolute -top-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg z-10 ${
                      rank === 1 ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white' :
                      rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white' :
                      rank === 3 ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
                      'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.4, delay: 1.8 + index * 0.1 }}
                  >
                    <span className="font-bold text-sm">#{rank}</span>
                  </motion.div>

                  {/* Inner container with animated borders */}
                  <div className={`${rank <= 3 ? 'overflow-hidden' : ''} relative w-full h-full`}>
                    {/* Animated Border Lines for Top 3 Ranks */}
                    {rank <= 3 && (
                      <>
                        <span className={`absolute top-0 right-0 w-full h-1 ${
                          rank === 1 ? 'bg-gradient-to-r from-transparent to-amber-400' :
                          rank === 2 ? 'bg-gradient-to-r from-transparent to-gray-400' :
                          'bg-gradient-to-r from-transparent to-orange-400'
                        } animate-[slideRight_2s_linear_infinite]`}></span>
                        
                        <span className={`absolute top-0 right-0 h-full w-1 ${
                          rank === 1 ? 'bg-gradient-to-b from-transparent to-amber-400' :
                          rank === 2 ? 'bg-gradient-to-b from-transparent to-gray-400' :
                          'bg-gradient-to-b from-transparent to-orange-400'
                        } animate-[slideDown_2s_linear_infinite_1s]`}></span>
                        
                        <span className={`absolute bottom-0 right-0 w-full h-1 ${
                          rank === 1 ? 'bg-gradient-to-l from-transparent to-amber-400' :
                          rank === 2 ? 'bg-gradient-to-l from-transparent to-gray-400' :
                          'bg-gradient-to-l from-transparent to-orange-400'
                        } animate-[slideLeft_2s_linear_infinite]`}></span>
                        
                        <span className={`absolute top-0 left-0 h-full w-1 ${
                          rank === 1 ? 'bg-gradient-to-t from-transparent to-amber-400' :
                          rank === 2 ? 'bg-gradient-to-t from-transparent to-gray-400' :
                          'bg-gradient-to-t from-transparent to-orange-400'
                        } animate-[slideUp_2s_linear_infinite_1s]`}></span>
                      </>
                    )}
                  
                    <div className="p-3">
                      {/* Team Logo and Info Section */}
                    <div className="flex items-center gap-3 mb-2">
                      {/* Team Logo */}
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 1.9 + index * 0.1 }}
                        className="flex-shrink-0"
                      >
                        {team.logoUrl ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                            <img
                              src={team.logoUrl}
                              alt={`${team.teamName} logo`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white shadow-md">
                            <Users className="w-7 h-7 text-blue-600" />
                          </div>
                        )}
                      </motion.div>

                      {/* Team Info */}
                      <div className="flex-1 min-w-0">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 2 + index * 0.1 }}
                          className="flex items-center gap-2 mb-1"
                        >
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {team.teamName}
                          </h3>
                          {RankIcon && (
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              <RankIcon className={`w-4 h-4 ${
                                rank === 1 ? 'text-amber-500' :
                                rank === 2 ? 'text-gray-500' :
                                rank === 3 ? 'text-amber-600' :
                                'text-blue-500'
                              }`} />
                            </motion.div>
                          )}
                        </motion.div>
                        
                        <motion.p 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 2.1 + index * 0.1 }}
                          className="text-gray-600 truncate flex items-center text-sm"
                        >
                          <Code className="w-3 h-3 mr-1 text-gray-400" />
                          {team.projectName}
                        </motion.p>
                      </div>
                    </div>

                    {/* Rating Info - Now covers full width */}
                    <div className="w-full">
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 2.2 + index * 0.1 }}
                        className="flex flex-wrap sm:grid sm:grid-cols-3 gap-2 sm:gap-3"
                      >
                        {/* Average Rating */}
                        <div className="flex-1 min-w-[70px] text-center p-2 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200/30">
                          <div className={`text-lg font-bold ${
                            team.averageRating >= 8 ? 'text-green-600' :
                            team.averageRating >= 6 ? 'text-blue-600' :
                            team.averageRating >= 4 ? 'text-yellow-600' :
                            team.averageRating > 0 ? 'text-red-500' :
                            'text-gray-400'
                          }`}>
                            {team.averageRating > 0 ? team.averageRating.toFixed(1) : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">Average</div>
                        </div>
                        
                        {/* Total Ratings */}
                        <div className="flex-1 min-w-[50px] text-center p-2 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200/30">
                          <div className="text-lg font-bold text-gray-700">
                            {team.totalRatings}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">Ratings</div>
                        </div>

                        {/* User Rating / Rate Now Button */}
                        {user && team.ratedBy.includes(user.uid) ? (
                          <div className="flex-1 min-w-[70px] text-center p-2 bg-blue-50/70 backdrop-blur-sm rounded-lg border border-blue-200/50">
                            <div className="text-lg font-bold text-blue-700">{getUserRating(team)}</div>
                            <div className="text-xs text-blue-600 font-medium">Your Rating</div>
                          </div>
                        ) : user ? (
                          <motion.div 
                            className="flex-1 min-w-[70px] text-center p-2 bg-gradient-to-r from-purple-50 to-pink-50 backdrop-blur-sm rounded-lg border border-purple-200/50 cursor-pointer"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTeamClick(team)}
                          >
                            <div className="text-sm font-bold text-purple-600">Rate Now</div>
                            <div className="text-xs text-purple-500">Click here</div>
                          </motion.div>
                        ) : (
                          <div className="flex-1 min-w-[70px] text-center p-2 bg-gray-50/70 backdrop-blur-sm rounded-lg border border-gray-200/30">
                            <div className="text-sm text-gray-400 font-medium">Sign In</div>
                            <div className="text-xs text-gray-400">to Rate</div>
                          </div>
                        )}
                      </motion.div>
                    </div> {/* Close w-full container */}
                    </div> {/* Close p-3 container */}
                  </div> {/* Close inner container */}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && selectedTeam && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowRatingModal(false);
                setSelectedTeam(null);
                setSuggestion('');
                setTempRating(0);
              }
            }}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {/* Team Logo in Modal */}
                    {selectedTeam.logoUrl && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0"
                      >
                        <img
                          src={selectedTeam.logoUrl}
                          alt={`${selectedTeam.teamName} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </motion.div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <motion.h3 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-2xl font-bold text-gray-900 truncate"
                      >
                        {selectedTeam.teamName}
                      </motion.h3>
                      <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="text-gray-600 truncate flex items-center"
                      >
                        <Code className="w-4 h-4 mr-2" />
                        {selectedTeam.projectName}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    onClick={() => {
                      setShowRatingModal(false);
                      setSelectedTeam(null);
                      setSuggestion('');
                      setTempRating(0);
                    }}
                    className="p-2 hover:bg-gray-100/50 rounded-2xl transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </motion.button>
                </div>

                <div className="space-y-6">
                  {/* Current Rating Display */}
                  {user && selectedTeam.ratedBy.includes(user.uid) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50"
                    >
                      <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Current Ratings
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl">
                          <p className="text-2xl font-bold text-blue-900">
                            {selectedTeam.averageRating.toFixed(1)}/10
                          </p>
                          <p className="text-sm text-blue-600">Team Average</p>
                        </div>
                        <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl">
                          <p className="text-2xl font-bold text-blue-900">
                            {getUserRating(selectedTeam)}/10
                          </p>
                          <p className="text-sm text-blue-600">Your Rating</p>
                        </div>
                      </div>
                      <p className="text-sm text-blue-600 mt-3 text-center">
                        {selectedTeam.totalRatings} {selectedTeam.totalRatings === 1 ? 'person has' : 'people have'} rated this team
                      </p>
                    </motion.div>
                  )}

                  {/* Rating Interface */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-amber-500" />
                      {user && selectedTeam.ratedBy.includes(user.uid) ? 'Update Your Rating' : 'Rate This Team'}
                    </h4>
                    <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/30">
                      <StarRating
                        currentRating={tempRating}
                        onRate={setTempRating}
                        disabled={isSubmittingRating}
                        hideRating={false}
                      />
                    </div>
                  </motion.div>

                  {/* Suggestion Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <label htmlFor="suggestion" className="block text-sm font-bold text-gray-700 mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                      Suggestions and Feedback <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                    </label>
                    <motion.textarea
                      id="suggestion"
                      rows={4}
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      placeholder="Share your thoughts, suggestions, or feedback to help this team improve..."
                      className="w-full px-4 py-3 border-2 border-gray-200/50 rounded-2xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none text-gray-700 placeholder-gray-500"
                      disabled={isSubmittingRating}
                      whileFocus={{ scale: 1.01 }}
                    />
                  </motion.div>

                  {/* Submit Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex justify-end space-x-3 pt-4"
                  >
                    <motion.button
                      onClick={() => {
                        setShowRatingModal(false);
                        setSelectedTeam(null);
                        setSuggestion('');
                        setTempRating(0);
                      }}
                      disabled={isSubmittingRating}
                      className="px-6 py-3 text-gray-700 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-xl font-semibold hover:bg-white hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={() => handleRating(selectedTeam.id, tempRating)}
                      disabled={isSubmittingRating || tempRating === 0}
                      className="btn-stripe px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={!isSubmittingRating && tempRating !== 0 ? { scale: 1.02 } : undefined}
                      whileTap={!isSubmittingRating && tempRating !== 0 ? { scale: 0.98 } : undefined}
                    >
                      {isSubmittingRating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          {user && selectedTeam.ratedBy.includes(user.uid) ? 'Update Rating' : 'Submit Rating'}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;