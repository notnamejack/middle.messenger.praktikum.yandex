import { renderPage, navigate } from './app';
import Input from './components/input';
import InputHorizontal from './components/input-horizontal';
import ChatItem from './components/chat-item';
import { registerComponent, type ComponentConstructor } from './core/register-component';

registerComponent(Input as ComponentConstructor);
registerComponent(InputHorizontal as ComponentConstructor);
registerComponent(ChatItem as ComponentConstructor);

void renderPage().catch(console.error);

window.addEventListener('popstate', () => {
  void renderPage().catch(console.error);
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
