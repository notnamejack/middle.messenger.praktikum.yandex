const RULES: Record<string, {re: RegExp; message: string }> = {
    login: {re: /^(?=.*[A-Za-z])[A-Za-z0-9_-]{3,20}$/, message: '3–20 символов, латиница. Может содержать цифры, но не состоит только из них. Без пробелов, допустимы дефис и подчёркивание.'},
    password: {re: /^(?=.*[A-Z])(?=.*\d).{8,40}$/, message: '8–40 символов, минимум одна заглавная буква и одна цифра.'},
    email: { re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Латиница, цифры и спецсимволы. Обязательны @ и точка после него. Между @ и точкой должны быть буквы.'},
    phone: { re: /^\+?\d{10,15}$/, message: '10–15 символов, цифры, может начинаться с плюса.'},
    first_name: {re: /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё-]+$/, message: 'Латиница или кириллица, первая буква заглавная. Без пробелов и цифр, из спецсимволов — только дефис.'},
    second_name: {re: /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё-]+$/, message: 'Латиница или кириллица, первая буква заглавная. Без пробелов и цифр, из спецсимволов — только дефис.'},
    message: {re: /^(?!\s*$).+$/, message: 'Не должно быть пустым'}
}
const CROSS_FIELD_RULES: Record<string, {
  message: string;
  validate: (input: HTMLInputElement, form: HTMLFormElement) => boolean;
}> = {
  password_repeat: {
    message: 'Пароли должны совпадать',
    validate: (input, form) => {
      const password = form.querySelector<HTMLInputElement>('input[name="password"]');
      return password?.value.trim() === input.value.trim();
    },
  },
};
const RELATED_FIELDS: Record<string, string[]> = {
  password: ['password_repeat'],
};

function setFieldError(input: HTMLInputElement, message: string) {
    const container = input.closest('.input, .input-horizontal');
    const errorEl = container?.querySelector<HTMLElement>('.field-error');
    input.classList.toggle('is-invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message;
}

export function validateField(input: HTMLInputElement): boolean {
  const form = input.closest('form');
  const crossRule = CROSS_FIELD_RULES[input.name];
  if (crossRule) {
    if (!(form instanceof HTMLFormElement)) return true;
    const ok = crossRule.validate(input, form);
    setFieldError(input, ok ? '' : crossRule.message);
    return ok;
  }
  const rule = RULES[input.name];
  if (!rule) return true;
  const ok = rule.re.test(input.value.trim());
  setFieldError(input, ok ? '' : rule.message);
  if (ok && form instanceof HTMLFormElement) {
    RELATED_FIELDS[input.name]?.forEach((name) => {
      const related = form.querySelector<HTMLInputElement>(`input[name="${name}"]`);
      if (related) validateField(related);
    });
  }
  return ok;
}

export function validateForm(form: HTMLFormElement): boolean {
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[name]'));
    return inputs.map(validateField).every(Boolean);
}

export function getFormValues(form: HTMLFormElement): Record<string, string> {
    return Object.fromEntries(
        Array.from(new FormData(form).entries()).map(([K, v]) => [K, String(v)])
    );
}
