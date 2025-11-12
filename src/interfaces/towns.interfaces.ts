import type { Province } from "./provinces.interfaces.ts";

export interface Town {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  province: number | Province;
}
