import type { Register } from "./registerData.interfaces.ts";

export interface User extends Omit<Register, "password"> {
  id: number;
  me: boolean;
}
