export type DonationType = 'WholeBlood' | 'Plasma' | 'Platelets';

export interface BloodDonorDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  contactNo: string;
  district?: string;
  city?: string;
  area?: string;
  bloodGroup: string;
  lastDonationDate?: string | null;
  lastDonationType?: DonationType;
  preferredLocation?: string;
  preferredTime?: string;
  remarks?: string;
  isAvailable?: boolean;

  address?: string;
  status?: string;
  totalDonation?: number;
  donationFromJbf?: number;
  discontinueStatus?: 'IsActive' | 'InActive';
}

export interface BloodDonorResponse {
  bloodDonorId: number;
  personId: number;
  firstName?: string;
  lastName?: string;
  fullName: string;
  dateOfBirth?: string;
  contactNo: string;
  district: string;
  city: string;
  area: string;
  bloodGroup: string;
  status: string;
  totalDonation: number;
  donationFromJbf: number;
  preferredLocation: string;
  preferredTime: string;
  remarks: string;
  lastDonationDate: string | null;
  lastDonationType: number | string;
  nextEligibleDate?: string | null;
  isEligibleNow?: boolean;
}

export interface BloodDonor {
  id: number;
  donorCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  bloodGroup: string;
  contactNo: string;
  address: string;
  district: string;
  city: string;
  area: string;
  lastDonationDate: string | null;
  lastDonationType: DonationType;
  daysSinceLastDonation?: string;
  nextEligibleDate?: string | null;
  status: string;
  dateOfBirth: string;
  totalDonation: number;
  donationFromJbf: number;
  preferredLocation: string;
  preferredTime: string;
  remarks: string;
  discontinueStatus: 'IsActive' | 'InActive';
}

export type CreateBloodDonorDTO = BloodDonorDTO;
