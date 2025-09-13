export interface Team {
  id: string;
  teamName: string;
  projectName: string;
  logoUrl?: string;
  ratings: number[];
  ratedBy: string[]; // Add user IDs who have rated the team
  suggestions: Array<{
    userId: string;
    suggestion: string;
    rating: number;
    timestamp: Date;
  }>;
  averageRating: number;
  totalRatings: number;
  createdBy: string;
  createdByName: string; // Display name of the creator
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // Admin who reviewed the team
  reviewedAt?: Date;
}

export interface NewTeam {
  teamName: string;
  projectName: string;
  logoUrl?: string;
  createdByName?: string;
}

export interface RatingData {
  teamId: string;
  rating: number;
  suggestion?: string;
}