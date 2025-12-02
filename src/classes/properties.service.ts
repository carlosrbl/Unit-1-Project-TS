import { Http } from "./http.class.ts";
import { SERVER } from "../constants.ts";
import type { Property, PropertyInsert } from "../interfaces/property.ts";
import type {
  PropertiesResponse,
  SinglePropertyResponse,
  RatingsResponse,
} from "../interfaces/responses.ts";
import type { Rating, RatingInsert } from "../interfaces/rating.ts";

export class PropertiesService {
  #http = new Http();

  async getProperties(params?: URLSearchParams): Promise<PropertiesResponse> {
    const queryString = params ? `?${params.toString()}` : "";
    const resp = await this.#http.get<PropertiesResponse>(
      `${SERVER}/properties${queryString}`
    );
    return resp;
  }

  async getPropertyById(id: number): Promise<Property> {
    const resp = await this.#http.get<SinglePropertyResponse>(
      `${SERVER}/properties/${id}`
    );
    return resp.property;
  }

  async insertProperty(property: PropertyInsert): Promise<Property> {
    const resp = await this.#http.post<Property, PropertyInsert>(
      `${SERVER}/properties`,
      property
    );
    return resp;
  }

  async deleteProperty(id: number): Promise<void> {
    return this.#http.delete(`${SERVER}/properties/${id}`);
  }

  async addRating(id: number, rating: RatingInsert): Promise<Rating> {
    const resp = await this.#http.post<Rating, RatingInsert>(
      `${SERVER}/properties/${id}/ratings`,
      rating
    );
    return resp;
  }

  async getRatings(id: number): Promise<Rating[]> {
    const resp = await this.#http.get<RatingsResponse>(
      `${SERVER}/properties/${id}/ratings`
    );
    return resp.ratings;
  }

  async deleteRating(id: number, user: number): Promise<void> {
    return this.#http.delete(`${SERVER}/properties/${id}/ratings/${user}`);
  }
}
