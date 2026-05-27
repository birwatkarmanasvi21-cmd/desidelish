/**
 * Real-time location utility functions
 */

export interface ReverseGeocodeResult {
  address: string;
  city: string;
  success: boolean;
  error?: string;
}

/**
 * Fetches the street address and city for a given latitude and longitude using Nominatim (OpenStreetMap)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  try {
    // Using Nominatim (OpenStreetMap) API - Free for low volume
    // format=json, lat=..., lon=...
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'FoodHub-App/1.0', // Good practice to include identifying User-Agent
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Nominatim returns address components
    const addressComponents = data.address || {};
    
    // Construct a readable address from components
    // Prioritize: road/suburb/neighbourhood/house_number
    const street = addressComponents.road || 
                   addressComponents.suburb || 
                   addressComponents.neighbourhood || 
                   addressComponents.commercial ||
                   '';
    
    const houseNumber = addressComponents.house_number || '';
    const fullAddress = houseNumber ? `${houseNumber}, ${street}` : street;
    
    const city = addressComponents.city || 
                 addressComponents.town || 
                 addressComponents.village || 
                 addressComponents.state_district || 
                 'Unknown City';

    return {
      address: fullAddress || data.display_name.split(',')[0], // Fallback to start of display name
      city: city,
      success: true,
    };
  } catch (error: any) {
    console.error('Reverse geocoding failed:', error);
    return {
      address: '',
      city: '',
      success: false,
      error: error.message || 'Failed to fetch address information',
    };
  }
}
