import { describe, expect, it } from "vitest";

import {
	displayToTokens,
	markDisplayMentions,
	mentionOrdinalAt,
	splitDisplayMentions,
	storedMentionsInOrder,
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

const AN = "33333333-3333-4333-8333-333333333333";
const PAGE_ONE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PAGE_TWO = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const meetingOne = { id: PAGE_ONE, name: "Meeting", kind: "page" as const };
const meetingTwo = { id: PAGE_TWO, name: "Meeting", kind: "page" as const };

describe("displayToTokens boundaries and order", () => {
	it("leaves a longer word that starts with a picked name as text", () => {
		expect(displayToTokens("hi @An and @Anh", [{ id: AN, name: "An" }])).toBe(
			`hi @[An](user:${AN}) and @Anh`,
		);
	});

	it("leaves an @ inside a word as text", () => {
		expect(
			displayToTokens("mail an@An.vn", [{ id: AN, name: "An" }]),
		).toBe("mail an@An.vn");
	});

	it("ends a mention at punctuation", () => {
		expect(displayToTokens("thanks @An, ok", [{ id: AN, name: "An" }])).toBe(
			`thanks @[An](user:${AN}), ok`,
		);
	});

	it("keeps each page with the same title on its own link", () => {
		expect(
			displayToTokens("@Meeting then @Meeting", [meetingOne, meetingTwo]),
		).toBe(`@[page](page:${PAGE_ONE}) then @[page](page:${PAGE_TWO})`);
	});

	it("keeps a person and a page that share a name", () => {
		expect(
			displayToTokens("@Nam and @Nam", [
				{ id: PAGE_ONE, name: "Nam", kind: "page" },
				{ id: AN, name: "Nam" },
			]),
		).toBe(`@[page](page:${PAGE_ONE}) and @[Nam](user:${AN})`);
	});

	it("reuses a name typed again only when it points to one target", () => {
		expect(displayToTokens("@An @An", [{ id: AN, name: "An" }])).toBe(
			`@[An](user:${AN}) @[An](user:${AN})`,
		);
		expect(
			displayToTokens("@Meeting @Meeting @Meeting", [meetingOne, meetingTwo]),
		).toBe(
			`@[page](page:${PAGE_ONE}) @[page](page:${PAGE_TWO}) @Meeting`,
		);
	});

	it("marks only the mentions that will be saved", () => {
		expect(
			markDisplayMentions("@An, an@An.vn @Anh", [{ id: AN, name: "An" }]),
		).toEqual([
			{ text: "@An", mention: true },
			{ text: ", an@An.vn @Anh", mention: false },
		]);
	});

	it("reads stored mentions in the order they appear and finds the slot of a new one", () => {
		const body = `@[page](page:${PAGE_TWO}) to @[Nam](user:${AN}) and @[page](page:${PAGE_ONE})`;

		expect(
			storedMentionsInOrder(body, {
				[PAGE_ONE]: { title: "Meeting" },
				[PAGE_TWO]: { title: "Meeting" },
			}),
		).toEqual([meetingTwo, { id: AN, name: "Nam" }, meetingOne]);
		expect(mentionOrdinalAt("@Meeting x @Meeting", 11, "Meeting")).toBe(1);
		expect(mentionOrdinalAt("@Meeting x @Meeting", 0, "Meeting")).toBe(0);
	});
});
