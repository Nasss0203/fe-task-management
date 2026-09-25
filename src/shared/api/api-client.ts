import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const instance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type ApiClientAuthAdapter = {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearAuth: () => Promise<void> | void;
};

let authAdapter: ApiClientAuthAdapter = {
  getAccessToken: () => null,
  setAccessToken: () => {},
  clearAuth: () => {},
};

export const configureApiClientAuth = (adapter: ApiClientAuthAdapter) => {
  authAdapter = adapter;
};

const redirectToSignIn = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/sign-in") return;

  window.location.assign("/sign-in");
};

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const request = refreshClient
    .post<{ data?: { access_token?: string } }>("/auth/refresh", {})
    .then((response) => {
      const accessToken = response.data.data?.access_token;
      if (!accessToken) {
        throw new Error("No access token returned from refresh");
      }

      return accessToken;
    });

  refreshPromise = request.finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

instance.interceptors.request.use(
  (config) => {
    const token = authAdapter.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthRefreshRequest = requestUrl.includes("/auth/refresh");
    const isAuthLogoutRequest = requestUrl.includes("/auth/logout");

    // If it's not a 401, or it's already a retry, or it's a refresh/logout request, reject normally
    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRefreshRequest ||
      isAuthLogoutRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      authAdapter.setAccessToken(accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      return instance(originalRequest) as Promise<AxiosResponse>;
    } catch (refreshError) {
      await authAdapter.clearAuth();
      redirectToSignIn();
      return Promise.reject(refreshError);
    }
  },
);

export default instance;
