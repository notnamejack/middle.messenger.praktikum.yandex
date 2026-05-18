import type Block from '../core/block';
import ChatsPage from '../pages/chats';
import LoginPage from '../pages/login';
import RegistrationPage from '../pages/registration';
import ProfilePage from '../pages/profile';
import NotFoundPage from '../pages/not-found';
import ServerErrorPage from '../pages/server-error';

type PageConstructor = new () => Block;

export const ROUTES: Record<string, PageConstructor> = {
  '/': ChatsPage,
  '/messenger': ChatsPage,
  '/login': LoginPage,
  '/sign-up': RegistrationPage,
  '/registration': RegistrationPage,
  '/profile': ProfilePage,
  '/settings': ProfilePage,
  '/404': NotFoundPage,
  '/500': ServerErrorPage,
};
