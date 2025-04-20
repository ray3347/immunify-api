import { ILocationData } from "src/model/interfaces/requests/ILocationData";

export const distanceCalculator = (userGeoLocation: ILocationData, targetGeoLocation: ILocationData): number => {
    const R = 6371; // Earth radius in kilometers
    const degToRad = Math.PI / 180;
    
    // Convert degrees to radians
    const φ1 = userGeoLocation.latitude * degToRad;
    const φ2 = targetGeoLocation.latitude * degToRad;
    const Δφ = (targetGeoLocation.latitude - userGeoLocation.latitude) * degToRad;
    const Δλ = (targetGeoLocation.longtitude - userGeoLocation.longtitude) * degToRad;
    
    // Haversine formula
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Distance in kilometers
    const distance = R * c;
    
    return distance;
}