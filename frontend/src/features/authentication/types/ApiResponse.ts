import ApiUser from 'types/ApiUser';

export interface ApiLoginResponse {
  token: string;
  type: string;
}

export interface ApiRegisterResponse extends ApiLoginResponse {
  user: ApiUser;
}

export default ApiLoginResponse;
