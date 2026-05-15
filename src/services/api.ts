import axios from "axios";

/* =========================================
   API BASE URL
========================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5069/api";

/* =========================================
   AXIOS INSTANCE
========================================= */

const apiClient = axios.create({
  baseURL: API_BASE_URL,

  timeout: 10000,

  headers: {
    "Content-Type":
      "application/json",
  },
});

/* =========================================
   REQUEST INTERCEPTOR
========================================= */

apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================
   RESPONSE INTERCEPTOR
========================================= */

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    if (
      error.response?.status ===
        401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          localStorage.getItem(
            "refreshToken"
          );

        if (!refreshToken) {
          localStorage.removeItem(
            "accessToken"
          );

          localStorage.removeItem(
            "refreshToken"
          );

          window.location.href =
            "/login";

          return Promise.reject(
            error
          );
        }

        const response =
          await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {
              RefreshToken:
                refreshToken,
            }
          );

        const accessToken =
          response.data?.data
            ?.accessToken;

        const newRefreshToken =
          response.data?.data
            ?.refreshToken;

        if (accessToken) {
          localStorage.setItem(
            "accessToken",
            accessToken
          );

          if (
            newRefreshToken
          ) {
            localStorage.setItem(
              "refreshToken",
              newRefreshToken
            );
          }

          originalRequest.headers.Authorization =
            `Bearer ${accessToken}`;

          return apiClient(
            originalRequest
          );
        }
      } catch (refreshError) {
        localStorage.removeItem(
          "accessToken"
        );

        localStorage.removeItem(
          "refreshToken"
        );

        window.location.href =
          "/login";

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;