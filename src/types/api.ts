/** POST /auth/signin */
export type SignInRequest = {
  login: string;
  password: string;
};
  
/** POST /auth/signup */
export type SignUpRequest = {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
};
  
/** GET /auth/user */
export type UserResponse = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
};
  
/** PUT /user/profile */
export type UserUpdateRequest = {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
};

/** PUT /user/password */
export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

/** Тело ошибки API */
export type HttpErrorBody = {
  reason: string;
};

/** POST /chats */
export type CreateChatRequest = {
  title: string;
};

/** PUT /chats/users, DELETE /chats/users */
export type UsersRequest = {
  users: number[];
  chatId: number;
};

/** DELETE /chats */
export type ChatDeleteRequest = {
  chatId: number;
};

/** POST /user/search */
export type FindUserRequest = {
  login: string;
};

/** Элемент GET /chats */
export type ChatResponse = {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  last_message: {
    user: Pick<UserResponse, 'id' | 'first_name' | 'second_name' | 'display_name' | 'login' | 'avatar'>;
    time: string;
    content: string;
  } | null;
  created_by: number;
  updated_by: number | null;
};

/** POST /chats */
export type CreateChatResponse = {
  id: number;
};

export type MessageFile = {
  id: number;
  user_id: number;
  path: string;
  filename: string;
  content_type: string;
  content_size: number;
  upload_date: string;
};

export type ChatTokenResponse = {
  token: string;
};

export type MessageResponse = {
  id?: string;
  chat_id?: number;
  time: string;
  type: 'message' | 'file' | 'sticker';
  user_id: string;
  content: string;
  file?: MessageFile;
};

export type MessageView = {
  id: string;
  content: string;
  time: string;
  isMine: boolean;
};

export type ChatsResponse = ChatResponse[];

export type ChatUsersResponse = UserResponse[];
