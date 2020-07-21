export interface Claim {
  name: string;
  value: string;
}

export interface CredentialExchangeData {
  credential_exchange_id: string;
  status: string;
  revocation_id: string;
  credential_definition_id: string;
  revoc_reg_id: string;
}

export interface UserInfo {
  unit: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  home_address: string;
  postal_code: string;
  city: string;
  province: string;
  other_name: string;
  tier: string;
  application_number: string;
}

export interface UserCredentialInfo {
  user_info: UserInfo;
  credential_exchange_data: CredentialExchangeData;
}
