export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  location?: string;
  avatarUrl?: string;
}

export interface UpdateProfileDTO {
  fullName: string;
  phoneNumber?: string;
  location?: string;
  avatarUrl?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
