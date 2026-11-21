export interface CaseRequest {
  id: number;
  date: string; // Creation date e.g. "2026-11-04"
  caseNo?: number; // Daily serial number (1, 2, 3... resets each day)
  bloodGroup: string;
  patientProblem: string;
  bloodQuantity: number; // Bags Quantity
  hemoglobin: number; // Hemoglobin Level
  donationDate: string; // Donation Date (YYYY-MM-DD)
  donationTime: string; // Donation Time (e.g. "10:30 AM")
  donationPlace: string; // Donation Place / Hospital Name
  contactNo: string; // Contact Number
  reference?: string; // Reference (source/person)
  status: 'Pending' | 'In Progress' | 'Fulfilled' | 'Cancelled' | string;
  remarks?: string; // Remarks
  deleteStatus?: 'InUse' | 'Deleted';
  isYourCase?: boolean;
}

export interface CreateCaseRequestDTO {
  date?: string;
  bloodGroup: string;
  patientProblem: string;
  bloodQuantity: number;
  hemoglobin: number;
  donationDate: string;
  donationTime: string;
  donationPlace: string;
  contactNo: string;
  reference?: string;
  remarks?: string;
  status?: string;
  isYourCase?: boolean;
}

export interface UpdateCaseStatusDTO {
  status: string;
}
