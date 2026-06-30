import Block from '../core/block';
import { isPrivateRoute, ROUTES } from './routes';
import NotFoundPage from '../pages/not-found';
import { AuthAPI } from '../api/auth';

let activePage: Block | null = null;

export async function renderPage(pathname: string = window.location.pathname) {
  const root = document.getElementById('app');
  if (!root) return;

  let user = null;
  try {
    user = await AuthAPI.getUser();
  } catch {
    user = null;
  }
  // не авторизован → на login (кроме публичных)
  if (!user && isPrivateRoute(pathname)) {
    return navigate('/');
  }
  // авторизован → не пускать на login/sign-up
  if (user && (pathname === '/' || pathname === '/sign-up')) {
    return navigate('/messenger');
  }

  const Page = ROUTES[pathname] ?? NotFoundPage;

  root.replaceChildren();
  if(activePage) {
    activePage.destroy();
  }
  activePage = new Page();
  const el = activePage.element();
  if (el) root.appendChild(el);
}

export function navigate(path: string) {
  if (path === window.location.pathname) {
    void renderPage(path).catch(console.error);
    return;
  }
  window.history.pushState({ path }, '', path);
  void renderPage(path).catch(console.error);
}
