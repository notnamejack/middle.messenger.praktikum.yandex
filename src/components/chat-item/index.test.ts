import { describe, expect, it } from 'vitest';
import ChatItem from './index';

const baseProps = {
    id: 42,
    name: 'Анна',
    text: 'Привет!',
    time: '12:30',
};

describe('ChatItem', () => {
    it('рендерит имя, текст и время', () => {
        const component = new ChatItem(baseProps);
        const el = component.element()!;

        expect(el.tagName).toBe('LI');
        expect(el.querySelector('.name')?.textContent).toBe('Анна');
        expect(el.querySelector('.text-message')?.textContent).toBe('Привет!');
        expect(el.querySelector('.time')?.textContent).toBe('12:30');
    });

    it('data-атрибуты для клика по чату', () => {
        const el = new ChatItem(baseProps).element()!;
        expect(el.getAttribute('data-chat-id')).toBe('42');
        expect(el.getAttribute('data-title')).toBe('Анна');
    });

    it('active добавляет item--active', () => {
        const active = new ChatItem({ ...baseProps, active: true }).element()!;
        const inactive = new ChatItem({ ...baseProps, active: false }).element()!;

        expect(active.classList.contains('item--active')).toBe(true);
        expect(inactive.classList.contains('item--active')).toBe(false);
    });

    it('аватар: empty без url, img с url', () => {
        const without = new ChatItem({ ...baseProps, avatarUrl: null }).element()!;
        expect(without.querySelector('.avatar')?.classList.contains('empty')).toBe(true);
        expect(without.querySelector('img')).toBeNull();

        const withAvatar = new ChatItem({
            ...baseProps,
            avatarUrl: 'https://example.com/a.jpg',
        }).element()!;
        expect(withAvatar.querySelector('.avatar')?.classList.contains('empty')).toBe(false);
        expect(withAvatar.querySelector('img')?.getAttribute('src')).toBe('https://example.com/a.jpg');
    });

    it('count показывается только если передан', () => {
        const withCount = new ChatItem({ ...baseProps, count: 3 }).element()!;
        const withoutCount = new ChatItem(baseProps).element()!;

        expect(withCount.querySelector('.count')?.textContent).toBe('3');
        expect(withoutCount.querySelector('.count')).toBeNull();
    });

    it('prefix перед текстом сообщения', () => {
        const el = new ChatItem({ ...baseProps, prefix: 'Вы: ' }).element()!;
        const textEl = el.querySelector('.text-message')!;

        expect(textEl.querySelector('span')?.textContent).toBe('Вы: ');
        expect(textEl.textContent).toBe('Вы: Привет!');
    });

    it('componentName для registerComponent', () => {
        expect(ChatItem.componentName).toBe('ChatItem');
    });
});
