import { Http } from "./http.class.ts";
import { SERVER } from "./constants.ts";
import type { Property, PropertiesResponse, PropertyInsert } from "./interfaces/property.interfaces.ts";

export class PropertiesService {
  #http = new Http();

  async getProperties(): Promise<Property[]> {
    const resp = await this.#http.get<PropertiesResponse>(`${SERVER}/properties`);
    return resp.properties;
  }
  async insertProperty(propertie: Property): Promise<Property>{
    const resp = await this.#http.post<PropertyInsert, Property>(`${SERVER}/properties`, propertie);
    return resp.property;
  }
  deleteProperty(id: number): Promise<void>{
    return this.#http.delete(`${SERVER}/properties/${id}`);
  }
}
