import type { User } from "./user";

export interface RatingInsert {
  rating: number;
  comment: string;
}

export interface Rating extends RatingInsert {
  id: number;
  property: number;
  user: User;
}
