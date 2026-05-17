import { renderPage, navigate } from './app';
import Input from './components/input';
import InputHorizontal from './components/input-horizontal';
import ChatItem from './components/chat-item';
import { registerComponent } from './core/register-component';

registerComponent(Input);
registerComponent(InputHorizontal);
registerComponent(ChatItem);

renderPage(); 

window.addEventListener('popstate', () => {
  renderPage();
});

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const link = target.closest<HTMLAnchorElement>('a[data-link]');
  if (!link) return;

  e.preventDefault();
  const href = link.getAttribute('href');
  if (!href) return;

  navigate(href);
});