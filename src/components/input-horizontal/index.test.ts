import { describe, expect, it } from 'vitest';
import InputHorizontal from './index';

const baseProps = {
  id: 'email',
  name: 'email',
  label: 'Почта',
  type: 'email',
};

describe('InputHorizontal', () => {
    it('рендерит горизонтальный инпут', () => {
        const component = new InputHorizontal({
            ...baseProps,
            placeholder: 'Введите email',
            value: 'test@mail.ru',
        });

        const el = component.element()!;

        expect(el.classList.contains('input-horizontal')).toBe(true);
        expect(el.querySelector('label')?.textContent).toBe('Почта');

        const field = el.querySelector('input') as HTMLInputElement;
        expect(field.placeholder).toBe('Введите email');
        expect(field.value).toBe('test@mail.ru');
        expect(field.disabled).toBe(false);
    });

    it('disabled добавляет атрибут', () => {
        const component = new InputHorizontal({
            ...baseProps,
            disabled: true,
        });

        const field = component.element()?.querySelector('input') as HTMLInputElement;
        expect(field.disabled).toBe(true);
    });

    it('есть .field-error', () => {
        const component = new InputHorizontal(baseProps);
        expect(component.element()?.querySelector('.field-error')).toBeTruthy();
    });

    it('componentName для registerComponent', () => {
        expect(InputHorizontal.componentName).toBe('InputHorizontal');
    });
});
