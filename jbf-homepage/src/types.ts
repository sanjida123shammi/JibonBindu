export interface GeneralResponse {
  flag: boolean;
  message: string;
}

export interface LoginResponse extends GeneralResponse {
  token: string;
}

/** What GET api/auth/me returns. */
export interface UserSession {
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
}

/** Must match AppRoles.SelfRegistration in the API (Admin is never offered). */
export type RegistrationRole = "Seeker" | "BloodDonor" | "FundDonor" | "Member";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: RegistrationRole;
  acceptPrivacyPolicy: boolean;
}
