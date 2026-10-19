import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import type { PublicPageBlock } from "@/entities/public-site/model/public-site.types";
import { PublicPageBlockList } from "@/widgets/public-page/ui/PublicPageBlockList";

vi.mock("@/shared/ui/mermaid-diagram", () => ({
	MermaidDiagram: ({ code }: { code: string }) => <pre data-testid='mermaid'>{code}</pre>,
}));

function block(id: string, order: number, type: PageBlockType, content: Record<string, unknown>, style_config: Record<string, unknown> | null = null) {
	return { id, type, content, style_config, order_index: order, parent_block_id: null, data_config: null, is_open: false } as unknown as PublicPageBlock;
}

describe("public page new block types", () => {
	it("numbers consecutive numbered list items and restarts after another block", () => {
		render(
			<PublicPageBlockList
				blocks={[
					block("a", 0, PageBlockType.NUMBERED_LIST, { text: "First" }),
					block("b", 1, PageBlockType.NUMBERED_LIST, { text: "Second" }),
					block("c", 2, PageBlockType.BULLETED_LIST, { text: "Bullet" }),
					block("d", 3, PageBlockType.NUMBERED_LIST, { text: "Again" }),
				]}
			/>,
		);

		const markers = screen.getAllByText(/^(\d+\.|•)$/).map((node) => node.textContent);
		expect(markers).toEqual(["1.", "2.", "•", "1."]);
	});

	it("lists headings in a table of contents that link to their anchors", () => {
		render(
			<PublicPageBlockList
				blocks={[
					block("toc", 0, PageBlockType.TABLE_OF_CONTENTS, {}),
					block("h1", 1, PageBlockType.HEADER, { text: "Intro" }, { level: 1 }),
					block("h2", 2, PageBlockType.HEADER, { text: "Setup" }, { level: 2 }),
					block("h3", 3, PageBlockType.HEADER, { text: "" }, { level: 3 }),
				]}
			/>,
		);

		const nav = screen.getByRole("navigation", { name: "Table of contents" });
		const links = Array.from(nav.querySelectorAll("a"));

		expect(links.map((link) => link.textContent)).toEqual(["Intro", "Setup"]);
		expect(links[1]).toHaveAttribute("href", "#block-h2");
		expect(links[1].closest("li")).toHaveClass("pl-4");
		expect(screen.getByRole("heading", { name: "Setup" })).toHaveAttribute("id", "block-h2");
	});

	it("renders callout tone, sandboxed embeds and mermaid source", () => {
		const { container } = render(
			<PublicPageBlockList
				blocks={[
					block("a", 0, PageBlockType.CALLOUT, { text: "Careful", icon: "⚠️" }, { tone: "warning" }),
					block("b", 1, PageBlockType.TWEET, { url: "https://x.com/jack/status/20" }),
					block("c", 2, PageBlockType.EMBED, { url: "https://evil.example.com/x" }),
					block("d", 3, PageBlockType.MERMAID, { text: "graph TD; A-->B" }),
				]}
			/>,
		);

		expect(screen.getByText("Careful").closest("div")).toHaveClass("bg-amber-500/10");
		const frames = container.querySelectorAll("iframe");
		expect(frames).toHaveLength(1);
		expect(frames[0]).toHaveAttribute("src", "https://platform.twitter.com/embed/Tweet.html?id=20");
		expect(frames[0].getAttribute("sandbox")).toContain("allow-scripts");
		expect(screen.getByText("This embed link is not supported.")).toBeInTheDocument();
		expect(screen.getByTestId("mermaid")).toHaveTextContent("graph TD; A-->B");
	});
});
