import type { PropertyInsert } from "./propertyInsert.interfaces.ts";
import type { Town } from "./towns.interfaces.ts";

export interface Property
  extends PropertyInsert,
    Omit<PropertyInsert, "townId"> {
  id: number;
  createdAt: string;
  status: string;
  town: Town;
  seller: number;
}
