import { Http } from "./http.class.ts";
import { SERVER } from "../constants.ts";
import type { Property } from "../interfaces/property.interfaces.ts";
import type { PropertyInsert } from "../interfaces/propertyInsert.interfaces.ts";
import type { PropertiesResponse } from "../interfaces/responses.ts";

export class PropertiesService {
  #http = new Http();

  async getProperties(): Promise<Property[]> {
    const resp = await this.#http.get<PropertiesResponse>(
      `${SERVER}/properties`
    );
    return resp.properties;
  }
  async insertProperty(propertie: Property): Promise<Property> {
    const body: PropertyInsert = {
      property: propertie,
    };
    const resp = await this.#http.post<Property, PropertyInsert>(
      `${SERVER}/properties`,
      body
    );
    return resp;
  }
  deleteProperty(id: number): Promise<void> {
    return this.#http.delete(`${SERVER}/properties/${id}`);
  }
}
