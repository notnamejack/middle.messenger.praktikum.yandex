const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

type HttpVerb = (typeof METHODS)[keyof typeof METHODS];

type RequestOptions = {
  method?: HttpVerb;
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
  isFormData?: boolean;
};

type HTTPMethod = <R = string>(url: string, options?: RequestOptions) => Promise<R>;

export class HTTPTransport {
  get: HTTPMethod = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.GET });

  post: HTTPMethod = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.POST });

  put: HTTPMethod = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.PUT });

  delete: HTTPMethod = (url, options = {}) =>
    this.request(url, { ...options, method: METHODS.DELETE });

  private request<R = string>(url: string, options: RequestOptions): Promise<R> {
    const {
      method = METHODS.GET,
      headers,
      data,
      timeout = 5000,
      isFormData,
    } = options;

    return new Promise<R>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.withCredentials = true;
      xhr.timeout = timeout;

      if (isFormData) {
        Object.entries(headers ?? {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.send(data as FormData);
      } else {
        const requestHeaders = { 'Content-Type': 'application/json', ...headers };
        Object.entries(requestHeaders).forEach(([k, v]) => xhr.setRequestHeader(k, v));
        xhr.send(data ? JSON.stringify(data) : undefined);
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response as R);
        } else {
          reject(xhr.response || xhr.statusText);
        }
      };
      xhr.onerror = () => reject('Network error');
      xhr.ontimeout = () => reject('Timeout');
    });
  }
}
