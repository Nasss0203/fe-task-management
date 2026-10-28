import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { groupCommentThreads } from "@/entities/comment/model/comment.queries";
import type { Comment } from "@/entities/comment/model/comment.types";
import { PageDiscussion } from "@/widgets/page-comments/ui/page-discussion";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/features/auth/model/use-user", () => ({ useUser: () => ({ user: { id: "me" } }) }));

function comment(id: string, overrides: Partial<Comment> = {}): Comment {
	return {
		id,
		page_id: "page-1",
		target_type: "PAGE",
		target_id: "page-1",
		parent_comment_id: null,
		body: `Body ${id}`,
		author_id: "other",
		author: { id: "other", username: "Lan", email: "lan@x" },
		resolved_at: null,
		edited_at: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		...overrides,
	};
}

let comments: Comment[];
let accessLevel: string | null;

beforeEach(() => {
	vi.resetAllMocks();
	comments = [];
	accessLevel = "EDITOR";
	http.get.mockImplementation(async (url: string) => {
		if (url === "/page/page-1/comments") return { data: { data: comments } };
		if (url === "/page/page-1/access") return { data: { data: { effectiveAccessLevel: accessLevel } } };
		throw new Error("Unexpected GET " + url);
	});
	http.post.mockImplementation(async (_url: string, input: { body: string; parent_comment_id?: string }) => {
		const created = comment(`c-${comments.length + 1}`, {
			body: input.body,
			parent_comment_id: input.parent_comment_id ?? null,
			author_id: "me",
			author: { id: "me", username: "Me", email: "me@x" },
		});
		comments = [...comments, created];
		return { data: { data: created } };
	});
});

describe("groupCommentThreads", () => {
	it("puts replies under their root and drops replies without one", () => {
		const threads = groupCommentThreads([
			comment("a"),
			comment("b"),
			comment("a1", { parent_comment_id: "a" }),
			comment("x1", { parent_comment_id: "missing" }),
		]);

		expect(threads.map((thread) => thread.root.id)).toEqual(["a", "b"]);
		expect(threads[0].replies.map((reply) => reply.id)).toEqual(["a1"]);
	});
});

describe("PageDiscussion", () => {
	it("shows comments under the title and lets an editor post and reply", async () => {
		comments = [comment("c-1")];
		const user = userEvent.setup();
		renderWithClient(<PageDiscussion pageId='page-1' />);

		expect(await screen.findByText("Body c-1")).toBeInTheDocument();

		await user.type(screen.getByLabelText(/Add a comment/), "New note");
		await user.click(screen.getByRole("button", { name: "Comment" }));
		await waitFor(() =>
			expect(http.post).toHaveBeenCalledWith("/page/page-1/comments", { body: "New note", parent_comment_id: undefined }),
		);
		expect(await screen.findByText("New note")).toBeInTheDocument();

		await user.click(screen.getAllByRole("button", { name: "Reply" })[0]);
		await user.type(screen.getByLabelText("Reply…"), "Thanks");
		await user.keyboard("{Control>}{Enter}{/Control}");
		await waitFor(() =>
			expect(http.post).toHaveBeenCalledWith("/page/page-1/comments", { body: "Thanks", parent_comment_id: "c-1" }),
		);
	});

	it("is read-only for a viewer and hides actions on other people's comments", async () => {
		accessLevel = "VIEWER";
		comments = [comment("c-1")];
		renderWithClient(<PageDiscussion pageId='page-1' />);

		expect(await screen.findByText("Body c-1")).toBeInTheDocument();
		expect(screen.queryByLabelText(/Add a comment/)).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Reply" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Comment actions" })).not.toBeInTheDocument();
	});

	it("starts from an Add comment button on a page without comments", async () => {
		const user = userEvent.setup();
		renderWithClient(<PageDiscussion pageId='page-1' />);

		await user.click(await screen.findByRole("button", { name: "Add comment" }));
		const input = screen.getByLabelText(/Add a comment/);
		expect(input).toHaveFocus();

		await user.click(screen.getByRole("button", { name: "Cancel" }));
		expect(screen.getByRole("button", { name: "Add comment" })).toBeInTheDocument();
	});

	it("renders nothing for a viewer on a page without comments", async () => {
		accessLevel = "VIEWER";
		const { container } = renderWithClient(<PageDiscussion pageId='page-1' />);

		await waitFor(() => expect(http.get).toHaveBeenCalledWith("/page/page-1/access"));
		expect(container).toBeEmptyDOMElement();
	});

	it("collapses older threads and replies so the page content stays close", async () => {
		comments = [
			comment("t1"),
			comment("t2"),
			comment("t3"),
			comment("t4"),
			comment("r1", { parent_comment_id: "t4" }),
			comment("r2", { parent_comment_id: "t4" }),
			comment("r3", { parent_comment_id: "t4" }),
		];
		const user = userEvent.setup();
		renderWithClient(<PageDiscussion pageId='page-1' />);

		expect(await screen.findByText("Body t4")).toBeInTheDocument();
		expect(screen.getByText("Body t3")).toBeInTheDocument();
		expect(screen.queryByText("Body t1")).not.toBeInTheDocument();
		expect(screen.queryByText("Body r1")).not.toBeInTheDocument();
		expect(screen.getByText("Body r3")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Show 2 earlier comments" }));
		expect(screen.getByText("Body t1")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Show 1 earlier reply" }));
		expect(screen.getByText("Body r1")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Show less" }));
		expect(screen.queryByText("Body t1")).not.toBeInTheDocument();
	});
});
