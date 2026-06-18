type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type RequestOptions = {
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
  isFormData?: boolean;
};

export class HTTPTransport {
  get(url: string, options?: RequestOptions) { return this.request('GET', url, options); }
  post(url: string, options?: RequestOptions) { return this.request('POST', url, options); }
  put(url: string, options?: RequestOptions) { return this.request('PUT', url, options); }
  delete(url: string, options?: RequestOptions) { return this.request('DELETE', url, options); }

  private request(method: HTTPMethod, url: string, options: RequestOptions = {}) {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.withCredentials = true;
      xhr.timeout = options.timeout ?? 5000;

      if (options.isFormData) {
        Object.entries(options.headers ?? {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.send(options.data as FormData);
      } else {
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.send(options.data ? JSON.stringify(options.data) : undefined);
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
        else reject(xhr.response || xhr.statusText);
      };
      xhr.onerror = () => reject('Network error');
      xhr.ontimeout = () => reject('Timeout');
    });
  }
}
