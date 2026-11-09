import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
	StorageFile,
	WorkspaceStorage,
} from "@/entities/attachment/model/attachment.types";
import StorageSection from "@/features/workspace-settings/ui/sections/StorageSection";

const api = vi.hoisted(() => ({
	getWorkspaceStorage: vi.fn(),
	listWorkspaceFiles: vi.fn(),
	bulkDeleteWorkspaceFiles: vi.fn(),
}));
vi.mock("@/entities/attachment/api/attachment-api", () => ({ attachmentApi: api }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const usage = (canManageAll: boolean): WorkspaceStorage => ({
	workspace: { bytes: 3 * 1024 * 1024, count: 2 },
	byType: {
		image: { bytes: 1024 * 1024, count: 1 },
		document: { bytes: 2 * 1024 * 1024, count: 1 },
		other: { bytes: 0, count: 0 },
	},
	mine: { bytes: 1024 * 1024, count: 1 },
	canManageAll,
});

const files: StorageFile[] = [
	{
		id: "f1",
		fileName: "report.pdf",
		mimeType: "application/pdf",
		size: 2 * 1024 * 1024,
		type: "document",
		status: "IN_USE",
		createdAt: "2026-11-01T00:00:00.000Z",
		uploadedBy: { id: "u2", username: "binh", avatarUrl: null },
		location: { pageId: "p1", pageTitle: "" },
	},
	{
		id: "f2",
		fileName: "photo.png",
		mimeType: "image/png",
		size: 1024 * 1024,
		type: "image",
		status: "ORPHANED",
		createdAt: "2026-11-02T00:00:00.000Z",
		uploadedBy: { id: "u1", username: "an", avatarUrl: null },
		location: null,
	},
];

function renderSection(canManageAll: boolean) {
	api.getWorkspaceStorage.mockResolvedValue(usage(canManageAll));
	api.listWorkspaceFiles.mockResolvedValue({
		data: files,
		meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
	});
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	return render(
		<QueryClientProvider client={client}>
			<StorageSection workspaceId='ws-1' />
		</QueryClientProvider>,
	);
}

afterEach(() => vi.clearAllMocks());

describe("StorageSection", () => {
	it("shows the owner every uploader and the workspace usage", async () => {
		renderSection(true);

		expect(await screen.findByText("report.pdf")).toBeInTheDocument();
		expect(screen.getByRole("columnheader", { name: "Uploaded by" })).toBeInTheDocument();
		expect(screen.getByText("binh")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Untitled" })).toHaveAttribute("href", "/page/p1");
		expect(await screen.findByText("3.0 MB")).toBeInTheDocument();
		expect(api.listWorkspaceFiles).toHaveBeenCalledWith(
			"ws-1",
			expect.objectContaining({ sort: "size_desc", page: 1 }),
			expect.anything(),
		);
	});

	it("shows a member their own usage without the uploader column", async () => {
		renderSection(false);

		expect(await screen.findByText(/You uploaded 1\.0 MB/)).toBeInTheDocument();
		expect(screen.queryByRole("columnheader", { name: "Uploaded by" })).not.toBeInTheDocument();
	});

	it("deletes the selected files after confirmation and warns about files in use", async () => {
		const user = userEvent.setup();
		api.bulkDeleteWorkspaceFiles.mockResolvedValue({ deletedCount: 2 });
		renderSection(true);

		await user.click(await screen.findByRole("checkbox", { name: "Select all files" }));
		await user.click(screen.getByRole("button", { name: "Delete 2 files" }));

		const dialog = await screen.findByRole("alertdialog");
		expect(within(dialog).getByText(/frees 3\.0 MB/)).toBeInTheDocument();
		expect(within(dialog).getByText(/1 of them is still used in a page/)).toBeInTheDocument();

		await user.click(within(dialog).getByRole("button", { name: "Delete" }));

		await waitFor(() =>
			expect(api.bulkDeleteWorkspaceFiles).toHaveBeenCalledWith("ws-1", ["f1", "f2"]),
		);
	});
});
