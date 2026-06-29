import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getUser = vi.fn();
const destroySpy = vi.fn();

class StubPage {
    destroy = destroySpy;
    element() {
        const el = document.createElement('div');
        el.className = 'stub-page';
        return el;
    }
}

vi.mock('../api/auth', () => ({
    AuthAPI: { getUser },
}));

vi.mock('./routes', () => ({
    ROUTES: {
        '/': StubPage,
        '/sign-up': StubPage,
        '/messenger': StubPage,
        '/settings': StubPage,
    },
    isPrivateRoute: (path: string) => ['/messenger', '/settings'].includes(path),
}));

describe('app router', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="app"></div>';
        window.history.replaceState({}, '', '/');
        getUser.mockReset();
        destroySpy.mockReset();
    });

    afterEach(() => {
        vi.resetModules();
    });

    it('navigate вызывает pushState', async () => {
        getUser.mockRejectedValue(new Error('401'));
        const { navigate } = await import('./index');
        const pushState = vi.spyOn(window.history, 'pushState');

        navigate('/messenger');

        expect(pushState).toHaveBeenCalledWith({ path: '/messenger' }, '', '/messenger');
    });

    it('неавторизованный на /messenger → /', async () => {
        getUser.mockRejectedValue(new Error('401'));
        const { renderPage } = await import('./index');

        await renderPage('/messenger');

        expect(window.location.pathname).toBe('/');
        expect(document.querySelector('#app .stub-page')).toBeTruthy();
    });

    it('авторизованный на / → /messenger', async () => {
        getUser.mockResolvedValue({ id: 1, login: 'test' });
        const { renderPage } = await import('./index');

        await renderPage('/');

        expect(window.location.pathname).toBe('/messenger');
    });

    it('destroy предыдущей страницы при переходе', async () => {
        getUser.mockResolvedValue({ id: 1 });
        const { renderPage } = await import('./index');

        await renderPage('/messenger');
        await renderPage('/settings');

        expect(destroySpy).toHaveBeenCalled();
    });
});
