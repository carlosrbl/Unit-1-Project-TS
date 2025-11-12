import type { Town } from "./towns.interfaces.ts";

export interface Property {
  id: number;
  address: string;
  title: string;
  description: string;
  sqmeters: number;
  numRooms: number;
  numBaths: number;
  price: number;
  totalRating: number;
  mainPhoto: string;
  createdAt: string;
  status: string;
  town: Town;
  seller: number;
}
