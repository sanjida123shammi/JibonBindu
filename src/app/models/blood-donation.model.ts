export interface BloodDonationData {
  month: string;
  count: number;
}

export interface BloodDonationResponse {
  year: number;
  data: BloodDonationData[];
  donations: BloodDonationData[];
}