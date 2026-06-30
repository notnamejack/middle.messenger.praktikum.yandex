import { HTTPTransport } from '../core/HTTPTransport';
import { API_BASE } from './constants';
import type { ChangePasswordRequest, UserResponse, UserUpdateRequest } from '../types/api';

const http = new HTTPTransport();

export const UserAPI = {
  updateProfile: (data: UserUpdateRequest) =>
    http.put(`${API_BASE}/user/profile`, { data }),

  changePassword: (data: ChangePasswordRequest) =>
    http.put(`${API_BASE}/user/password`, { data }),

  uploadAvatar: (data: FormData) =>
    http.put(`${API_BASE}/user/profile/avatar`, { data, isFormData: true }),

  search: (login: string): Promise<UserResponse[]> =>
    http.post(`${API_BASE}/user/search`, { data: { login } }).then(JSON.parse),
};
