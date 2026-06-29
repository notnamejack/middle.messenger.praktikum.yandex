import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTPTransport } from './HTTPTransport';

class MockXMLHttpRequest {
    static last: MockXMLHttpRequest | undefined;

    open = vi.fn();
    send = vi.fn();
    setRequestHeader = vi.fn();
    withCredentials = false;
    timeout = 0;
    status = 200;
    response = '{}';
    statusText = 'OK';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    ontimeout: (() => void) | null = null;

    constructor() {
        MockXMLHttpRequest.last = this;
    }
}

describe('HTTPTransport', () => {
    const http = new HTTPTransport();

    beforeEach(() => {
        MockXMLHttpRequest.last = undefined;
        vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('GET: open + withCredentials', async () => {
        const promise = http.get('/api/test');
        MockXMLHttpRequest.last!.onload?.();
        await promise;

        expect(MockXMLHttpRequest.last!.open).toHaveBeenCalledWith('GET', '/api/test');
        expect(MockXMLHttpRequest.last!.withCredentials).toBe(true);
    });

    it('POST: JSON body + Content-Type', async () => {
        const promise = http.post('/api/test', { data: { login: 'a' } });
        MockXMLHttpRequest.last!.onload?.();
        await promise;

        expect(MockXMLHttpRequest.last!.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(MockXMLHttpRequest.last!.send).toHaveBeenCalledWith(JSON.stringify({ login: 'a' }));
    });

    it('resolve при 2xx', async () => {
        const promise = http.get<string>('/ok');
        MockXMLHttpRequest.last!.response = 'hello';
        MockXMLHttpRequest.last!.onload?.();
        await expect(promise).resolves.toBe('hello');
    });

    it('reject при 4xx', async () => {
        const promise = http.get('/fail');
        MockXMLHttpRequest.last!.status = 404;
        MockXMLHttpRequest.last!.response = 'Not found';
        MockXMLHttpRequest.last!.onload?.();
        await expect(promise).rejects.toBe('Not found');
    });

    it('reject при network error', async () => {
        const promise = http.get('/fail');
        MockXMLHttpRequest.last!.onerror?.();
        await expect(promise).rejects.toBe('Network error');
    });

    it('reject при timeout', async () => {
        const promise = http.get('/slow', { timeout: 100 });
        MockXMLHttpRequest.last!.ontimeout?.();
        await expect(promise).rejects.toBe('Timeout');
    });

    it('FormData: без JSON Content-Type', async () => {
        const fd = new FormData();
        fd.append('file', 'x');
        const promise = http.put('/upload', { data: fd, isFormData: true });
        MockXMLHttpRequest.last!.onload?.();
        await promise;

        expect(MockXMLHttpRequest.last!.send).toHaveBeenCalledWith(fd);
        expect(MockXMLHttpRequest.last!.setRequestHeader).not.toHaveBeenCalledWith('Content-Type', 'application/json');
    });
});
