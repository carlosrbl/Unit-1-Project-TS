import type { Province } from "./province.ts";
import type { Town } from "./town.ts";
import type { Property } from "./property.ts";
import type { User } from "./user.ts";
import type { Rating } from "./rating.ts";

export interface ProvincesResponse {
  provinces: Province[];
}

export interface TownsResponse {
  towns: Town[];
}

export interface PropertiesResponse {
  properties: Property[];
}

export interface SinglePropertyResponse {
  property: Property;
}

export interface SingleUserResponse {
  user: User;
}

export interface TokenResponse {
  accessToken: string;
}

export interface RatingsResponse {
  ratings: Rating[];
}

export interface SingleRatingResponse {
  rating: Rating;
}

export interface LoginResponse {
  error: string;
  status?: number;
}

export interface RegisterResponse {
  message: string;
  error: string;
  statusCode?: number;
}
