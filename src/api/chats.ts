import { HTTPTransport } from '../core/HTTPTransport';
import { API_BASE } from './constants';
import type { ChatDeleteRequest, ChatsResponse, UsersRequest } from '../types/api';

const http = new HTTPTransport();

export const ChatsAPI = {
  getChats: (): Promise<ChatsResponse> => http.get(`${API_BASE}/chats`).then(JSON.parse),
  createChat: (title: string) => http.post(`${API_BASE}/chats`, { data: { title } }),
  addUsersToChat: (users: number[], chatId: number) =>
    http.put(`${API_BASE}/chats/users`, { data: { users, chatId } satisfies UsersRequest}),
  removeUsersFromChat: (users: number[], chatId: number) =>
    http.delete(`${API_BASE}/chats/users`, { data: { users, chatId } }),
  deleteChat: (chatId: number) =>
    http.delete(`${API_BASE}/chats`, { data: { chatId } satisfies ChatDeleteRequest}),
};

