import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicPageBlock } from "@/entities/public-site/model/public-site.types";
import { PublicPageBlockList } from "@/widgets/public-page/ui/PublicPageBlockList";

vi.mock("@/entities/public-site/lib/build-public-page-block-tree", () => ({
	buildPublicPageBlockTree: (blocks: unknown[]) => blocks,
}));
vi.mock("@/widgets/page-block/ui/read-only-page-block-renderer", () => ({
	ReadOnlyPageBlockRenderer: () => (
		<p>
			Block text <a href='/docs'>docs link</a>
		</p>
	),
}));

const blocks = [{ id: "b1" }] as unknown as PublicPageBlock[];

describe("public page block click", () => {
	it("asks for edit access when a block is clicked, but not when a link is", () => {
		const onBlockClick = vi.fn();
		render(<PublicPageBlockList blocks={blocks} onBlockClick={onBlockClick} />);

		fireEvent.click(screen.getByRole("link", { name: "docs link" }));
		expect(onBlockClick).not.toHaveBeenCalled();

		fireEvent.click(screen.getByText(/Block text/));
		expect(onBlockClick).toHaveBeenCalledTimes(1);
	});

	it("does nothing when the site does not allow updates", () => {
		render(<PublicPageBlockList blocks={blocks} />);
		expect(() => fireEvent.click(screen.getByText(/Block text/))).not.toThrow();
	});
});
