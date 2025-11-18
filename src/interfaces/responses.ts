import type { Province } from "./province.ts";
import type { Town } from "./town.ts";
import type { Property } from "./property.ts";

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
  properties: Property;
}

export interface TokenResponse {
  accessToken: string;
}
