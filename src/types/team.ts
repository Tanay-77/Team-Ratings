export interface Team {
  id: string;
  teamName: string;
  projectName: string;
  ratings: number[];
  ratedBy: string[]; // Add user IDs who have rated the team
  averageRating: number;
  totalRatings: number;
  createdBy: string;
  createdAt: Date;
}

export interface NewTeam {
  teamName: string;
  projectName: string;
}

export interface RatingData {
  teamId: string;
  rating: number;
}