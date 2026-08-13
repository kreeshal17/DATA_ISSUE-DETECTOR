import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

let isRefreshing = false;

let refreshSubscribers: (() => void)[] = [];

function subscribeTokenRefresh(callback: () => void) {
  refreshSubscribers.push(callback);
}

function onRefreshFinished() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 once
    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If another request is already refreshing,
    // wait for it to finish.
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // Browser automatically sends the
      // HttpOnly refresh_token cookie.
      await api.post("/api/auth/refresh/");

      isRefreshing = false;

      // Retry requests waiting for refresh
      onRefreshFinished();

      // Retry original request
      return api(originalRequest);

    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];

      // Refresh token is also invalid/expired
      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);

export default api;