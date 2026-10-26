import { describe, expect, it } from "vitest";
import {
	buildPageTree,
	getPageTreeHref,
	withDatabaseNodes,
} from "@/entities/page/lib/build-page-tree";

const pages = [
	{ id: "root", parent_page_id: null, title: "Root", icon: null },
	{ id: "child", parent_page_id: "root", title: "Child", icon: null },
];

describe("withDatabaseNodes", () => {
	it("nests databases under their page after child pages and drops foreign ones", () => {
		const tree = buildPageTree(
			withDatabaseNodes(pages, [
				{ id: "db-1", pageId: "root", name: "Tasks", deletedAt: null },
				{ id: "db-other", pageId: "not-in-section", name: "Other", deletedAt: null },
			]),
		);

		expect(tree.map((node) => node.id)).toEqual(["root"]);
		expect(tree[0].children.map((node) => node.id)).toEqual(["child", "db-1"]);
		expect(getPageTreeHref(tree[0].children[1])).toBe("/database/db-1");
		expect(getPageTreeHref(tree[0])).toBe("/page/root");
	});
});
