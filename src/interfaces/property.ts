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

export interface Property
  extends PropertyInsert,
    Omit<PropertyInsert, "townId"> {
  id: number;
  createdAt: string;
  status: string;
  town: Town;
  seller: number;
  mine: boolean;
  totalRating: number;
}
