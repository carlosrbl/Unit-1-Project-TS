import type { Login } from "./loginData.interfaces.ts";

export interface Register extends Login {
  name: string;
  avatar: string;
}
