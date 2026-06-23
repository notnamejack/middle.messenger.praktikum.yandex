import type Block from '../core/block';
import ChatsPage from '../pages/chats';
import LoginPage from '../pages/login';
import RegistrationPage from '../pages/registration';
import ProfilePage from '../pages/profile';
import NotFoundPage from '../pages/not-found';
import ServerErrorPage from '../pages/server-error';

type PageConstructor = new () => Block;

export const ROUTES: Record<string, PageConstructor> = {
  '/': LoginPage,
  '/sign-up': RegistrationPage,
  '/settings': ProfilePage,
  '/messenger': ChatsPage,
  '/404': NotFoundPage,
  '/500': ServerErrorPage,
};

export const PUBLIC_ROUTES = ['/', '/sign-up', '/404', '/500'];
export const PRIVATE_ROUTES = ['/messenger', '/settings'];

export const isPublicRoute = (path: string) => PUBLIC_ROUTES.includes(path);
export const isPrivateRoute = (path: string) => PRIVATE_ROUTES.includes(path);
