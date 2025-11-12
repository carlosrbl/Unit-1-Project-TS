import type { Province } from "./provinces.interfaces.ts";
import type { Town } from "./towns.interfaces.ts";
import type { Property } from "./property.interfaces.ts";

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

// export interface TokenResponse {}
