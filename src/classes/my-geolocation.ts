import type { Coordinates } from "../interfaces/coordinates.ts";

export class MyGeolocation {
  static getLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve(pos.coords);
        },
        error => {
          switch (error.code) {
            case error.PERMISSION_DENIED: // User didn't allow the web page to retrieve location
              reject(new Error("User denied the request for Geolocation."));
              break;
            case error.POSITION_UNAVAILABLE: // Couldn't get the location
              reject(new Error("Location information is unavailable."));
              break;
            case error.TIMEOUT: // The maximum amount of time to get location information has passed
              reject(new Error("The request to get user location timed out."));
              break;
            default:
              reject(new Error("An unknown error occurred."));
              break;
          }
        }
      );
    });
  }
}
