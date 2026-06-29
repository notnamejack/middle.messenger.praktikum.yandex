import { describe, expect, it } from 'vitest';
import Input from './index';

describe('Input', () => {
    it('рендерит label и input с атрибутами', () => {
        const component = new Input({
            id: 'login',
            name: 'login',
            label: 'Логин',
            type: 'text',
            value: 'admin',
        });

        const el = component.element()!;

        expect(el.classList.contains('input')).toBe(true);
        expect(el.querySelector('label')?.textContent).toBe('Логин');
        expect(el.querySelector('label')?.getAttribute('for')).toBe('login');

        const field = el.querySelector('input') as HTMLInputElement;
        expect(field.id).toBe('login');
        expect(field.name).toBe('login');
        expect(field.type).toBe('text');
        expect(field.value).toBe('admin');
    });

    it('есть контейнер ошибки', () => {
        const component = new Input({
            id: 'pwd',
            name: 'password',
            label: 'Пароль',
            type: 'password',
        });

        expect(component.element()?.querySelector('.field-error')).toBeTruthy();
    });

    it('setProps обновляет value', () => {
        const component = new Input({
            id: 'login',
            name: 'login',
            label: 'Логин',
            type: 'text',
            value: 'old',
        });

        component.setProps({ value: 'new' });

        const field = component.element()?.querySelector('input') as HTMLInputElement;
        expect(field.value).toBe('new');
    });
});
