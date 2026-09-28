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

export default publicApiClient;
