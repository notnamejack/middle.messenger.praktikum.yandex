const RULES: Record<string, {re: RegExp; message: string }> = {
    login: {re: /^(?=.*[A-Za-z])[A-Za-z0-9*-]{3,20}$/, message: '3–20 символов, латиница. Может содержать цифры, но не состоит только из них. Без пробелов, допустимы дефис и подчёркивание.'},
    password: {re: /^(?=.*[A-Z])(?=.*\d).{8,40}$/, message: '8–40 символов, минимум одна заглавная буква и одна цифра.'},
    email: { re: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Латиница, цифры и спецсимволы. Обязательны @ и точка после него. Между @ и точкой должны быть буквы.'},
    phone: { re: /^\+?\d{10,15}$/, message: '10–15 символов, цифры, может начинаться с плюса.'},
    first_name: {re: /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё-]+$/, message: 'Латиница или кириллица, первая буква заглавная. Без пробелов и цифр, из спецсимволов — только дефис.'},
    second_name: {re: /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё-]+$/, message: 'Латиница или кириллица, первая буква заглавная. Без пробелов и цифр, из спецсимволов — только дефис.'},
    message: {re: /^(?!\s*$).+$/, message: 'Не должно быть пустым'}
}

function setFieldError(input: HTMLInputElement, message: string) {
    const container = input.closest('.input, .input-horizontal');
    const errorEl = container?.querySelector<HTMLElement>('.field-error');
    input.classList.toggle('is-invalid', Boolean(message));
    if (errorEl) errorEl.textContent = message;
}

export function validateField(input: HTMLInputElement): boolean {
    const rule = RULES[input.name];
    if(!rule) return true;
    const value = input.value.trim();
    const ok = rule.re.test(value);
    setFieldError(input, ok ? '' : rule.message);
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