import { useState, useEffect } from 'react';
import { Team } from '../types/team';
import { api } from '../services/api';

// Connection status hook
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await api.getTeams();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError('Failed to load teams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTeam = async (teamData: { teamName: string; projectName: string }, userId: string) => {
    try {
      // Check for duplicates on client side first (faster)
      const existingTeam = teams.find(team => 
        team.teamName.toLowerCase() === teamData.teamName.toLowerCase()
      );
      
      if (existingTeam) {
        throw new Error('Team name already exists');
      }

      const newTeam = await api.addTeam(teamData, userId);
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      setError('Failed to add team');
      throw err;
    }
  };

  const rateTeam = async (teamId: string, rating: number, userId: string) => {
    try {
      const updatedTeam = await api.rateTeam(teamId, rating, userId);
      setTeams(prev => prev.map(team => 
        team.id === teamId ? updatedTeam : team
      ));
    } catch (err) {
      setError('Failed to submit rating');
      throw err;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    addTeam,
    rateTeam,
  };
};