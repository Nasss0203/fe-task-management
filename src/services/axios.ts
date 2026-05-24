import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
	throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

const instance = axios.create({
	baseURL,
	timeout: 1000,
	withCredentials: true,
});

instance.interceptors.request.use(
	(config) => {
		const token =
			typeof window !== "undefined"
				? localStorage.getItem("access_token")
				: null;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => Promise.reject(error),
);

instance.interceptors.response.use(
	(response) => response,
	(error) => Promise.reject(error),
);

export default instance;
