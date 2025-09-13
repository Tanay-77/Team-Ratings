import React, { useState, useMemo } from 'react';
import { useTeams, useConnectionStatus } from '../hooks/useTeams';
import SearchBar from '../components/SearchBar';
import AddTeamForm from '../components/AddTeamForm';
import TeamCard from '../components/TeamCard';
import { useAuth } from '../hooks/useAuth';
import { Users, Loader2, Wifi, WifiOff } from 'lucide-react';

const TeamsPage: React.FC = () => {
  const { teams, loading, error, addTeam, rateTeam } = useTeams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const isOnline = useConnectionStatus();

  const filteredTeams = useMemo(() => {
    if (!searchTerm) return teams;
    
    const term = searchTerm.toLowerCase();
    return teams.filter(team => 
      team.teamName.toLowerCase().includes(term) ||
      team.projectName.toLowerCase().includes(term)
    );
  }, [teams, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-red-500 text-sm mt-2">Please make sure the backend server is running.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Connection Status Indicator */}
        {!isOnline && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center">
            <WifiOff className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800 text-sm">
              You're offline. Some features may not work properly.
            </span>
          </div>
        )}
        
        <div className="text-center mb-8">
          <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Ratings</h1>
          <p className="text-gray-600">Rate and discover amazing projects from talented teams</p>
        </div>

        <AddTeamForm onAddTeam={async (team, userId) => {
          await addTeam(team, userId);
        }} />
        
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {teams.length === 0 ? 'No teams added yet' : 'No teams match your search'}
            </p>
            <p className="text-gray-400">
              {teams.length === 0 ? 'Add the first team to get started!' : 'Try adjusting your search terms'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onRate={rateTeam}
                userId={user ? user.uid : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;