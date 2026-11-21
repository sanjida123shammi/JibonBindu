export interface RoleItem {
  id: string;
  name: string;
}

export interface CreateRoleDTO {
  name: string;
}

export interface MemberLookup {
  memberID: string;
  fullName: string;
  contactNumber: string;
}

export interface MemberAssignedRoles {
  memberID: string;
  memberName: string;
  contactNumber: string;
  roleIds: string[];
  roleNames: string[];
  roleNamesDisplay: string;
}

export interface AssignMemberRolesDTO {
  memberID: string;
  roleIds: string[];
}

export interface UserDetail {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  memberID?: string;
  emailConfirmed: boolean;
  isLockedOut: boolean;
}
