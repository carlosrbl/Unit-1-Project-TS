import type { Town } from "./town.ts";

export interface PropertyInsert {
  address: string;
  title: string;
  description: string;
  sqmeters: number;
  numRooms: number;
  numBaths: number;
  price: number;
  mainPhoto: string;
  townId: number;
}

export interface Seller {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface Property
  extends PropertyInsert,
    Omit<PropertyInsert, "townId"> {
  id: number;
  createdAt: string;
  status: string;
  town: Town;
  seller: Seller;
  mine?: boolean;
  totalRating: number;
  rated?: boolean;
}
