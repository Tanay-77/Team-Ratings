import React, { useState, useEffect } from 'react';
import { Team } from '../types/team';
import { api } from '../services/api';
import { Trophy, Users, Code, Search, X } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading leaderboard...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Teams ranked by average rating</p>
          {user ? (
            <p className="text-sm text-gray-500 mt-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Tip:</span> Click on any team to rate it
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Note:</span> Sign in to rate teams
            </p>
          )}
        </div>

        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {filteredTeams.length === 0 && searchTerm ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No teams found matching "{searchTerm}"</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No teams have been added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team) => {
              const rank = teams.findIndex(t => t.id === team.id) + 1; // Use original rank from full list
              
              return (
                <div
                  key={team.id}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md hover:border-gray-200 ${
                    rank === 1 ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50' :
                    rank === 2 ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50' :
                    rank === 3 ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50' :
                    'border-gray-100'
                  } ${user ? 'cursor-pointer' : ''}`}
                  onClick={() => user && handleTeamClick(team)}
                >
                  <div className="px-5 py-5">
                    {/* Main content area */}
                    <div className="flex items-start space-x-3">
                      {/* Team Logo */}
                      <div className="flex-shrink-0 -mt-1 -ml-1">
                        {team.logoUrl ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50">
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
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-200">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                      </div>

                      {/* Team Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                          {team.teamName}
                        </h3>
                        <p className="text-sm text-gray-600 truncate mb-3 flex items-center">
                          <Code className="w-4 h-4 mr-1.5 text-gray-400" />
                          {team.projectName}
                        </p>
                        
                        {/* Rating Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center justify-between flex-1 -ml-14">
                            {/* Team Ranking */}
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                rank === 1 ? 'text-amber-500' : 
                                rank === 2 ? 'text-gray-500' : 
                                rank === 3 ? 'text-amber-600' : 
                                'text-gray-900'
                              }`}>
                                #{rank}
                              </div>
                              <div className="text-xs text-gray-500">Rank</div>
                            </div>
                            
                            {/* Average Rating */}
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${
                                team.averageRating >= 8 ? 'text-green-600' :
                                team.averageRating >= 6 ? 'text-blue-600' :
                                team.averageRating >= 4 ? 'text-yellow-600' :
                                team.averageRating > 0 ? 'text-red-500' :
                                'text-gray-400'
                              }`}>
                                {team.averageRating > 0 ? team.averageRating.toFixed(1) : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">Average</div>
                            </div>
                            
                            {/* Total Ratings */}
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-700">
                                {team.totalRatings}
                              </div>
                              <div className="text-xs text-gray-500">Ratings</div>
                            </div>

                            {/* User Rating */}
                            {user && team.ratedBy.includes(user.uid) ? (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-700">{getUserRating(team)}/10</div>
                                <div className="text-xs text-blue-500 font-medium">Your Rating</div>
                              </div>
                            ) : user ? (
                              <div className="text-center">
                                <div className="text-sm text-gray-500 font-medium">Tap to</div>
                                <div className="text-xs text-gray-500">rate</div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="text-sm text-gray-400">Sign in</div>
                                <div className="text-xs text-gray-400">to rate</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {/* Team Logo in Modal */}
                  {selectedTeam.logoUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                      <img
                        src={selectedTeam.logoUrl}
                        alt={`${selectedTeam.teamName} logo`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide logo if it fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate">{selectedTeam.teamName}</h3>
                    <p className="text-gray-600 truncate">{selectedTeam.projectName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedTeam(null);
                    setSuggestion('');
                    setTempRating(0);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Current Rating Display */}
                {user && selectedTeam.ratedBy.includes(user.uid) && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700 mb-2">Current Ratings:</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-blue-900">
                          Average: {selectedTeam.averageRating.toFixed(1)}/10
                        </p>
                        <p className="text-sm text-blue-600">
                          {selectedTeam.totalRatings} {selectedTeam.totalRatings === 1 ? 'person' : 'people'} rated this
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">Your rating:</p>
                        <p className="text-xl font-bold text-blue-900">
                          {getUserRating(selectedTeam)}/10
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Interface */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {user && selectedTeam.ratedBy.includes(user.uid) ? 'Update Your Rating' : 'Rate This Team'}
                  </h4>
                  <StarRating
                    currentRating={tempRating}
                    onRate={setTempRating}
                    disabled={isSubmittingRating}
                    hideRating={false}
                  />
                </div>

                {/* Suggestion Input */}
                <div>
                  <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700 mb-2">
                    Suggestions and Feedbacks (Optional)
                  </label>
                  <textarea
                    id="suggestion"
                    rows={3}
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    placeholder="Share your thoughts or suggestions for improvement..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isSubmittingRating}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRatingModal(false);
                      setSelectedTeam(null);
                      setSuggestion('');
                      setTempRating(0);
                    }}
                    disabled={isSubmittingRating}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRating(selectedTeam.id, tempRating)}
                    disabled={isSubmittingRating || tempRating === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingRating ? 'Submitting...' : 
                     (user && selectedTeam.ratedBy.includes(user.uid) ? 'Update Rating' : 'Submit Rating')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;