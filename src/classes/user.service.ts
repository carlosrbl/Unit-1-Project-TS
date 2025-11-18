import { Http } from "./http.class.ts";
import { SERVER } from "../constants.ts";
import type { SingleUserResponse } from "../interfaces/responses.ts";
import type {
  User,
  UserProfile,
  UserAvatar,
  UserPassword,
} from "../interfaces/user.ts";

export class UserService {
  #http = new Http();

  async getProfile(id?: number): Promise<User> {
    const path = id ? `/users/${id}` : `/users/me`;

    const resp = await this.#http.get<SingleUserResponse>(`${SERVER}${path}`);
    return resp.user;
  }

  async saveProfile(profileData: UserProfile): Promise<void> {
    try {
      await this.#http.put<void, UserProfile>(
        `${SERVER}/users/me/profile`,
        profileData
      );
    } catch (error) {
      console.error(error);
    }
  }

  async saveAvatar(avatar: string): Promise<string> {
    const dataToSend: UserAvatar = { avatar };
    const resp = await this.#http.put<{ avatarUrl: string }, UserAvatar>(
      `${SERVER}/users/me/avatar`,
      dataToSend
    );
    return resp.avatarUrl;
  }

  async savePassword(passwordData: UserPassword): Promise<void> {
    try {
      await this.#http.put<void, UserPassword>(
        `${SERVER}/users/me/password`,
        passwordData
      );
    } catch (error) {
      console.error(error);
    }
  }
}
