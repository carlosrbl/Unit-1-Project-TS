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

export interface UserProfile {
  name: string;
  email: string;
}

export interface UserAvatar {
  avatar: string;
}

export interface UserPassword {
  password: string;
}
