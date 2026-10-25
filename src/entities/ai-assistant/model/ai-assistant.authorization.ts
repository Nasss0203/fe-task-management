import axios from "axios";

/** Resource denial is separate from session authentication and transient errors. */
export function isAiAuthorizationDenial(error: unknown): boolean {
	return axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404);
}
