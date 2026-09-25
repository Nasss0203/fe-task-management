import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import { usePageBlocks, useSharedPageBlocks } from "@/entities/page-block/model/page-block.queries";
import { PageBlockType, type PageBlock } from "@/entities/page-block/model/page-block.types";
import { pageKeys } from "@/entities/page/model/page.queries";
import { PageBlockList } from "@/widgets/page-block-editor/ui/page-block-list";
import { makePageBlock } from "../utils/page-block-fixture";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }));
const toastError = vi.hoisted(() => vi.fn());
vi.mock("@/shared/api/api-client", () => ({ default: http }));
vi.mock("sonner", () => ({ toast: { error: toastError } }));
vi.mock("@/widgets/database-view/ui/database-view-block", () => ({
	DatabaseViewBlock: () => <div data-testid='editable-database' />,
}));
vi.mock("@uiw/react-codemirror", () => ({
	oneDark: [],
	default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
		<textarea aria-label='Code' value={value} onChange={(event) => onChange(event.target.value)} />
	),
}));

const token = "editor-token-A";
const pageId = "page-1";
const headers = { headers: { "X-Page-Share-Token": token } };
let persisted: PageBlock[];
let nextId: number;

function envelope(data: unknown) {
	return { data: { data: structuredClone(data) } };
}

function Surface({ shareToken, canEdit = true }: { shareToken?: string; canEdit?: boolean }) {
	const normal = usePageBlocks(pageId, !shareToken);
	const shared = useSharedPageBlocks(pageId, shareToken, Boolean(shareToken));
	const query = shareToken ? shared : normal;
	if (!query.data) return <div>Loading blocks</div>;
	return <PageBlockList pageId={pageId} blocks={buildPageBlockTree(query.data)} canEdit={canEdit} shareToken={shareToken} />;
}

beforeEach(() => {
	vi.resetAllMocks();
	vi.stubGlobal("ResizeObserver", class {
		observe() {}
		unobserve() {}
		disconnect() {}
	});
	persisted = [makePageBlock()];
	nextId = 2;
	http.get.mockImplementation(async (url: string) => {
		if (url === "/pageBlock/page/page-1") return envelope(persisted);
		if (url === "/databases/db-1") return envelope({
			id: "db-1", properties: [{ id: "title", name: "Name", type: "TITLE", isHideable: false, position: 0 }],
		});
		if (url === "/databases/db-1/views/view-1") return envelope({ id: "view-1", name: "Shared database", properties: [] });
		if (url === "/databases/db-1/rows") return envelope([{ id: "row-1", values: [{ propertyId: "title", value: "Read-only row" }] }]);
		throw new Error("Unexpected GET " + url);
	});
	http.post.mockImplementation(async (url: string, input: Partial<PageBlock>) => {
		if (url !== "/pageBlock") throw new Error("Unexpected POST " + url);
		const block = makePageBlock({ ...input, id: "block-" + nextId++, order_index: persisted.length });
		persisted.push(block);
		return envelope(block);
	});
	http.patch.mockImplementation(async (url: string, input: Partial<PageBlock>) => {
		const index = persisted.findIndex((block) => url === "/pageBlock/" + block.id);
		if (index < 0) throw new Error("Unexpected PATCH " + url);
		const payload = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
		persisted[index] = { ...persisted[index], ...payload };
		return envelope(persisted[index]);
	});
	http.delete.mockImplementation(async (url: string) => {
		persisted = persisted.filter((block) => url !== "/pageBlock/" + block.id);
	});
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

describe("shared PageBlock editor", () => {
	it.each([token, undefined])("saves and reloads text through real editor/hooks/API (token %s)", async (shareToken) => {
		const view = renderWithClient(<Surface shareToken={shareToken} />);
		const input = await screen.findByDisplayValue("Original text");
		fireEvent.change(input, { target: { value: "Persisted edit" } });
		fireEvent.blur(input);
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith(
			"/pageBlock/block-1", expect.objectContaining({ content: { text: "Persisted edit" } }),
			{ headers: shareToken ? { "X-Page-Share-Token": shareToken } : undefined },
		));
		await waitFor(() => expect(http.get.mock.calls.filter(([url]) => url === "/pageBlock/page/page-1").length).toBeGreaterThan(1));
		view.unmount();
		renderWithClient(<Surface shareToken={shareToken} />);
		expect(await screen.findByDisplayValue("Persisted edit")).toBeInTheDocument();
	});

	it("creates from an empty page, deletes using the action menu, and reloads empty", async () => {
		persisted = [];
		const user = userEvent.setup();
		const view = renderWithClient(<Surface shareToken={token} />);
		await user.click(await screen.findByRole("button", { name: "Add block" }));
		expect(screen.queryByRole("option", { name: /Table view/ })).not.toBeInTheDocument();
		await user.click(screen.getByRole("option", { name: /^Text / }));
		await screen.findByRole("textbox");
		expect(http.post).toHaveBeenCalledWith("/pageBlock", expect.objectContaining({ page_id: pageId, type: "TEXT" }), headers);
		await user.click(screen.getByRole("button", { name: "Block actions" }));
		await user.click(screen.getByRole("option", { name: /Delete/ }));
		await screen.findByRole("button", { name: /Press/ });
		expect(http.delete).toHaveBeenCalledWith("/pageBlock/block-2", headers);
		view.unmount();
		renderWithClient(<Surface shareToken={token} />);
		await screen.findByRole("button", { name: /Press/ });
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
	});

	it("duplicates and converts blocks through token-aware action menus", async () => {
		const user = userEvent.setup();
		renderWithClient(<Surface shareToken={token} />);
		await user.click(await screen.findByRole("button", { name: "Block actions" }));
		await user.click(screen.getByRole("option", { name: /Duplicate/ }));
		await waitFor(() => expect(screen.getAllByDisplayValue("Original text")).toHaveLength(2));
		expect(http.post).toHaveBeenCalledWith("/pageBlock", expect.objectContaining({ after_block_id: "block-1", content: { text: "Original text" } }), headers);
		await user.click(screen.getAllByRole("button", { name: "Block actions" })[0]);
		await user.click(screen.getByRole("option", { name: /Turn into/ }));
		await user.click(screen.getByRole("option", { name: "Heading" }));
		await screen.findByPlaceholderText("Heading 1");
		expect(http.patch).toHaveBeenCalledWith("/pageBlock/block-1", expect.objectContaining({ type: "HEADER" }), headers);
	});

	it("creates after a row and hides database creation in its menu", async () => {
		const user = userEvent.setup();
		renderWithClient(<Surface shareToken={token} />);
		await user.click(await screen.findByRole("button", { name: "Add block" }));
		expect(screen.queryByRole("option", { name: /Table view/ })).not.toBeInTheDocument();
		await user.click(screen.getByRole("option", { name: /Heading 1/ }));
		await waitFor(() => expect(http.post).toHaveBeenCalledWith("/pageBlock", expect.objectContaining({ after_block_id: "block-1", type: "HEADER" }), headers));
	});

	it("converts with slash commands without exposing database transformation", async () => {
		const user = userEvent.setup();
		renderWithClient(<Surface shareToken={token} />);
		const input = await screen.findByDisplayValue("Original text");
		fireEvent.change(input, { target: { value: "/" } });
		expect(screen.queryByRole("option", { name: /Table view/ })).not.toBeInTheDocument();
		await user.click(screen.getByRole("option", { name: /Heading 1/ }));
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith("/pageBlock/block-1", expect.objectContaining({ type: "HEADER" }), headers));
		expect(http.post).not.toHaveBeenCalled();
	});

	it("passes the token through Enter split and Backspace deletion", async () => {
		renderWithClient(<Surface shareToken={token} />);
		const input = await screen.findByDisplayValue("Original text");
		(input as HTMLTextAreaElement).setSelectionRange(13, 13);
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(screen.getAllByRole("textbox")).toHaveLength(2));
		expect(http.post).toHaveBeenCalledWith("/pageBlock", expect.objectContaining({ after_block_id: "block-1" }), headers);
		fireEvent.keyDown(screen.getAllByRole("textbox")[1], { key: "Backspace" });
		await waitFor(() => expect(http.delete).toHaveBeenCalledWith("/pageBlock/block-2", headers));
	});

	it("passes the token through nested toggle children and automatic child creation", async () => {
		persisted = [makePageBlock({ type: PageBlockType.TOGGLE, is_open: true })];
		renderWithClient(<Surface shareToken={token} />);
		await waitFor(() => expect(screen.getAllByRole("textbox")).toHaveLength(2));
		expect(http.post).toHaveBeenCalledWith("/pageBlock", expect.objectContaining({ parent_block_id: "block-1" }), headers);
		const childInput = screen.getAllByRole("textbox")[1];
		fireEvent.change(childInput, { target: { value: "Nested edit" } });
		fireEvent.blur(childInput);
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith("/pageBlock/block-2", expect.objectContaining({ content: { text: "Nested edit" } }), headers));
	});

	it("keeps VIEWER blocks and empty pages read-only", async () => {
		const view = renderWithClient(<Surface shareToken={token} canEdit={false} />);
		await screen.findByText("Original text");
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Add block" })).not.toBeInTheDocument();
		view.unmount();
		persisted = [];
		renderWithClient(<Surface shareToken={token} canEdit={false} />);
		await screen.findByText("Trang này chưa có nội dung");
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(http.post).not.toHaveBeenCalled();
		expect(http.patch).not.toHaveBeenCalled();
		expect(http.delete).not.toHaveBeenCalled();
	});

	it.each([false, true])("renders shared database read-only (nested %s) with token reads", async (nested) => {
		const database = makePageBlock({ id: "db-block", type: PageBlockType.DATABASE_VIEW, data_config: { database_id: "db-1", view_id: "view-1" }, parent_block_id: nested ? "block-1" : null });
		persisted = nested ? [makePageBlock({ type: PageBlockType.TOGGLE, is_open: true }), database] : [database];
		renderWithClient(<Surface shareToken={token} />);
		const table = await screen.findByRole("table");
		expect(within(table).getByText("Read-only row")).toBeInTheDocument();
		expect(within(table).queryByRole("textbox")).not.toBeInTheDocument();
		expect(within(table).queryByRole("button")).not.toBeInTheDocument();
		expect(screen.queryByTestId("editable-database")).not.toBeInTheDocument();
		for (const url of ["/databases/db-1", "/databases/db-1/rows", "/databases/db-1/views/view-1"]) {
			expect(http.get).toHaveBeenCalledWith(url, expect.objectContaining(headers));
		}
		expect(http.post).not.toHaveBeenCalled();
		expect(http.patch).not.toHaveBeenCalled();
	});

	it("retains the normal database editor and normal database creation option", async () => {
		persisted = [makePageBlock({ type: PageBlockType.DATABASE_VIEW, data_config: { database_id: "db-1", view_id: "view-1" } })];
		const user = userEvent.setup();
		renderWithClient(<Surface />);
		await screen.findByTestId("editable-database");
		await user.click(screen.getByRole("button", { name: "Add block" }));
		expect(screen.getByRole("option", { name: /Table view/ })).toBeInTheDocument();
	});

	it.each([PageBlockType.IMAGE, PageBlockType.FILE, PageBlockType.VIDEO])("blocks %s upload even with cached normal workspace metadata", async (type) => {
		persisted = [makePageBlock({ type, content: {} })];
		const { container, queryClient } = renderWithClient(<Surface shareToken={token} />);
		queryClient.setQueryData(pageKeys.detail(pageId), { workspace_id: "cached-workspace" });
		expect(await screen.findByRole("button", { name: "Upload" })).toBeDisabled();
		const fileInput = container.querySelector<HTMLInputElement>("input[type=file]")!;
		expect(fileInput).toBeDisabled();
		fireEvent.change(fileInput, { target: { files: [new File(["data"], "sample.bin")] } });
		expect(http.post).not.toHaveBeenCalled();
		expect(http.get.mock.calls.some(([url]) => url === "/page/page-1")).toBe(false);
	});

	it("allows image embedding and captions through PageBlock writes", async () => {
		persisted = [makePageBlock({ type: PageBlockType.IMAGE, content: {} })];
		const user = userEvent.setup();
		renderWithClient(<Surface shareToken={token} />);
		await user.click(await screen.findByRole("button", { name: "Embed link" }));
		await user.type(screen.getByPlaceholderText("Paste an image URL..."), "https://example.com/image.png");
		await user.click(screen.getByRole("button", { name: "Embed" }));
		const caption = await screen.findByPlaceholderText("Add a caption...");
		fireEvent.change(caption, { target: { value: "Shared caption" } });
		fireEvent.blur(caption);
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith("/pageBlock/block-1", expect.objectContaining({ content: expect.objectContaining({ caption: "Shared caption" }) }), headers));
		expect(http.post).not.toHaveBeenCalled();
	});

	it("autosaves code with the token and cancels pending edits when switching tokens", async () => {
		persisted = [makePageBlock({ type: PageBlockType.CODE, content: { text: "const x = 1;", language: "typescript" } })];
		const view = renderWithClient(<Surface shareToken={token} />);
		const editor = await screen.findByRole("textbox", { name: "Code" });
		fireEvent.change(editor, { target: { value: "const x = 2;" } });
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith("/pageBlock/block-1", expect.objectContaining({ content: expect.objectContaining({ text: "const x = 2;" }) }), headers));
		await waitFor(() => expect(http.get.mock.calls.length).toBeGreaterThan(1));
		http.patch.mockClear();
		vi.useFakeTimers();
		fireEvent.change(editor, { target: { value: "Unsaved token A edit" } });
		view.rerender(<Surface shareToken='editor-token-B' />);
		await act(async () => { await vi.advanceTimersByTimeAsync(1000); });
		expect(http.patch).not.toHaveBeenCalled();
		vi.useRealTimers();
		expect(await screen.findByRole("textbox", { name: "Code" })).toHaveValue("const x = 2;");
	});

	it("reports rejected saves without creating access requests or memberships", async () => {
		http.patch.mockRejectedValueOnce({ response: { status: 403, data: { message: "You do not have required permissions" } } });
		renderWithClient(<Surface shareToken={token} />);
		const input = await screen.findByDisplayValue("Original text");
		fireEvent.change(input, { target: { value: "Denied edit" } });
		fireEvent.blur(input);
		await waitFor(() => expect(toastError).toHaveBeenCalledOnce());
		expect(persisted[0].content).toEqual({ text: "Original text" });
		expect(http.post).not.toHaveBeenCalled();
	});

	it.each([PageBlockType.HEADER, PageBlockType.QUOTE, PageBlockType.TODO])("saves %s text with the link token", async (type) => {
		persisted = [makePageBlock({ type })];
		renderWithClient(<Surface shareToken={token} />);
		const input = await screen.findByDisplayValue("Original text");
		fireEvent.change(input, { target: { value: "Edited block" } });
		fireEvent.blur(input);
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith(
			"/pageBlock/block-1",
			expect.objectContaining({ content: expect.objectContaining({ text: "Edited block" }) }),
			headers,
		));
	});

	it("saves a to-do checkbox with the link token", async () => {
		persisted = [makePageBlock({ type: PageBlockType.TODO, content: { text: "Task", checked: false } })];
		renderWithClient(<Surface shareToken={token} />);
		fireEvent.click(await screen.findByRole("checkbox"));
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith(
			"/pageBlock/block-1", expect.objectContaining({ content: { text: "Task", checked: true } }), headers,
		));
	});

	it("edits simple-table cells as PageBlock content, without database writes", async () => {
		persisted = [makePageBlock({
			type: PageBlockType.TABLE_SIMPLE,
			content: { rows: [{ id: "row", cells: [{ id: "cell", text: "Original cell" }] }], hasHeaderRow: false, hasHeaderColumn: false },
		})];
		renderWithClient(<Surface shareToken={token} />);
		const input = await screen.findByDisplayValue("Original cell");
		fireEvent.change(input, { target: { value: "Edited cell" } });
		fireEvent.blur(input);
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith(
			"/pageBlock/block-1",
			expect.objectContaining({ content: expect.objectContaining({ rows: [{ id: "row", cells: [{ id: "cell", text: "Edited cell" }] }] }) }),
			headers,
		));
		expect(http.post).not.toHaveBeenCalled();
	});

	it("keeps bookmark metadata lookup separate from the token-aware block write", async () => {
		persisted = [makePageBlock({ type: PageBlockType.BOOKMARK, content: {} })];
		http.post.mockResolvedValueOnce(envelope({ url: "https://example.com/", title: "Example", description: null, siteName: null, faviconUrl: null, imageUrl: null }));
		renderWithClient(<Surface shareToken={token} />);
		const input = await screen.findByPlaceholderText("Paste a link...");
		fireEvent.change(input, { target: { value: "https://example.com/" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith(
			"/pageBlock/block-1", expect.objectContaining({ content: expect.objectContaining({ title: "Example" }) }), headers,
		));
		expect(http.post).toHaveBeenCalledWith("/pageBlock/bookmark/metadata", { url: "https://example.com/" });
	});

	it("embeds a video URL with the link token, without uploading an attachment", async () => {
		persisted = [makePageBlock({ type: PageBlockType.VIDEO, content: {} })];
		const user = userEvent.setup();
		renderWithClient(<Surface shareToken={token} />);
		await user.click(await screen.findByRole("button", { name: "Embed link" }));
		const input = screen.getByPlaceholderText("Paste a YouTube or video URL...");
		fireEvent.change(input, { target: { value: "https://example.com/video.mp4" } });
		fireEvent.keyDown(input, { key: "Enter" });
		await waitFor(() => expect(http.patch).toHaveBeenCalledWith(
			"/pageBlock/block-1", expect.objectContaining({ content: expect.objectContaining({ url: "https://example.com/video.mp4" }) }), headers,
		));
		expect(http.post).not.toHaveBeenCalled();
	});
});
