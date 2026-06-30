export function setSidebarMessageText(el: HTMLElement, content: string, prefix?: string): void {
  el.textContent = '';

  if (prefix) {
    const span = document.createElement('span');
    span.textContent = prefix;
    el.append(span);
  }

  el.append(document.createTextNode(content));
}
