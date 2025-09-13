import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  query, 
  orderBy,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Team, NewTeam } from '../types/team';

const TEAMS_COLLECTION = 'teams';

const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

// Retry logic for Firebase operations
const retryOperation = async <T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  delay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Firebase operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max retries exceeded');
};

export const api = {
  async getTeams(): Promise<Team[]> {
    return retryOperation(async () => {
      console.log('Fetching teams from Firestore...');
      const teamsCollection = collection(db, TEAMS_COLLECTION);
      const teamsSnapshot = await getDocs(teamsCollection);
      
      console.log(`Found ${teamsSnapshot.size} teams in Firestore`);
      
      const teams: Team[] = teamsSnapshot.docs.map(doc => {
        const data = doc.data();
        const ratings = data.ratings || [];
        const ratedBy = data.ratedBy || [];
        const suggestions = data.suggestions || [];
        console.log('Team data:', { id: doc.id, teamName: data.teamName, projectName: data.projectName });
        return {
          id: doc.id,
          teamName: data.teamName,
          projectName: data.projectName,
          logoUrl: data.logoUrl,
          ratings,
          ratedBy,
          suggestions: suggestions.map((s: any) => ({
            ...s,
            timestamp: s.timestamp?.toDate() || new Date()
          })),
          averageRating: calculateAverageRating(ratings),
          totalRatings: ratings.length,
          createdBy: data.createdBy,
          createdByName: data.createdByName || 'Anonymous',
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status || 'pending',
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt?.toDate()
        };
      });

      return teams;
    }).catch(error => {
      console.error('Error fetching teams after retries:', error);
      throw new Error('Failed to fetch teams. Please check your internet connection.');
    });
  },

  async addTeam(teamData: NewTeam, userId: string): Promise<Team> {
    return retryOperation(async () => {
      const teamsCollection = collection(db, TEAMS_COLLECTION);
      
      console.log('Adding team to Firestore:', {
        teamName: teamData.teamName,
        projectName: teamData.projectName,
        userId: userId
      });
      
      // Try to add the team directly - Firebase will handle uniqueness
      const teamDocData: any = {
        teamName: teamData.teamName,
        projectName: teamData.projectName,
        ratings: [],
        ratedBy: [],
        suggestions: [],
        createdBy: userId,
        createdAt: new Date(),
        status: 'pending' as const,
        createdByName: teamData.createdByName || 'Anonymous',
        reviewedBy: null,
        reviewedAt: null
      };

      // Only add logoUrl if it's not undefined
      if (teamData.logoUrl) {
        teamDocData.logoUrl = teamData.logoUrl;
      }

      const docRef = await addDoc(teamsCollection, teamDocData);

      console.log('Team added successfully with ID:', docRef.id);

      const newTeam: Team = {
        id: docRef.id,
        teamName: teamData.teamName,
        projectName: teamData.projectName,
        logoUrl: teamData.logoUrl,
        ratings: [],
        ratedBy: [], // Initialize empty array for ratedBy
        suggestions: [], // Initialize empty array for suggestions
        averageRating: 0,
        totalRatings: 0,
        createdBy: userId,
        createdByName: teamData.createdByName || 'Anonymous',
        createdAt: new Date(),
        status: 'pending',
        reviewedBy: undefined,
        reviewedAt: undefined
      };

      return newTeam;
    }).catch(error => {
      console.error('Error adding team after retries:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      throw new Error('Failed to add team. Please check your internet connection and try again.');
    });
  },

  async rateTeam(teamId: string, rating: number, userId: string, suggestion?: string): Promise<Team> {
    if (rating < 1 || rating > 10) {
      throw new Error('Rating must be between 1 and 10');
    }

    return retryOperation(async () => {
      const teamRef = doc(db, TEAMS_COLLECTION, teamId);
      
      // Get the current team data to check if user has already rated
      const currentTeamDoc = await getDoc(teamRef);
      if (!currentTeamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const currentTeamData = currentTeamDoc.data();
      const userRatings = currentTeamData.ratedBy || [];
      const currentRatings = currentTeamData.ratings || [];
      const currentSuggestions = currentTeamData.suggestions || [];
      
      let updateData: any = {};
      
      // Check if user has already rated this team
      const userRatedIndex = userRatings.indexOf(userId);
      if (userRatedIndex >= 0) {
        // User has already rated - update their existing rating
        const newRatings = [...currentRatings];
        newRatings[userRatedIndex] = rating;
        
        // Update or add their suggestion
        const newSuggestions = currentSuggestions.filter((s: any) => s.userId !== userId);
        if (suggestion && suggestion.trim()) {
          newSuggestions.push({
            userId,
            suggestion: suggestion.trim(),
            rating,
            timestamp: new Date()
          });
        }
        
        updateData = {
          ratings: newRatings,
          suggestions: newSuggestions
        };
      } else {
        // New rating from this user
        updateData.ratings = arrayUnion(rating);
        updateData.ratedBy = arrayUnion(userId);
        
        // Add suggestion if provided
        if (suggestion && suggestion.trim()) {
          updateData.suggestions = arrayUnion({
            userId,
            suggestion: suggestion.trim(),
            rating,
            timestamp: new Date()
          });
        }
      }

      // Update the team document
      await updateDoc(teamRef, updateData);

      // Fetch the updated team data
      const updatedTeamDoc = await getDoc(teamRef);
      if (!updatedTeamDoc.exists()) {
        throw new Error('Team not found');
      }

      const data = updatedTeamDoc.data();
      const ratings = data.ratings || [];
      const ratedBy = data.ratedBy || [];
      const suggestions = data.suggestions || [];
      
      return {
        id: updatedTeamDoc.id,
        teamName: data.teamName,
        projectName: data.projectName,
        logoUrl: data.logoUrl,
        ratings,
        ratedBy,
        suggestions: suggestions.map((s: any) => ({
          ...s,
          timestamp: s.timestamp?.toDate() || new Date()
        })),
        averageRating: calculateAverageRating(ratings),
        totalRatings: ratings.length,
        createdBy: data.createdBy,
        createdByName: data.createdByName || 'Anonymous',
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || 'pending',
        reviewedBy: data.reviewedBy,
        reviewedAt: data.reviewedAt?.toDate()
      };
    }).catch(error => {
      console.error('Error rating team after retries:', error);
      if (error instanceof Error && error.message.includes('Rating must be') || error.message.includes('Team not found')) {
        throw error;
      }
      throw new Error('Failed to submit rating. Please check your internet connection and try again.');
    });
  },

  async getLeaderboard(): Promise<Team[]> {
    try {
      const teams = await this.getTeams();
      
      // Sort by average rating (descending), then by total ratings (descending)
      return teams.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.totalRatings - a.totalRatings;
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Failed to fetch leaderboard');
    }
  },

  async getAllTeamsForAdmin(): Promise<Team[]> {
    return retryOperation(async () => {
      console.log('Fetching all teams for admin...');
      const teamsCollection = collection(db, TEAMS_COLLECTION);
      const teamsQuery = query(teamsCollection, orderBy('createdAt', 'desc'));
      const teamsSnapshot = await getDocs(teamsQuery);
      
      console.log(`Found ${teamsSnapshot.size} teams for admin`);
      
      const teams: Team[] = teamsSnapshot.docs.map(doc => {
        const data = doc.data();
        const ratings = data.ratings || [];
        const ratedBy = data.ratedBy || [];
        const suggestions = data.suggestions || [];
        
        return {
          id: doc.id,
          teamName: data.teamName,
          projectName: data.projectName,
          logoUrl: data.logoUrl,
          ratings,
          ratedBy,
          suggestions: suggestions.map((s: any) => ({
            ...s,
            timestamp: s.timestamp?.toDate() || new Date()
          })),
          averageRating: calculateAverageRating(ratings),
          totalRatings: ratings.length,
          createdBy: data.createdBy,
          createdByName: data.createdByName || 'Anonymous',
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status || 'pending',
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt?.toDate()
        };
      });

      return teams;
    }).catch(error => {
      console.error('Error fetching teams for admin after retries:', error);
      throw new Error('Failed to fetch teams. Please check your internet connection.');
    });
  },

  async updateTeamStatus(
    teamId: string, 
    status: 'approved' | 'rejected', 
    reviewedBy: string
  ): Promise<void> {
    return retryOperation(async () => {
      const teamRef = doc(db, TEAMS_COLLECTION, teamId);
      
      await updateDoc(teamRef, {
        status,
        reviewedBy,
        reviewedAt: new Date()
      });

      console.log(`Team ${teamId} status updated to ${status} by ${reviewedBy}`);
    }).catch(error => {
      console.error('Error updating team status after retries:', error);
      throw new Error('Failed to update team status. Please check your internet connection.');
    });
  },

  async getApprovedTeams(): Promise<Team[]> {
    return retryOperation(async () => {
      console.log('Fetching approved teams only...');
      const teamsCollection = collection(db, TEAMS_COLLECTION);
      const approvedTeamsQuery = query(
        teamsCollection, 
        where('status', '==', 'approved')
      );
      const teamsSnapshot = await getDocs(approvedTeamsQuery);
      
      console.log(`Found ${teamsSnapshot.size} approved teams`);
      
      const teams: Team[] = teamsSnapshot.docs.map(doc => {
        const data = doc.data();
        const ratings = data.ratings || [];
        const ratedBy = data.ratedBy || [];
        const suggestions = data.suggestions || [];
        
        return {
          id: doc.id,
          teamName: data.teamName,
          projectName: data.projectName,
          logoUrl: data.logoUrl,
          ratings,
          ratedBy,
          suggestions: suggestions.map((s: any) => ({
            ...s,
            timestamp: s.timestamp?.toDate() || new Date()
          })),
          averageRating: calculateAverageRating(ratings),
          totalRatings: ratings.length,
          createdBy: data.createdBy,
          createdByName: data.createdByName || 'Anonymous',
          createdAt: data.createdAt?.toDate() || new Date(),
          status: data.status || 'pending',
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt?.toDate()
        };
      });

      // Sort by createdAt descending on client-side to avoid composite index
      return teams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }).catch(error => {
      console.error('Error fetching approved teams after retries:', error);
      throw new Error('Failed to fetch approved teams. Please check your internet connection.');
    });
  },
};