import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

type RequestMeta = {
  startTime: number;
  method: string;
  url: string;
};

const requestMeta = new WeakMap<
  InternalAxiosRequestConfig,
  RequestMeta
>();

function resolveRequestPath(config: InternalAxiosRequestConfig): string {
  const base = config.baseURL?.replace(/\/$/, "") ?? "";
  const path = config.url ?? "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${base}${path}`;
  }
  return `${base}/${path}`;
}

function formatDuration(ms: number): string {
  return `${Math.round(ms)}ms`;
}

function isTimeoutError(error: AxiosError): boolean {
  return (
    error.code === "ECONNABORTED" ||
    error.message.toLowerCase().includes("timeout")
  );
}

/** Temporary diagnostics — attach to axios instances for request timing logs. */
export function attachApiDiagnosticInterceptor(
  client: AxiosInstance
): void {
  client.interceptors.request.use(
    (config) => {
      const method = (config.method ?? "GET").toUpperCase();
      const url = resolveRequestPath(config);
      requestMeta.set(config, {
        startTime: performance.now(),
        method,
        url,
      });
      console.log(`[API] ${method} ${url} START`);
      return config;
    },
    (error) => {
      console.error("[API] Request setup FAILED", error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      const meta = requestMeta.get(response.config);
      const duration = meta
        ? formatDuration(performance.now() - meta.startTime)
        : "unknown";
      const method = meta?.method ?? (response.config.method ?? "GET").toUpperCase();
      const url = meta?.url ?? resolveRequestPath(response.config);
      requestMeta.delete(response.config);
      console.log(
        `[API] ${method} ${url} END status=${response.status} duration=${duration}`
      );
      return response;
    },
    (error: AxiosError) => {
      const config = error.config;
      const meta = config ? requestMeta.get(config) : undefined;
      const duration = meta
        ? formatDuration(performance.now() - meta.startTime)
        : "unknown";
      const method = meta?.method ?? (config?.method ?? "GET").toUpperCase();
      const url = meta?.url ?? (config ? resolveRequestPath(config) : "unknown");
      if (config) {
        requestMeta.delete(config);
      }

      if (isTimeoutError(error)) {
        console.error(
          `[API] ${method} ${url} TIMEOUT duration=${duration} timeout=${config?.timeout ?? "unknown"}ms`
        );
      } else {
        const status = error.response?.status ?? "network";
        console.error(
          `[API] ${method} ${url} FAILED status=${status} duration=${duration}`,
          error.message
        );
      }

      return Promise.reject(error);
    }
  );
}
