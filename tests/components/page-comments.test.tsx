import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { groupCommentThreads } from "@/entities/comment/model/comment.queries";
import type { Comment } from "@/entities/comment/model/comment.types";
import { PageDiscussion } from "@/widgets/page-comments/ui/page-discussion";
import { RowComments } from "@/widgets/page-comments/ui/row-comments";
import { BlockCommentsButton } from "@/widgets/page-comments/ui/block-comments-button";
import { useState } from "react";
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
		if (url === "/page/page-1/comments" || url === "/database-rows/row-1/comments") return { data: { data: comments } };
		if (url === "/page/page-1/access" || url === "/page/page-db/access") return { data: { data: { effectiveAccessLevel: accessLevel } } };
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

describe("RowComments", () => {
	it("posts a task comment to the row and checks access on the database page", async () => {
		const user = userEvent.setup();
		renderWithClient(<RowComments pageId='page-db' rowId='row-1' />);

		expect(await screen.findByRole("heading", { name: "Comments" })).toBeInTheDocument();

		await user.type(screen.getByLabelText(/Add a comment/), "Needs a mobile layout{Enter}");
		await waitFor(() =>
			expect(http.post).toHaveBeenCalledWith("/database-rows/row-1/comments", {
				body: "Needs a mobile layout",
				parent_comment_id: undefined,
			}),
		);
		expect(await screen.findByText("Needs a mobile layout")).toBeInTheDocument();
		expect(http.get).toHaveBeenCalledWith("/page/page-db/access");
	});

	it("is hidden for a viewer when the task has no comments", async () => {
		accessLevel = "VIEWER";
		const { container } = renderWithClient(<RowComments pageId='page-db' rowId='row-1' />);

		await waitFor(() => expect(http.get).toHaveBeenCalledWith("/page/page-db/access"));
		expect(container).toBeEmptyDOMElement();
	});
});

describe("BlockCommentsButton", () => {
	it("shows the count from one page request and posts to the block", async () => {
		comments = [comment("c-1", { target_type: "PAGE_BLOCK", target_id: "block-1" })];
		http.get.mockImplementation(async (url: string) => {
			if (url === "/page/page-1/comments/block-counts") return { data: { data: { "block-1": comments.length } } };
			if (url === "/pageBlock/block-1/comments") return { data: { data: comments } };
			if (url === "/page/page-1/access") return { data: { data: { effectiveAccessLevel: accessLevel } } };
			throw new Error("Unexpected GET " + url);
		});
		const user = userEvent.setup();
		function Harness() {
			const [open, setOpen] = useState(false);
			return <BlockCommentsButton pageId='page-1' blockId='block-1' open={open} onOpenChange={setOpen} />;
		}
		renderWithClient(<Harness />);

		await user.click(await screen.findByRole("button", { name: "1 comments" }));
		expect(await screen.findByText("Body c-1")).toBeInTheDocument();

		await user.type(screen.getByLabelText(/Add a comment/), "Typo here{Enter}");
		await waitFor(() =>
			expect(http.post).toHaveBeenCalledWith("/pageBlock/block-1/comments", { body: "Typo here", parent_comment_id: undefined }),
		);
		expect(await screen.findByRole("button", { name: "2 comments" })).toBeInTheDocument();
	});

	it("renders no button for a viewer on a block without comments", async () => {
		accessLevel = "VIEWER";
		http.get.mockImplementation(async (url: string) => {
			if (url === "/page/page-1/comments/block-counts") return { data: { data: {} } };
			if (url === "/page/page-1/access") return { data: { data: { effectiveAccessLevel: accessLevel } } };
			throw new Error("Unexpected GET " + url);
		});
		renderWithClient(<BlockCommentsButton pageId='page-1' blockId='block-1' open={false} onOpenChange={() => {}} />);

		await waitFor(() => expect(http.get).toHaveBeenCalledWith("/page/page-1/comments/block-counts", undefined));
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});

describe("comments on a share link", () => {
	it("reads page comments with the link token and stays read-only", async () => {
		comments = [comment("c-1", { author_id: "me", author: { id: "me", username: "Me", email: "me@x" } })];
		renderWithClient(<PageDiscussion pageId='page-1' shareToken='tok' />);

		expect(await screen.findByText("Body c-1")).toBeInTheDocument();
		expect(http.get).toHaveBeenCalledWith("/page/page-1/comments", {
			headers: { "X-Page-Share-Token": "tok" },
		});
		// Không hỏi quyền page, không có ô nhập, không sửa / resolve được kể cả comment của mình
		expect(http.get).not.toHaveBeenCalledWith("/page/page-1/access");
		expect(screen.queryByLabelText(/Add a comment/)).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Comment actions" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Resolve thread" })).not.toBeInTheDocument();
	});

	it("shows block comment counts with the link token", async () => {
		comments = [comment("c-1", { target_type: "PAGE_BLOCK", target_id: "block-1" })];
		http.get.mockImplementation(async (url: string) => {
			if (url === "/page/page-1/comments/block-counts") return { data: { data: { "block-1": 1 } } };
			if (url === "/pageBlock/block-1/comments") return { data: { data: comments } };
			throw new Error("Unexpected GET " + url);
		});
		const user = userEvent.setup();
		function Harness() {
			const [open, setOpen] = useState(false);
			return <BlockCommentsButton pageId='page-1' blockId='block-1' open={open} onOpenChange={setOpen} shareToken='tok' />;
		}
		renderWithClient(<Harness />);

		await user.click(await screen.findByRole("button", { name: "1 comments" }));
		expect(await screen.findByText("Body c-1")).toBeInTheDocument();
		expect(http.get).toHaveBeenCalledWith("/page/page-1/comments/block-counts", {
			headers: { "X-Page-Share-Token": "tok" },
		});
		expect(screen.queryByLabelText(/Add a comment/)).not.toBeInTheDocument();
	});
});

describe("resolving threads", () => {
	it("hides resolved threads behind a toggle and resolves an open one", async () => {
		comments = [
			comment("done", { resolved_at: new Date().toISOString() }),
			comment("open"),
		];
		http.patch.mockImplementation(async (url: string, input: { resolved: boolean }) => {
			const id = url.split("/")[2];
			comments = comments.map((item) =>
				item.id === id ? { ...item, resolved_at: input.resolved ? new Date().toISOString() : null } : item,
			);
			return { data: { data: comments.find((item) => item.id === id) } };
		});
		const user = userEvent.setup();
		renderWithClient(<PageDiscussion pageId='page-1' />);

		expect(await screen.findByText("Body open")).toBeInTheDocument();
		expect(screen.queryByText("Body done")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Show 1 resolved" }));
		expect(screen.getByText("Body done")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Reopen thread" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Resolve thread" }));
		await waitFor(() =>
			expect(http.patch).toHaveBeenCalledWith("/comments/open/resolved", { resolved: true }),
		);
		expect(await screen.findByRole("button", { name: "Hide resolved" })).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Hide resolved" }));
		expect(await screen.findByRole("button", { name: "Show 2 resolved" })).toBeInTheDocument();
		expect(screen.queryByText("Body open")).not.toBeInTheDocument();
	});

	it("does not let a viewer resolve", async () => {
		accessLevel = "VIEWER";
		comments = [comment("open")];
		renderWithClient(<PageDiscussion pageId='page-1' />);

		expect(await screen.findByText("Body open")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Resolve thread" })).not.toBeInTheDocument();
	});
});

describe("mentions in comments", () => {
	const LAN = "11111111-1111-4111-8111-111111111111";

	it("suggests people after @, inserts the pick and sends it as a token", async () => {
		http.get.mockImplementation(async (url: string, config?: { params?: { q?: string } }) => {
			if (url === "/page/page-1/comments") return { data: { data: comments } };
			if (url === "/page/page-1/access") return { data: { data: { effectiveAccessLevel: accessLevel } } };
			if (url === "/page/page-1/mention-candidates") {
				const users = [{ id: LAN, username: "Lan", email: "lan@x", avatar_url: null }];
				return { data: { data: users.filter((u) => u.username.toLowerCase().startsWith((config?.params?.q ?? "").toLowerCase())) } };
			}
			throw new Error("Unexpected GET " + url);
		});
		comments = [comment("c-1")];
		const user = userEvent.setup();
		renderWithClient(<PageDiscussion pageId='page-1' />);

		const input = await screen.findByLabelText(/Add a comment/);
		await user.type(input, "Hi @la");

		const option = await screen.findByRole("option", { name: /Lan/ });
		expect(option).toHaveAttribute("aria-selected", "true");

		await user.keyboard("{Enter}");
		expect(input).toHaveValue("Hi @Lan ");
		// Tô màu ngay trong ô nhập: lớp phủ có span cho "@Lan", chữ textarea trong suốt
		expect(screen.getByText("@Lan", { selector: "span" })).toHaveClass("text-primary");
		expect(input).toHaveClass("text-transparent");

		await user.type(input, "check this{Enter}");
		await waitFor(() =>
			expect(http.post).toHaveBeenCalledWith("/page/page-1/comments", {
				body: `Hi @[Lan](user:${LAN}) check this`,
				parent_comment_id: undefined,
			}),
		);
	});

	it("shows mentions in a comment as highlighted names", async () => {
		comments = [comment("c-1", { body: `Thanks @[Lan](user:${LAN})!` })];
		renderWithClient(<PageDiscussion pageId='page-1' />);

		const mention = await screen.findByText("@Lan");
		expect(mention.tagName).toBe("SPAN");
		expect(mention.parentElement).toHaveTextContent("Thanks @Lan!");
	});
});
