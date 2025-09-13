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
  getDoc,
  enableNetwork,
  disableNetwork
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
        console.log('Team data:', { id: doc.id, teamName: data.teamName, projectName: data.projectName });
        return {
          id: doc.id,
          teamName: data.teamName,
          projectName: data.projectName,
          ratings,
          ratedBy,
          averageRating: calculateAverageRating(ratings),
          totalRatings: ratings.length,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date()
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
      const docRef = await addDoc(teamsCollection, {
        teamName: teamData.teamName,
        projectName: teamData.projectName,
        ratings: [],
        ratedBy: [],
        createdBy: userId,
        createdAt: new Date()
      });

      console.log('Team added successfully with ID:', docRef.id);

      const newTeam: Team = {
        id: docRef.id,
        teamName: teamData.teamName,
        projectName: teamData.projectName,
        ratings: [],
        ratedBy: [], // Initialize empty array for ratedBy
        averageRating: 0,
        totalRatings: 0,
        createdBy: userId,
        createdAt: new Date()
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

  async rateTeam(teamId: string, rating: number, userId: string): Promise<Team> {
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
      
      // Check if user has already rated this team
      if (userRatings.includes(userId)) {
        throw new Error('You have already rated this team');
      }
      
      // Add the rating to the ratings array and the userId to ratedBy array
      await updateDoc(teamRef, {
        ratings: arrayUnion(rating),
        ratedBy: arrayUnion(userId)
      });

      // Fetch the updated team data
      const updatedTeamDoc = await getDoc(teamRef);
      if (!updatedTeamDoc.exists()) {
        throw new Error('Team not found');
      }

      const data = updatedTeamDoc.data();
      const ratings = data.ratings || [];
      const ratedBy = data.ratedBy || [];
      
      return {
        id: updatedTeamDoc.id,
        teamName: data.teamName,
        projectName: data.projectName,
        ratings,
        ratedBy,
        averageRating: calculateAverageRating(ratings),
        totalRatings: ratings.length,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date()
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
};