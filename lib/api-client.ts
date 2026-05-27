// API Client Configuration and Error Handling

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  data?: any;
}

// Custom error class for API errors
export class APIError extends Error implements ApiError {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

// Generic API request handler
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new APIError(
        result.error || result.message || 'An error occurred',
        response.status,
        result.data
      );
    }

    return {
      success: true,
      data: result.data !== undefined ? result.data : result,
      statusCode: response.status,
    };
  } catch (error) {
    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      };
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: message,
      statusCode: 500,
    };
  }
}

// API request with token (for authenticated requests)
export function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('authToken');
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}
