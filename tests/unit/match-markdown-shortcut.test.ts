import { describe, expect, it } from "vitest";

import { matchMarkdownShortcut } from "@/entities/page-block/lib/match-markdown-shortcut";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

describe("matchMarkdownShortcut", () => {
	it("turns heading prefixes into the matching heading level", () => {
		expect(matchMarkdownShortcut("## ", 3)).toEqual({
			type: PageBlockType.HEADER,
			content: { text: "" },
			styleConfig: { level: 2 },
		});
		expect(matchMarkdownShortcut("# Title", 2)?.styleConfig).toEqual({ level: 1 });
	});

	it("keeps text typed after the cursor and adds type defaults", () => {
		expect(matchMarkdownShortcut("[] buy milk", 3)).toEqual({
			type: PageBlockType.TODO,
			content: { text: "buy milk", checked: false },
			styleConfig: null,
		});
		expect(matchMarkdownShortcut("1. ", 3)?.type).toBe(PageBlockType.NUMBERED_LIST);
		expect(matchMarkdownShortcut("- ", 2)?.type).toBe(PageBlockType.BULLETED_LIST);
		expect(matchMarkdownShortcut("---", 3)).toEqual({
			type: PageBlockType.DIVIDER,
			content: null,
			styleConfig: null,
		});
	});

	it("ignores prefixes that are not at the cursor", () => {
		expect(matchMarkdownShortcut("hello - ", 8)).toBeNull();
		expect(matchMarkdownShortcut("- item", 6)).toBeNull();
		expect(matchMarkdownShortcut("#hashtag", 1)).toBeNull();
	});
});
