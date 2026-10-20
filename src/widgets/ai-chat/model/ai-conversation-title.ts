const TITLE_LIMIT = 70;

/**
 * A conversation is named after the first user request, not the AI response.
 * Keep the title short enough for the sidebar and within the backend's 255-char limit.
 */
export function makeAiConversationTitle(instruction: string): string {
	const normalized = instruction.replace(/\s+/gu, " ").trim();
	const characters = Array.from(normalized);

	if (characters.length <= TITLE_LIMIT) {
		return normalized;
	}

	return `${characters.slice(0, TITLE_LIMIT - 1).join("").trimEnd()}…`;
}
