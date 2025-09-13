import React, { useState } from 'react';
import { Team } from '../types/team';
import StarRating from './StarRating';
import { Users, Code } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  onRate: (teamId: string, rating: number, userId: string) => Promise<void>;
  userId: string;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onRate, userId }) => {
  const [isRating, setIsRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  
  // Check if user has already rated this team
  const hasRated = userId ? team.ratedBy.includes(userId) : false;
  const isUserAuthenticated = !!userId;

  const handleRate = async (rating: number) => {
    if (!isUserAuthenticated) {
      setRatingError("Please log in to rate teams");
      return;
    }
    
    try {
      setIsRating(true);
      setRatingError(null);
      await onRate(team.id, rating, userId);
    } catch (error) {
      console.error('Failed to rate team:', error);
      if (error instanceof Error) {
        setRatingError(error.message);
      } else {
        setRatingError('Failed to submit rating');
      }
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-200">
      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{team.teamName}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-gray-500" />
            <p className="text-gray-600 line-clamp-2">{team.projectName}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {hasRated ? 'You have already rated this team:' : 'Rate this team:'}
              </p>
              <StarRating
                currentRating={team.averageRating}
                onRate={handleRate}
                disabled={isRating || hasRated || !isUserAuthenticated}
                hideRating={!hasRated}
              />
              {ratingError && (
                <p className="text-red-500 text-sm mt-2">{ratingError}</p>
              )}
              {!isUserAuthenticated && !ratingError && (
                <p className="text-gray-500 text-sm mt-2">Log in to rate this team</p>
              )}
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              {hasRated ? (
                <>
                  <span>Average: {team.averageRating > 0 ? team.averageRating.toFixed(1) : 'N/A'}</span>
                  <span>{team.totalRatings} rating{team.totalRatings !== 1 ? 's' : ''}</span>
                </>
              ) : (
                <span className="italic">Rate this team to see its ratings</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCard;