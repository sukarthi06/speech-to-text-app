export type UserStatus = 'Inactive' | 'Active' | 'Suspended';

export interface UserOrganization {
  organizationId: string;
  name: string;
}

export interface UserAddress {
  addressId: number;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  zip: string;
}

export interface User {
  userId: string;
  email: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dob: string | null;
  phone1: string | null;
  phone2: string | null;
  sex: string | null;
  licenseNo: string | null;
  userStatus: UserStatus;
  organization: UserOrganization | null;
  address: UserAddress | null;
  roles: string[];
}