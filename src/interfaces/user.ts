export interface User extends Omit<Register, "password"> {
  id: number;
  me: boolean;
}

export interface Login {
  email: string;
  password: string;
}

export interface Register extends Login {
  name: string;
  avatar: string;
}
