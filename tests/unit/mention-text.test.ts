import { describe, expect, it } from "vitest";

import {
	displayToTokens,
	splitDisplayMentions,
	splitMentions,
	tokensToDisplay,
} from "@/entities/comment/lib/mention-text";

const LAN = "11111111-1111-4111-8111-111111111111";
const LAN_ANH = "22222222-2222-4222-8222-222222222222";

describe("mention text", () => {
	it("turns tokens into readable text and back", () => {
		const body = `Hi @[Lan](user:${LAN}), ping @[Lan Anh](user:${LAN_ANH})`;

		const { text, mentions } = tokensToDisplay(body);

		expect(text).toBe("Hi @Lan, ping @Lan Anh");
		expect(displayToTokens(text, mentions)).toBe(body);
	});

	it("only converts names picked from suggestions, longer names first", () => {
		const mentions = [
			{ id: LAN, name: "Lan" },
			{ id: LAN_ANH, name: "Lan Anh" },
		];

		expect(displayToTokens("@Lan Anh and @Lan, not @Minh", mentions)).toBe(
			`@[Lan Anh](user:${LAN_ANH}) and @[Lan](user:${LAN}), not @Minh`,
		);
	});

	it("splits a body into text and mention parts", () => {
		expect(splitMentions(`Ask @[Lan](user:${LAN}) now`)).toEqual([
			{ type: "text", text: "Ask " },
			{ type: "mention", name: "Lan", userId: LAN },
			{ type: "text", text: " now" },
		]);
	});

	it("marks picked names in the input text so they can be colored while typing", () => {
		const mentions = [
			{ id: LAN, name: "Lan" },
			{ id: LAN_ANH, name: "Lan Anh" },
		];

		expect(splitDisplayMentions("@Lan Anh hi @Lan (a.b)", mentions)).toEqual([
			{ text: "@Lan Anh", mention: true },
			{ text: " hi ", mention: false },
			{ text: "@Lan", mention: true },
			{ text: " (a.b)", mention: false },
		]);
		expect(splitDisplayMentions("no one", [])).toEqual([{ text: "no one", mention: false }]);
	});
});
