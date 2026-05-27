/**
 * Calculates the great-circle distance between two points (latitude and longitude)
 * using the Haversine formula.
 * 
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Number(distance.toFixed(2));
};

/**
 * Estimates delivery time based on distance.
 * Base time + (km * multiplier)
 * 
 * @param distance Distance in km
 * @param preparationTime Average preparation time in minutes
 * @returns Estimated time in minutes
 */
export const estimateDeliveryTime = (
  distance: number,
  preparationTime: number = 20
): { min: number; max: number } => {
  const travelTimePerKm = 5; // 5 minutes per km on average
  const bufferTime = 10; // Extra buffer

  const estimatedTravelTime = distance * travelTimePerKm;
  const min = Math.round(preparationTime + estimatedTravelTime);
  const max = Math.round(min + bufferTime);

  return { min, max };
};
