import type { Town } from "./provinces.interfaces.ts";

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

export interface PropertiesResponse {
    properties: Property[];
}

export interface PropertyInsert {
    property: Property;
}