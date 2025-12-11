import { Gender } from "@prisma/client";

export interface IHostUpdate {
  name?: string;
  profileImage?: string;
  bio?: string;
  location?: string;
  gender?: Gender;
  interests?: string[];
}
export interface IHostStats {
  totalEventsHosted: number;
  totalRevenue: number;
  averageRating: number;
  totalRatings: number;
  upcomingEvents: number;
  completedEvents: number;
}