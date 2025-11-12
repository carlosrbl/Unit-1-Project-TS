export interface Province {
    id: number;
    name: string;
}

export interface Town {
    id: number;
    name: string;
    longitude: number;
    latitude: number;
    province: number;
}

export interface ProvincesResponse {
    provinces: Province[];
}

export interface TownsResponse {
    towns: Town[];
}