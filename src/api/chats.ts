import { HTTPTransport } from '../core/HTTPTransport';
import { API_BASE } from './constants';
import type { ChatDeleteRequest, ChatResponse, ChatsResponse, CreateChatResponse, UsersRequest } from '../types/api';

const http = new HTTPTransport();

export const ChatsAPI = {
  getChats: (): Promise<ChatsResponse> => http.get(`${API_BASE}/chats`).then(JSON.parse),
  addUsersToChat: (users: number[], chatId: number) =>
    http.put(`${API_BASE}/chats/users`, { data: { users, chatId } satisfies UsersRequest}),
  removeUsersFromChat: (users: number[], chatId: number) =>
    http.delete(`${API_BASE}/chats/users`, { data: { users, chatId } }),
  deleteChat: (chatId: number) =>
    http.delete(`${API_BASE}/chats`, { data: { chatId } satisfies ChatDeleteRequest}),  
  createChat: (title: string): Promise<CreateChatResponse> =>
    http.post(`${API_BASE}/chats`, { data: { title } }).then(JSON.parse),
  getCommonChat: (userId: number): Promise<ChatResponse> =>
    http.get(`${API_BASE}/chats/${userId}/common`).then(JSON.parse),
  uploadAvatar: (chatId: number, file: File) => {
    const formData = new FormData();
    formData.append('chatId', String(chatId));
    formData.append('avatar', file);
    return http.put(`${API_BASE}/chats/avatar`, { data: formData, isFormData: true });
  },
};

