import { Http } from "./http.class.ts";
import { SERVER } from "../constants.ts";
import type { Province } from "../interfaces/province.ts";
import type { Town } from "../interfaces/town.ts";
import type {
  ProvincesResponse,
  TownsResponse,
} from "../interfaces/responses.ts";

export class ProvincesService {
  #http = new Http();

  async getProvinces(): Promise<Province[]> {
    const resp = await this.#http.get<ProvincesResponse>(`${SERVER}/provinces`);
    return resp.provinces;
  }

  async getTowns(id: number): Promise<Town[]> {
    const resp = await this.#http.get<TownsResponse>(
      `${SERVER}/provinces/${id}/towns`
    );
    return resp.towns;
  }
}
