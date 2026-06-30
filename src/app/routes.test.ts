import { describe, expect, it } from 'vitest';
import { PRIVATE_ROUTES, PUBLIC_ROUTES, ROUTES, isPrivateRoute, isPublicRoute } from './routes';

describe('routes', () => {
    it('все маршруты зарегистрированы', () => {
        expect(Object.keys(ROUTES)).toEqual(
            expect.arrayContaining(['/', '/sign-up', '/messenger', '/settings', '/404', '/500']),
        );
    });

    it('isPrivateRoute', () => {
        PRIVATE_ROUTES.forEach((path) => expect(isPrivateRoute(path)).toBe(true));
        expect(isPrivateRoute('/')).toBe(false);
    });

    it('isPublicRoute', () => {
        PUBLIC_ROUTES.forEach((path) => expect(isPublicRoute(path)).toBe(true));
        expect(isPublicRoute('/messenger')).toBe(false);
    });
});
