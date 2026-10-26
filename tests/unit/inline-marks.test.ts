import { describe, expect, it } from "vitest";

import {
	hasInlineMarks,
	parseInlineMarks,
} from "@/entities/page-block/lib/parse-inline-marks";
import {
	getShortcutMark,
	toggleInlineMark,
} from "@/entities/page-block/lib/toggle-inline-mark";

describe("parseInlineMarks", () => {
	it("parses bold, italic, strike, code and links", () => {
		expect(
			parseInlineMarks(
				"a **b** *c* ~~d~~ `e*f` [g](https://x.dev) https://y.dev/z.",
			),
		).toEqual([
			{ type: "text", text: "a " },
			{ type: "bold", children: [{ type: "text", text: "b" }] },
			{ type: "text", text: " " },
			{ type: "italic", children: [{ type: "text", text: "c" }] },
			{ type: "text", text: " " },
			{ type: "strike", children: [{ type: "text", text: "d" }] },
			{ type: "text", text: " " },
			{ type: "code", text: "e*f" },
			{ type: "text", text: " " },
			{
				type: "link",
				href: "https://x.dev",
				children: [{ type: "text", text: "g" }],
			},
			{ type: "text", text: " " },
			{
				type: "link",
				href: "https://y.dev/z",
				children: [{ type: "text", text: "https://y.dev/z" }],
			},
			{ type: "text", text: "." },
		]);
	});

	it("nests marks and keeps unclosed or escaped markers literal", () => {
		expect(parseInlineMarks("**bold *both***")).toEqual([
			{
				type: "bold",
				children: [
					{ type: "text", text: "bold " },
					{ type: "italic", children: [{ type: "text", text: "both" }] },
				],
			},
		]);
		expect(parseInlineMarks("2 * 3 = 6, \\*not\\* and **open")).toEqual([
			{ type: "text", text: "2 * 3 = 6, *not* and **open" },
		]);
	});

	it("does not turn unsafe link targets into links", () => {
		expect(hasInlineMarks("[x](javascript:alert(1))")).toBe(false);
	});
});

describe("toggleInlineMark", () => {
	it("wraps the selection and keeps it selected", () => {
		expect(toggleInlineMark("say hi", 4, 6, "bold")).toEqual({
			value: "say **hi**",
			selectionStart: 6,
			selectionEnd: 8,
		});
	});

	it("unwraps a selection that is already marked", () => {
		expect(toggleInlineMark("say **hi**", 6, 8, "bold")).toEqual({
			value: "say hi",
			selectionStart: 4,
			selectionEnd: 6,
		});
		expect(toggleInlineMark("say **hi**", 4, 10, "bold").value).toBe("say hi");
	});

	it("does not mistake bold markers for italic", () => {
		expect(toggleInlineMark("**hi**", 2, 4, "italic").value).toBe("***hi***");
	});

	it("turns the selection into a link with the URL selected", () => {
		const edit = toggleInlineMark("docs", 0, 4, "link");
		expect(edit.value).toBe("[docs](https://)");
		expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe(
			"https://",
		);
	});
});

describe("getShortcutMark", () => {
	const key = (k: string, extra = {}) => ({
		key: k,
		ctrlKey: true,
		metaKey: false,
		shiftKey: false,
		altKey: false,
		...extra,
	});

	it("maps Notion shortcuts", () => {
		expect(getShortcutMark(key("b"))).toBe("bold");
		expect(getShortcutMark(key("K", { ctrlKey: false, metaKey: true }))).toBe(
			"link",
		);
		expect(getShortcutMark(key("S", { shiftKey: true }))).toBe("strike");
		expect(getShortcutMark(key("b", { ctrlKey: false }))).toBeNull();
	});
});
