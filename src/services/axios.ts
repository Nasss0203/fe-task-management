import {
	clearStoredAuth,
	getStoredAccessToken,
	setStoredAccessToken,
} from "@/lib/auth-storage";
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

type RetryRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

const redirectToSignIn = () => {
	if (typeof window === "undefined") return;
	if (window.location.pathname === "/sign-in") return;

	window.location.assign("/");
};

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token as string);
		}
	});
	failedQueue = [];
};

const refreshAccessToken = async () => {
	// Call Next.js Route Handler which has the HttpOnly refresh token
	const response = await axios.post<{
		success: boolean;
		data?: { access_token: string };
	}>(
		"/api/auth/refresh",
		{},
		{
			// Bypass the baseURL of this instance because we're calling our Next.js server
			baseURL: window.location.origin,
			withCredentials: true,
		},
	);

	const access_token = response.data.data?.access_token;
	if (!access_token) {
		throw new Error("No access token returned from refresh proxy");
	}

	setStoredAccessToken(access_token);
	return access_token;
};

instance.interceptors.request.use(
	(config) => {
		const token = getStoredAccessToken();

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
		const isAuthRefreshRequest = requestUrl.includes("/api/auth/refresh");
		const isAuthLogoutRequest = requestUrl.includes("/api/auth/logout");

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

		// If we are already refreshing, queue the request until refresh finishes
		if (isRefreshing) {
			try {
				const token = await new Promise<string>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				});
				originalRequest.headers.Authorization = `Bearer ${token}`;
				return instance(originalRequest);
			} catch (err) {
				return Promise.reject(err);
			}
		}

		originalRequest._retry = true;
		isRefreshing = true;

		try {
			const accessToken = await refreshAccessToken();
			processQueue(null, accessToken);
			originalRequest.headers.Authorization = `Bearer ${accessToken}`;

			return instance(originalRequest) as Promise<AxiosResponse>;
		} catch (refreshError) {
			processQueue(refreshError, null);
			await clearStoredAuth();
			redirectToSignIn();
			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	},
);

export default instance;
