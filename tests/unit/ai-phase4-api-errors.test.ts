import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { getAiChatErrorMessage } from "@/widgets/ai-chat/model/ai-chat-error";

function statusError(status: number): AxiosError {
	return new AxiosError("remote error", "ERR_BAD_RESPONSE", undefined, undefined, {
		status,
		data: { message: "Sensitive internal error" },
	} as never);
}

describe("Phase 4 AI Chat API errors", () => {
	it.each([
		[401, "session has expired"],
		[403, "don't have permission"],
			[502, "AI service is temporarily unavailable"],
			[409, "no longer current"],
	])("maps HTTP %s to safe actionable feedback", (status, expected) => {
		const message = getAiChatErrorMessage(statusError(status), "Generic failure");
		expect(message).toContain(expected);
		expect(message).not.toContain("Sensitive internal error");
	});

	it("keeps an ordinary fallback for network errors and unknown API statuses", () => {
		expect(getAiChatErrorMessage(new Error("private details"), "Unable to generate a preview."))
			.toBe("Unable to generate a preview.");
		expect(getAiChatErrorMessage(statusError(429), "Please retry later."))
			.toBe("Please retry later.");
	});
});
