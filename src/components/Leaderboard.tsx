import React, { useState, useEffect } from 'react';
import { Team } from '../types/team';
import { api } from '../services/api';
import { Trophy, Medal, Award, Users, Code, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Leaderboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getLeaderboard();
        setTeams(data);
      } catch (err) {
        setError('Failed to load leaderboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Note:</span> You need to rate a team to see its detailed ratings
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Note:</span> Sign in and rate teams to see detailed ratings
            </p>
          )}
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No teams have been added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team, index) => {
              const rank = index + 1;
              return (
                <div
                  key={team.id}
                  className={`bg-white rounded-xl shadow-md p-6 border transition-all duration-300 hover:shadow-lg ${
                    rank <= 3 ? 'border-l-4 border-l-blue-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(rank)}`}>
                        {getRankIcon(rank)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Users className="w-4 h-4 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">{team.teamName}</h3>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4 text-gray-500" />
                          <p className="text-gray-600">{team.projectName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {user && team.ratedBy.includes(user.uid) ? (
                        <>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {team.averageRating > 0 ? team.averageRating.toFixed(1) : 'N/A'}
                            {team.averageRating > 0 && <span className="text-sm text-gray-500 ml-1">/10</span>}
                          </div>
                          <p className="text-sm text-gray-500">
                            {team.totalRatings} rating{team.totalRatings !== 1 ? 's' : ''}
                          </p>
                        </>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <Lock className="w-4 h-4 mr-2" />
                          <div>
                            <p className="text-sm">Rate this team</p>
                            <p className="text-xs">to see ratings</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;