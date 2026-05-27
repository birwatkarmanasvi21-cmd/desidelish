export interface SignupData {
  email: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  accessToken: string;
  refreshToken: string;
}
