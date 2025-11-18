import { Http } from "./http.class.ts";
import { SERVER } from "../constants.ts";
import { TOKEN_KEY } from "../constants.ts";
import type { Login, Register } from "../interfaces/user.ts";
import type { TokenResponse } from "../interfaces/responses.ts";

export class AuthService {
  #http = new Http();

  async login(userLogin: Login): Promise<void> {
    try {
      const resp = await this.#http.post<TokenResponse, Login>(
        `${SERVER}/auth/login`,
        userLogin
      );

      localStorage.setItem(TOKEN_KEY, resp.accessToken);
    } catch (error) {
      console.error(error);
    }
  }

  async register(userInfo: Register): Promise<void> {
    try {
      await this.#http.post<void, Register>(
        `${SERVER}/auth/register`,
        userInfo
      );
    } catch (error) {
      console.error(error);
    }
  }

  async checkToken(): Promise<void> {
    try {
      await this.#http.get<void>(`${SERVER}/auth/validate`);
    } catch (error) {
      console.error(error);
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
