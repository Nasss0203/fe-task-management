import {
	clearStoredAuth,
	getStoredAccessToken,
	getStoredRefreshToken,
	setStoredAccessToken,
	setStoredRefreshToken,
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
	timeout: 1000,
	withCredentials: true,
});

type RefreshResponse = {
	data: {
		access_token: string;
		refresh_token?: string;
	};
};

type RetryRequestConfig = InternalAxiosRequestConfig & {
	_retry?: boolean;
};

let refreshPromise: Promise<string> | null = null;

const redirectToSignIn = () => {
	if (typeof window === "undefined") return;
	if (window.location.pathname === "/sign-in") return;

	window.location.assign("/");
};

const refreshAccessToken = async () => {
	if (!refreshPromise) {
		refreshPromise = axios
			.post<RefreshResponse>(
				`${baseURL}/auth/refresh`,
				{
					refresh_token: getStoredRefreshToken(),
				},
				{
					withCredentials: true,
				},
			)
			.then((response) => {
				const { access_token, refresh_token } = response.data.data;

				setStoredAccessToken(access_token);

				if (refresh_token) {
					setStoredRefreshToken(refresh_token);
				}

				return access_token;
			})
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
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
		const isAuthRefreshRequest = requestUrl.includes("/auth/refresh");
		const isAuthLogoutRequest = requestUrl.includes("/auth/logout");

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
			originalRequest.headers.Authorization = `Bearer ${accessToken}`;

			return instance(originalRequest) as Promise<AxiosResponse>;
		} catch (refreshError) {
			clearStoredAuth();
			redirectToSignIn();
			return Promise.reject(refreshError);
		}
	},
);

export default instance;
