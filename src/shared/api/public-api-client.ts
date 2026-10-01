import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
	throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const publicApiClient = axios.create({
	baseURL,
	timeout: 10000,
	withCredentials: false,
});

type PublicApiClientAuthAdapter = {
	getAccessToken: () => string | null;
};

let authAdapter: PublicApiClientAuthAdapter = {
	getAccessToken: () => null,
};

export const configurePublicApiClientAuth = (
	adapter: PublicApiClientAuthAdapter,
) => {
	authAdapter = adapter;
};

publicApiClient.interceptors.request.use(
	(config) => {
		const token = authAdapter.getAccessToken();

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => Promise.reject(error),
);

export default publicApiClient;
