import Block from '../core/block';
import { ROUTES } from './routes';
import NotFoundPage from '../pages/not-found';

let activePage: Block | null = null;

export function renderPage(pathname: string = window.location.pathname) {
  const root = document.getElementById('app');
  if (!root) return;

  const Page = ROUTES[pathname] ?? NotFoundPage;

  root.innerHTML = '';
  activePage = new Page();
  const el = activePage.element();
  if (el) root.appendChild(el);
}

export function navigate(path: string) {
  if (path === window.location.pathname) {
    renderPage(path);
    return;
  }
  window.history.pushState({ path }, '', path);
  renderPage(path);
}