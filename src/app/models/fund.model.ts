export interface FundDeposit {
  fundDepositId: number;
  fundDonationDate: string; // YYYY-MM-DD
  fundDonorTypeId?: number;
  fundDonorTypeName?: string;
  // fundDonationTypeId?: number;
  // donationTypeName?: string;
  fundDonorId?: number;
  donorName: string;
  donorContactNo?: string;
  donationSlot?: string;
  amount: number;
  fundReceiver?: string;
  fundingTypeId: number;
  fundingTypeName: string;
  cashTypeId: number;
  cashTypeName: string;
  months: string;
  memberId?: string; // e.g. "JBF-006"
}

export interface FundDepositDTO {
  fundDonationDate: string;
  fundDonorTypeId?: number;
  fundDonorId?: number;
  donorName: string;
  donorContactNo?: string;
  amount: number;
  fundReceiver?: string;
  fundingTypeId: number;
  cashTypeId: number;
  months: string;
}

export interface FundCosting {
  fundCostingId: number;
  costingDate: string; // YYYY-MM-DD
  spentByPersonId: number;
  spentByName: string;
  spentByContactNo?: string;
  costAmount: number;
  purpose: string;
  settlementStatusId: number;
  settlementStatusTitle: string;
  remarks: string;
  memberId?: string; // e.g. "JBF-004"
}

export interface FundCostingDTO {
  costingDate: string;
  spentByPersonId: number;
  costAmount: number;
  purpose: string;
  settlementStatusId: number;
  remarks: string;
}

export interface LookupItem {
  id: number;
  name: string;
}

export interface FundLookupsResponse {
  donationTypes: LookupItem[];
  fundingTypes: LookupItem[];
  cashTypes: LookupItem[];
  donorTypes: LookupItem[];
  settlementStatuses: LookupItem[];
}

export interface FundDonorOption {
  fundDonorId: number;
  personId: number;
  fullName: string;
  contactNo: string;
  donorType: string;
  donationSlot: string;
  payAmount: number;
  memberId?: string;
}

export interface PersonOption {
  personId: number;
  fullName: string;
  contactNo: string;
  role: string;
  memberId?: string;
}
