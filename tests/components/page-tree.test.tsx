import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import type { PageTreeBase, PageTreeNode } from "@/entities/page/lib/build-page-tree";
import { PageTree } from "@/entities/page/ui/page-tree";

type Node = PageTreeNode<PageTreeBase>;

const node = (id: string, children: Node[] = []): Node => ({
	id,
	parent_page_id: null,
	title: id,
	icon: null,
	children,
});

const tree = [node("root", [node("child", [node("grandchild")])]), node("other", [node("other-child")])];

const renderTree = (activePageId?: string) =>
	render(<PageTree pages={tree} activePageId={activePageId} onOpenPage={() => {}} />);

beforeEach(() => localStorage.clear());

describe("PageTree", () => {
	it("starts collapsed", () => {
		renderTree();

		expect(screen.getByText("root")).toBeInTheDocument();
		expect(screen.queryByText("child")).not.toBeInTheDocument();
	});

	it("opens the branches above the page being viewed, also after navigating", () => {
		const view = renderTree("grandchild");

		expect(screen.getByText("grandchild")).toBeInTheDocument();
		expect(screen.queryByText("other-child")).not.toBeInTheDocument();

		view.rerender(<PageTree pages={tree} activePageId='other-child' onOpenPage={() => {}} />);
		expect(screen.getByText("other-child")).toBeInTheDocument();
	});

	it("remembers a branch the user opened", async () => {
		const user = userEvent.setup();
		const view = renderTree();

		await user.click(screen.getAllByRole("button", { name: "Expand page" })[0]);
		expect(screen.getByText("child")).toBeInTheDocument();

		view.unmount();
		renderTree();
		expect(screen.getByText("child")).toBeInTheDocument();
	});
});
