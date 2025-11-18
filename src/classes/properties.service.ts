import { Http } from "./http.class.ts";
import { SERVER } from "../constants.ts";
import type { Property, PropertyInsert } from "../interfaces/property.ts";
import type {
  PropertiesResponse,
  SinglePropertyResponse,
  RatingsResponse,
  SingleRatingResponse,
} from "../interfaces/responses.ts";
import type { Rating, RatingInsert } from "../interfaces/rating.ts";

export class PropertiesService {
  #http = new Http();

  async getProperties(): Promise<Property[]> {
    const resp = await this.#http.get<PropertiesResponse>(
      `${SERVER}/properties`
    );
    return resp.properties;
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

  deleteProperty(id: number): Promise<void> {
    return this.#http.delete(`${SERVER}/properties/${id}`);
  }

  async addRating(id: number, rating: RatingInsert): Promise<Rating> {
    const resp = await this.#http.put<Rating, RatingInsert>(
      `${SERVER}/properties/${id}`,
      rating
    );
    return resp;
  }

  async getRatings(): Promise<Rating[]> {
    const resp = await this.#http.get<RatingsResponse>(
      `${SERVER}/properties/ratings`
    );
    return resp.ratings;
  }

  async getRatingsById(id: number): Promise<Rating> {
    const resp = await this.#http.get<SingleRatingResponse>(
      `${SERVER}/properties/ratings/${id}`
    );
    return resp.rating;
  }
}
