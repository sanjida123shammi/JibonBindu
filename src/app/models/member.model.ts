export interface Member {
  memberID: string;
  personId: number;
  fullName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  contactNumber: string;
  district: string;
  city: string;
  area: string;
  nidNumber?: string;
  birthCertificateNo?: string;
  email?: string;
  imageUrl?: string;
  personRoleID: number;
  roleName: string;
}

export interface MemberDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactNumber: string;
  district: string;
  city: string;
  area: string;
  nidNumber?: string;
  birthCertificateNo?: string;
  email?: string;
  imageUrl?: string;
  personRoleId?: number;
}
