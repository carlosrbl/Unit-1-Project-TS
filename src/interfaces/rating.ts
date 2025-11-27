import type { User } from "./user";

export interface RatingInsert {
  rating: number;
  comment: string;
}

export interface Rating {
  id: number;
  rating: number;
  comment: string;
  property: number;
  user: User;
}
