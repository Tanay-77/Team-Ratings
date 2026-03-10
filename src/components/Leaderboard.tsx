import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team } from '../types/team';
import { api } from '../services/api';
import { Trophy, Users, Code, Search, X, Star, Medal, Award, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SearchBar from './SearchBar';
import StarRating from './StarRating';
import Footer from './Footer';

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
      <div className="min-h-screen bg-brand-gray flex items-center justify-center">
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
      <div className="min-h-screen bg-brand-gray flex items-center justify-center">
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
    <div className="min-h-screen bg-brand-gray py-12 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 text-brand-orange mb-6 shadow-sm border border-orange-100"
          >
            <Trophy className="w-8 h-8" />
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
            <div className="mb-4">
              <Search className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
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
            <div className="mb-4">
              <Users className="w-16 h-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Teams Yet</h3>
            <p className="text-gray-500">The leaderboard will light up when teams start joining</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
          <div className="space-y-12">
            {/* Top 3 Podium */}
            {filteredTeams.length > 0 && (
              <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-6 pt-8 pb-4">
                {[1, 0, 2].map((podiumIndex) => {
                  const team = filteredTeams[podiumIndex];
                  if (!team) return null;
                  
                  const rank = teams.findIndex(t => t.id === team.id) + 1;
                  const isFirst = podiumIndex === 0;
                  
                  return (
                    <motion.div
                      key={`podium-${team.id}`}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: podiumIndex * 0.1 }}
                      className={`glass-card bg-white relative w-full md:w-1/3 flex flex-col items-center p-6 sm:p-8 transition-all duration-300 hover:shadow-lg ${
                        user ? 'cursor-pointer hover:border-orange-200 hover:-translate-y-1' : ''
                      } ${isFirst ? 'md:-translate-y-16 md:scale-110 border-amber-200 shadow-md z-10' : 'border-gray-100 z-0'}`}
                      onClick={() => user && handleTeamClick(team)}
                    >
                      {/* Star Badge */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 transition-transform duration-300 hover:scale-110">
                        <div className="relative flex items-center justify-center">
                          <Star className={`w-12 h-12 fill-current ${
                            rank === 1 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
                            rank === 2 ? 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' :
                            'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'
                          }`} />
                          <span className="absolute text-white font-bold text-sm tracking-wider">{rank}</span>
                        </div>
                      </div>

                      {/* Team Logo */}
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white mb-4 mt-2 object-cover relative group">
                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
                            alt={`${team.teamName} logo`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                            <Users className="w-8 h-8 text-brand-orange" />
                          </div>
                        )}
                        <div className="absolute inset-0 shadow-inner rounded-full pointer-events-none"></div>
                      </div>

                      {/* Team Info */}
                      <div className="text-center w-full mb-4">
                        <h3 className={`font-bold text-gray-900 truncate mb-1 ${isFirst ? 'text-xl' : 'text-lg'}`}>
                          {team.teamName}
                        </h3>
                        <p className="text-gray-500 text-sm truncate flex items-center justify-center gap-1">
                          <Code className="w-3 h-3" />
                          {team.projectName}
                        </p>
                      </div>

                      {/* Points / Rating */}
                      <div className="mt-auto pt-2 border-t w-full border-gray-100/50">
                        <div className="flex items-center justify-center gap-2">
                           {/* Add a star icon next to the number */}
                           <Star className={`w-5 h-5 fill-current ${
                            rank === 1 ? 'text-amber-400' :
                            rank === 2 ? 'text-orange-500' :
                            'text-orange-400'
                           }`} />
                           <span className={`font-bold bg-clip-text text-transparent ${
                             rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-3xl' :
                             rank === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-700 text-2xl' :
                             'bg-gradient-to-br from-orange-400 to-orange-600 text-2xl'
                           }`}>
                             {team.averageRating > 0 ? (team.averageRating * 10).toFixed(0) : '0'}
                           </span>
                           <span className={`text-sm font-medium ${
                             rank === 1 ? 'text-amber-500/70' :
                             rank === 2 ? 'text-orange-600/70' :
                             'text-orange-500/70'
                           }`}>pts</span>
                        </div>
                        <div className="text-xs text-gray-400 text-center mt-1">Based on {team.averageRating > 0 ? team.averageRating.toFixed(1) : 'N/A'} average</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Remaining Teams List (Rank 4+) */}
            {filteredTeams.length > 3 && (
              <div className="space-y-4 pt-4">
                <h4 className="text-lg font-bold text-gray-800 mb-6 px-2 flex items-center">
                  <Medal className="w-5 h-5 mr-2 text-gray-400" /> 
                  Runner Ups
                </h4>
                {filteredTeams.slice(3).map((team, index) => {
                  const rank = teams.findIndex(t => t.id === team.id) + 1;
                  
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className={`glass-card bg-white transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative ${
                        user ? 'cursor-pointer hover:border-orange-200' : ''
                      }`}
                      onClick={() => user && handleTeamClick(team)}
                    >
                      <div className="flex items-center p-4 gap-4">
                        {/* Rank */}
                        <div className="w-10 text-center font-bold text-gray-400 text-lg">
                          #{rank}
                        </div>

                        {/* Team Logo */}
                        <div className="flex-shrink-0">
                          {team.logoUrl ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-white">
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
                            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm">
                              <Users className="w-6 h-6 text-brand-orange" />
                            </div>
                          )}
                        </div>

                        {/* Team Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {team.teamName}
                          </h3>
                          <p className="text-gray-500 truncate flex items-center text-sm">
                            <Code className="w-3 h-3 mr-1 text-gray-400" />
                            {team.projectName}
                          </p>
                        </div>
                        
                        {/* Rating Info */}
                        <div className="flex items-center gap-4">
                          <div className="text-center hidden sm:block">
                            <div className="text-sm font-bold text-gray-700">{team.totalRatings}</div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Ratings</div>
                          </div>
                          <div className="text-right">
                             <div className={`text-xl font-bold ${
                              team.averageRating >= 8 ? 'text-green-600' :
                              team.averageRating >= 6 ? 'text-blue-600' :
                              team.averageRating >= 4 ? 'text-yellow-600' :
                              team.averageRating > 0 ? 'text-red-500' :
                              'text-gray-400'
                            }`}>
                              {team.averageRating > 0 ? team.averageRating.toFixed(1) : 'N/A'}
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Average</div>
                          </div>
                          
                          {/* Rate Button */}
                          <div className="w-16 flex justify-end">
                            {user && team.ratedBy.includes(user.uid) ? (
                              <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-orange font-bold text-sm shadow-sm">
                                {getUserRating(team)}
                              </div>
                            ) : user ? (
                              <div 
                                className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-brand-orange hover:border-orange-200 transition-colors shadow-sm cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTeamClick(team);
                                }}
                              >
                                <Star className="w-4 h-4" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Leaderboard;