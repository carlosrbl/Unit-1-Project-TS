import type { Province } from "./province.ts";

export interface Town {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  province: number | Province;
}
