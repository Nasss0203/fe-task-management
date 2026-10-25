import axios from "axios";

import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import { AiModificationActionError } from "./ai-modification-action";

export { isAiAuthorizationDenial } from "@/entities/ai-assistant/model/ai-assistant.authorization";

export function getUnifiedAskError(error: unknown): { kind: "error" | "timeout"; message: string } {
	if (axios.isAxiosError(error)) {
		if (!error.response && ["ECONNABORTED", "ETIMEDOUT", "ERR_NETWORK"].includes(error.code ?? "")) return {
			kind: "timeout", message: "The outcome is unknown. The server may still save a draft. Check conversation history before sending again.",
		};
		if (error.response?.status === 400) return { kind: "error", message: "The request could not be accepted. Check the instruction and conversation scope, then choose another chat if needed." };
		if (error.response?.status === 404) return { kind: "error", message: "The conversation or page is unavailable. Check your selection or start a new chat." };
	}
	return { kind: "error", message: getAiChatErrorMessage(error, "Unable to complete this AI request.") };
}

/** Safe, actionable feedback for AI requests; never expose raw server errors. */
export function getAiChatErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof AiModificationActionError) return error.message;
	if (axios.isAxiosError(error)) {
		switch (error.response?.status) {
			case 401:
				return "Your session has expired. Please sign in again.";
			case 403:
				return "You don't have permission to access this page or workspace.";
			case 404:
				return "This conversation, page or draft is no longer available. Select another chat or start a new one.";
			case 409:
				return "This AI draft is no longer current, or it has already been handled. Generate a new modification plan before applying changes.";
			case 502:
				return "The AI service is temporarily unavailable. Please try again.";
		}
	}
	return getFriendlyApiErrorMessage(error, fallback);
}
