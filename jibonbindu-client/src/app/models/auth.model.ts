export interface LoginDTO {
  email: string;
  password: string;
}

export type RegistrationRole = 'Seeker' | 'BloodDonor' | 'FundDonor' | 'Member';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: RegistrationRole | string;
  acceptPrivacyPolicy?: boolean;
}

export interface GeneralResponse {
  flag: boolean;
  message: string;
}

export interface LoginResponse {
  flag: boolean;
  message: string;
  token?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DecodedJwt {
  nameid?: string;
  email?: string;
  unique_name?: string;
  role?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  [key: string]: any;
}
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  flag: boolean;
  message: string;
  token?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}