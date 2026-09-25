import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SharedPageDetail from "@/app/(dashboard)/share/[token]/page";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import {
	pageShareKeys,
	useSharedWithMePages,
} from "@/entities/page-share/model/page-share.queries";
import type {
	PageAccess,
	PageShareInvitationResult,
	ResolvedPageShareLink,
	SharedPage,
} from "@/entities/page-share/model/page-share.types";
import { pageKeys } from "@/entities/page/model/page.queries";
import type { Page } from "@/entities/page/model/page.types";
import {
	useWorkspaceAccess,
	useWorkspaces,
	workspaceKeys,
} from "@/entities/workspace/model/workspace.queries";
import type {
	Workspace,
	WorkspaceAccess,
} from "@/entities/workspace/model/workspace.types";
import { renderWithClient } from "../utils/test-utils";

const mocks = vi.hoisted(() => ({
	get: vi.fn(),
	post: vi.fn(),
	token: "signed-token",
}));

vi.mock("@/shared/api/api-client", () => ({ default: mocks }));
vi.mock("next/navigation", () => ({ useParams: () => ({ token: mocks.token }) }));
vi.mock("@/widgets/page-block-editor/ui/page-block-list", () => ({
	PageBlockList: ({ canEdit, shareToken }: { canEdit: boolean; shareToken?: string }) => (
		<div data-testid='page-blocks' data-can-edit={String(canEdit)} data-share-token={shareToken} />
	),
}));

const pageId = "invited-page";
const shareId = "direct-share";
const workspaceId = "invited-workspace";
const resolveUrl = "/page/share/signed-token";
const accessUrl = `/page/${pageId}/access`;
const requestUrl = `/page/${pageId}/access-requests`;
const workspaceAccessUrl = `/workspaces/${workspaceId}/access`;
const invitationResult: PageShareInvitationResult = { pageId, shareId };
const workspace: Workspace = {
	id: workspaceId,
	name: "Invited workspace",
	slug: "invited",
	layoutMode: "DEFAULT",
	createdAt: "2026-01-01",
	updatedAt: "2026-01-01",
	deletedAt: null,
	deletedBy: null,
	createdBy: "owner",
};
const page: Page = {
	id: pageId,
	workspace_id: workspaceId,
	teamspace_id: null,
	parent_page_id: null,
	title: "Invited page content",
	slug: null,
	icon: null,
	cover_url: null,
	is_template: false,
	canEdit: true,
	created_by: "owner",
	createdAt: "2026-01-01",
	updatedAt: "2026-01-01",
	deletedAt: null,
	deletedBy: null,
};

let resolved: ResolvedPageShareLink;
let normalAccess: PageAccess;
let workspaces: Workspace[];
let workspaceAccess: WorkspaceAccess;
let sharedPages: SharedPage[];
let pendingRequest: boolean;
let getOverrides: Map<string, () => unknown>;

function envelope<T>(data: T) {
	return { data: { data } };
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

function respondToInvitation(status: "ACCEPTED" | "REJECTED") {
	resolved = { ...resolved, invitation: { ...resolved.invitation!, status } };
	if (status === "ACCEPTED") {
		normalAccess = { effectiveAccessLevel: resolved.invitation!.accessLevel };
		workspaces = [workspace];
		sharedPages = [{ ...page, accessLevel: resolved.invitation!.accessLevel }];
	}
	return envelope(invitationResult);
}

function WorkspaceQueries() {
	const { data: items = [] } = useWorkspaces();
	const { data: access } = useWorkspaceAccess(items[0]?.id ?? "");
	const { data: shared = [] } = useSharedWithMePages();
	return (
		<>
			<div data-testid='membership'>{access?.membership_type ?? "NONE"}</div>
			<div data-testid='shared-pages'>{shared.map((item) => item.title).join(",")}</div>
		</>
	);
}

function renderShare(withWorkspaceQueries = false) {
	return renderWithClient(
		<>
			{withWorkspaceQueries && <WorkspaceQueries />}
			<SharedPageDetail />
		</>,
	);
}

function expectNoRequestAccess() {
	expect(screen.queryByRole("button", { name: "Request access" })).not.toBeInTheDocument();
	expect(mocks.get.mock.calls.map(([url]) => url)).not.toContain(`${requestUrl}/me`);
	expect(mocks.post.mock.calls.map(([url]) => url)).not.toContain(requestUrl);
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.token = "signed-token";
	vi.spyOn(console, "log").mockImplementation(() => {});
	resolved = {
		pageId,
		linkAccessLevel: null,
		invitation: { shareId, status: "PENDING", accessLevel: "EDITOR" },
	};
	normalAccess = { effectiveAccessLevel: null };
	workspaces = [];
	workspaceAccess = {
		user_id: "recipient",
		workspace_id: workspaceId,
		membership_type: "GUEST",
		roles: [],
		permissions: [],
	};
	sharedPages = [];
	pendingRequest = false;
	getOverrides = new Map();
	mocks.get.mockImplementation(async (url: string) => {
		if (getOverrides.has(url)) return envelope(await getOverrides.get(url)!());
		if (url.startsWith("/page/share/")) return envelope(resolved);
		if (url === accessUrl) return envelope(normalAccess);
		if (url === "/workspaces") return envelope(workspaces);
		if (url === workspaceAccessUrl) return envelope(workspaceAccess);
		if (url === "/page-shares/shared-with-me") return envelope(sharedPages);
		if (url === `/page/${pageId}`) return envelope(page);
		if (url === `/pageBlock/page/${pageId}`) return envelope([]);
		if (url === `${requestUrl}/me`) {
			return envelope(pendingRequest ? { id: "request-1", status: "PENDING" } : null);
		}
		throw new Error(`Unexpected GET ${url}`);
	});
	mocks.post.mockImplementation(async (url: string) => {
		if (url === "/page/share-links/accept") return respondToInvitation("ACCEPTED");
		if (url === "/page/share-links/reject") return respondToInvitation("REJECTED");
		if (url === requestUrl) {
			pendingRequest = true;
			return envelope({ id: "request-1", pageId, status: "PENDING" });
		}
		throw new Error(`Unexpected POST ${url}`);
	});
});

afterEach(() => vi.restoreAllMocks());

describe("direct page invitation", () => {
	it.each([
		["VIEWER", "Viewer"],
		["COMMENTER", "Commenter"],
		["EDITOR", "Editor"],
		["FULL_ACCESS", "Full access"],
	] as const)("shows Accept/Reject and %s before Request Access", async (level, label) => {
		resolved.invitation!.accessLevel = level;
		pendingRequest = true;
		renderShare();
		expect(await screen.findByRole("button", { name: "Accept" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "Reject" })).toBeEnabled();
		expect(screen.getByText(`Access: ${label}`)).toBeInTheDocument();
		expect(screen.queryByTestId("page-blocks")).not.toBeInTheDocument();
		expectNoRequestAccess();
	});

	it("accepts by token, refreshes newly created Guest membership and renders Page after normal access", async () => {
		const user = userEvent.setup();
		const { queryClient } = renderShare(true);
		const invalidate = vi.spyOn(queryClient, "invalidateQueries");
		await screen.findByRole("button", { name: "Accept" });
		expect(screen.getByTestId("membership")).toHaveTextContent("NONE");
		act(() => {
			queryClient.setQueryData(pageKeys.detail(pageId), { ...page, title: "Old cached page" });
			queryClient.setQueryData(pageBlockKeys.byPage(pageId), []);
		});
		await user.click(screen.getByRole("button", { name: "Accept" }));
		expect(mocks.post).toHaveBeenCalledExactlyOnceWith("/page/share-links/accept", { token: "signed-token" });
		await screen.findByRole("heading", { name: page.title });
		await waitFor(() => expect(screen.getByTestId("membership")).toHaveTextContent("GUEST"));
		expect(screen.getByTestId("shared-pages")).toHaveTextContent(page.title);
		expect(queryClient.getQueryData(pageShareKeys.resolve(mocks.token))).toMatchObject({ invitation: { status: "ACCEPTED" } });
		for (const queryKey of [
			workspaceKeys.all,
			pageShareKeys.resolve(mocks.token),
			pageShareKeys.sharedWithMe(),
			pageShareKeys.byPage(pageId),
			pageShareKeys.access(pageId),
			pageKeys.detail(pageId),
			pageBlockKeys.byPage(pageId),
		]) {
			expect(invalidate).toHaveBeenCalledWith({ queryKey });
		}
		expect(mocks.get.mock.calls.filter(([url]) => url === resolveUrl)).toHaveLength(2);
		expect(mocks.get.mock.calls.filter(([url]) => url === accessUrl)).toHaveLength(2);
		expect(mocks.get.mock.calls.filter(([url]) => url === "/workspaces")).toHaveLength(2);
		expect(mocks.get.mock.calls.map(([url]) => url)).toContain(workspaceAccessUrl);
		for (const url of [`/page/${pageId}`, `/pageBlock/page/${pageId}`]) {
			expect(mocks.get).toHaveBeenCalledWith(url, expect.objectContaining({ headers: undefined }));
		}
		expect(screen.getByTestId("page-blocks")).not.toHaveAttribute("data-share-token");
		expectNoRequestAccess();
	});

	it.each(["GUEST", "MEMBER"] as const)("refreshes existing %s access without changing membership in frontend", async (membership) => {
		workspaces = [workspace];
		workspaceAccess = { ...workspaceAccess, membership_type: membership, roles: membership === "MEMBER" ? ["MEMBER"] : [] };
		renderShare(true);
		await screen.findByRole("button", { name: "Accept" });
		await waitFor(() => expect(screen.getByTestId("membership")).toHaveTextContent(membership));
		await userEvent.click(screen.getByRole("button", { name: "Accept" }));
		await screen.findByRole("heading", { name: page.title });
		expect(screen.getByTestId("membership")).toHaveTextContent(membership);
		expect(mocks.get.mock.calls.filter(([url]) => url === workspaceAccessUrl)).toHaveLength(2);
		expectNoRequestAccess();
	});

	it("does not show Request Access or page content while accepted access refresh is delayed", async () => {
		const refreshedAccess = deferred<PageAccess>();
		getOverrides.set(accessUrl, () => resolved.invitation?.status === "ACCEPTED" ? refreshedAccess.promise : normalAccess);
		renderShare();
		await userEvent.click(await screen.findByRole("button", { name: "Accept" }));
		await screen.findByRole("heading", { name: "Invitation accepted" });
		expect(screen.getByText("Checking page access...")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Check access" })).toBeDisabled();
		expect(screen.queryByTestId("page-blocks")).not.toBeInTheDocument();
		expectNoRequestAccess();
		await act(async () => refreshedAccess.resolve({ effectiveAccessLevel: "EDITOR" }));
		await screen.findByRole("heading", { name: page.title });
		expectNoRequestAccess();
	});

	it("an ACCEPTED invitation alone does not grant Page access or trigger another request", async () => {
		resolved.invitation!.status = "ACCEPTED";
		renderShare();
		await screen.findByRole("heading", { name: "Invitation accepted" });
		expect(screen.queryByTestId("page-blocks")).not.toBeInTheDocument();
		expectNoRequestAccess();
		normalAccess = { effectiveAccessLevel: "VIEWER" };
		await userEvent.click(screen.getByRole("button", { name: "Check access" }));
		await screen.findByRole("heading", { name: page.title });
		expect(mocks.post).not.toHaveBeenCalled();
	});

	it("can retry an access refresh failure after Accept without accepting twice", async () => {
		getOverrides.set(accessUrl, () => {
			if (resolved.invitation?.status === "ACCEPTED") throw new Error("Network error");
			return normalAccess;
		});
		renderShare();
		await userEvent.click(await screen.findByRole("button", { name: "Accept" }));
		expect(await screen.findByRole("alert")).toHaveTextContent("Unable to check page access");
		expectNoRequestAccess();
		getOverrides.delete(accessUrl);
		await userEvent.click(screen.getByRole("button", { name: "Try again" }));
		await screen.findByRole("heading", { name: page.title });
		expect(mocks.post).toHaveBeenCalledTimes(1);
	});

	it("rejects by token, refreshes invitation and remains declined without granting access", async () => {
		const { queryClient } = renderShare(true);
		const invalidate = vi.spyOn(queryClient, "invalidateQueries");
		await userEvent.click(await screen.findByRole("button", { name: "Reject" }));
		await screen.findByRole("heading", { name: "Invitation declined" });
		expect(mocks.post).toHaveBeenCalledExactlyOnceWith("/page/share-links/reject", { token: "signed-token" });
		expect(invalidate).toHaveBeenCalledWith({ queryKey: pageShareKeys.resolve(mocks.token) });
		expect(invalidate).toHaveBeenCalledWith({ queryKey: pageShareKeys.sharedWithMe() });
		expect(invalidate).not.toHaveBeenCalledWith({ queryKey: workspaceKeys.all });
		expect(invalidate).not.toHaveBeenCalledWith({ queryKey: pageShareKeys.access(pageId) });
		expect(screen.queryByTestId("page-blocks")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Reject" })).not.toBeInTheDocument();
		expectNoRequestAccess();
	});

	it("shows declined on reopening an already rejected invitation", async () => {
		resolved.invitation!.status = "REJECTED";
		renderShare();
		await screen.findByRole("heading", { name: "Invitation declined" });
		expect(screen.queryByTestId("page-blocks")).not.toBeInTheDocument();
		expectNoRequestAccess();
		expect(mocks.post).not.toHaveBeenCalled();
	});

	it.each(["Accept", "Reject"] as const)("disables both buttons during %s and prevents duplicate submissions", async (action) => {
		const pending = deferred<ReturnType<typeof envelope<PageShareInvitationResult>>>();
		mocks.post.mockImplementationOnce(() => pending.promise);
		const user = userEvent.setup();
		renderShare();
		await user.click(await screen.findByRole("button", { name: action }));
		const active = screen.getByRole("button", { name: `${action}ing...` });
		const other = screen.getByRole("button", { name: action === "Accept" ? "Reject" : "Accept" });
		expect(active).toBeDisabled();
		expect(other).toBeDisabled();
		await user.click(active);
		await user.click(other);
		expect(mocks.post).toHaveBeenCalledTimes(1);
		await act(async () => pending.resolve(respondToInvitation(action === "Accept" ? "ACCEPTED" : "REJECTED")));
		await screen.findByRole("heading", { name: action === "Accept" ? page.title : "Invitation declined" });
	});

	it.each(["Accept", "Reject"] as const)("shows a recoverable %s error", async (action) => {
		mocks.post.mockRejectedValueOnce(new Error("Invitation operation failed"));
		renderShare();
		await userEvent.click(await screen.findByRole("button", { name: action }));
		expect(await screen.findByRole("alert")).toHaveTextContent(`Unable to ${action.toLowerCase()} invitation`);
		expect(screen.getByRole("button", { name: "Accept" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "Reject" })).toBeEnabled();
		expectNoRequestAccess();
		await userEvent.click(screen.getByRole("button", { name: action }));
		await screen.findByRole("heading", { name: action === "Accept" ? page.title : "Invitation declined" });
		expect(mocks.post).toHaveBeenCalledTimes(2);
	});

	it("does not reuse the declined state for a different share token", async () => {
		const { rerender } = renderWithClient(<SharedPageDetail />);
		await userEvent.click(await screen.findByRole("button", { name: "Reject" }));
		await screen.findByRole("heading", { name: "Invitation declined" });
		mocks.token = "different-token";
		resolved = { ...resolved, invitation: { shareId: "different-invitation", accessLevel: "VIEWER", status: "PENDING" } };
		rerender(<SharedPageDetail />);
		await screen.findByRole("button", { name: "Accept" });
		expect(screen.queryByText("Invitation declined")).not.toBeInTheDocument();
		expectNoRequestAccess();
	});
});

describe("share route regressions", () => {
	it("keeps Request Access working when there is no direct invitation", async () => {
		resolved.invitation = null;
		renderShare();
		await userEvent.click(await screen.findByRole("button", { name: "Request access" }));
		await screen.findByText("Waiting for approval");
		expect(mocks.post).toHaveBeenCalledExactlyOnceWith(requestUrl, { token: mocks.token });
		expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
		normalAccess = { effectiveAccessLevel: "VIEWER" };
		await userEvent.click(screen.getByRole("button", { name: "Check access" }));
		await screen.findByRole("heading", { name: page.title });
	});

	it("keeps an existing access request in the waiting-for-approval flow", async () => {
		resolved.invitation = null;
		pendingRequest = true;
		renderShare();
		await screen.findByText("Access request already pending");
		expect(screen.getByText("Waiting for approval")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Request sent" })).toBeDisabled();
		expect(mocks.post).not.toHaveBeenCalled();
	});

	it.each(["VIEWER", "EDITOR"] as const)("uses %s link permissions without invitation handling", async (level) => {
		resolved.linkAccessLevel = level;
		const { queryClient } = renderShare();
		await screen.findByRole("heading", { name: page.title });
		expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
		expect(mocks.get.mock.calls.map(([url]) => url)).not.toContain(accessUrl);
		expectNoRequestAccess();
		for (const url of [`/page/${pageId}`, `/pageBlock/page/${pageId}`]) {
			expect(mocks.get).toHaveBeenCalledWith(url, expect.objectContaining({ headers: { "X-Page-Share-Token": mocks.token } }));
		}
		expect(screen.getByTestId("page-blocks")).toHaveAttribute("data-share-token", mocks.token);
		expect(screen.getByTestId("page-blocks")).toHaveAttribute("data-can-edit", String(level === "EDITOR"));
		expect(queryClient.getQueryData(pageKeys.detail(pageId))).toBeUndefined();
		expect(queryClient.getQueryData(pageKeys.sharedDetail(pageId, mocks.token))).toEqual(page);
		expect(mocks.post).not.toHaveBeenCalled();
	});

	it("prioritizes existing normal access over a pending invitation", async () => {
		normalAccess = { effectiveAccessLevel: "FULL_ACCESS" };
		renderShare();
		await screen.findByRole("heading", { name: page.title });
		expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
		expect(screen.getByTestId("page-blocks")).not.toHaveAttribute("data-share-token");
		expectNoRequestAccess();
		expect(mocks.post).not.toHaveBeenCalled();
	});

	it("does not render an invitation or content if resolve fails", async () => {
		getOverrides.set(resolveUrl, () => { throw new Error("Invalid token"); });
		renderShare();
		expect(await screen.findByRole("alert")).toHaveTextContent("Share link is invalid or unavailable");
		expect(screen.queryByRole("button", { name: "Accept" })).not.toBeInTheDocument();
		expect(screen.queryByTestId("page-blocks")).not.toBeInTheDocument();
		expect(mocks.get.mock.calls.map(([url]) => url)).not.toContain(accessUrl);
		expectNoRequestAccess();
	});
});
