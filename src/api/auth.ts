import { HTTPTransport } from '../core/HTTPTransport';
import { API_BASE } from './constants';
import type { SignInRequest, SignUpRequest, UserResponse } from '../types/api';


const http = new HTTPTransport();

export const AuthAPI = {
  signIn: (data: SignInRequest) =>
    http.post(`${API_BASE}/auth/signin`, { data }),
  signUp: (data: SignUpRequest) =>
    http.post(`${API_BASE}/auth/signup`, { data }),
  getUser: (): Promise<UserResponse> =>
    http.get(`${API_BASE}/auth/user`).then(JSON.parse),
  logout: () =>
    http.post(`${API_BASE}/auth/logout`),
};
