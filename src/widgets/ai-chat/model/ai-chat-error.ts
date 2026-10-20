import axios from "axios";

import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import { AiModificationActionError } from "./ai-modification-action";

/** Safe, actionable feedback for AI requests; never expose raw server errors. */
export function getAiChatErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof AiModificationActionError) return error.message;
	if (axios.isAxiosError(error)) {
		switch (error.response?.status) {
			case 401:
				return "Your session has expired. Please sign in again.";
			case 403:
				return "You don't have permission to access this page or workspace.";
			case 409:
				return "This AI draft is no longer current, or it has already been handled. Generate a new modification plan before applying changes.";
			case 502:
				return "The AI service is temporarily unavailable. Please try again.";
		}
	}
	return getFriendlyApiErrorMessage(error, fallback);
}
