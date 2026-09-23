import { act, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { usePagesByWorkspace } from "@/entities/page/model/page.queries";
import type { SharedPage } from "@/entities/page-share/model/page-share.types";
import { useTeamspaces } from "@/entities/teamspace/model/teamspace.queries";
import { workspaceKeys } from "@/entities/workspace/model/workspace.queries";
import type {
	Workspace,
	WorkspaceAccess,
} from "@/entities/workspace/model/workspace.types";
import { setStoredUser } from "@/features/auth/lib/auth-storage";
import { useSettingsDialog } from "@/features/workspace-settings/model/use-settings-dialog";
import { AppSidebar } from "@/widgets/workspace-sidebar/ui/app-sidebar";
import { SidebarProvider } from "@/widgets/workspace-sidebar/ui/sidebar";
import { createWrapper, renderWithClient } from "../utils/test-utils";

const mocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn(), push: vi.fn() }));

vi.mock("@/shared/api/api-client", () => ({ default: mocks }));
vi.mock("next/navigation", () => ({
	usePathname: () => "/page/shared-root",
	useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/features/auth", async () => ({
	useUser: (await import("@/features/auth/model/use-user")).useUser,
}));
// Keep the actual sidebar, dropdown, shared tree, query hooks and API adapters.
// Only isolate the settings dialog's unrelated form content.
vi.mock("@/features/workspace-settings", async () => ({
	useSettingsDialog: (
		await import("@/features/workspace-settings/model/use-settings-dialog")
	).useSettingsDialog,
	SettingsDialog: () => <li data-testid='settings-dialog' />,
}));

const workspaces: Workspace[] = ["A", "B"].map((id) => ({
	id,
	name: `Workspace ${id}`,
	slug: id,
	layoutMode: "DEFAULT",
	createdAt: "2026-01-01",
	updatedAt: "2026-01-01",
	deletedAt: null,
	deletedBy: null,
	createdBy: "user-1",
}));

const sharedPages: SharedPage[] = [
	{
		id: "shared-root",
		workspace_id: "A",
		teamspace_id: null,
		parent_page_id: "unshared-parent",
		title: "Shared parent",
		slug: null,
		icon: null,
		cover_url: null,
		accessLevel: "VIEWER",
	},
	{
		id: "shared-child",
		workspace_id: "A",
		teamspace_id: null,
		parent_page_id: "shared-root",
		title: "Shared child",
		slug: null,
		icon: null,
		cover_url: null,
		accessLevel: "VIEWER",
	},
];

function access(
	workspaceId: string,
	membership: WorkspaceAccess["membership_type"],
	roles: WorkspaceAccess["roles"] = membership === "MEMBER" ? ["MEMBER"] : [],
): WorkspaceAccess {
	return {
		user_id: "user-1",
		workspace_id: workspaceId,
		membership_type: membership,
		roles,
		permissions: [],
	};
}

function deferred<T>() {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

let responses: Map<string, unknown>;

function renderSidebar(workspaceId = "A") {
	setStoredUser({
		id: "user-1",
		email: "guest@example.com",
		lastActiveWorkspaceId: workspaceId,
	});
	return renderWithClient(
		<SidebarProvider>
			<AppSidebar />
		</SidebarProvider>,
	);
}

function expectNoMemberNavigation() {
	for (const label of ["Private", "Teamspaces", "Templates", "Trash", "Search", "Ask AI", "Home", "Inbox", "Favorites"]) {
		expect(screen.queryByText(label, { exact: true })).not.toBeInTheDocument();
	}
	for (const label of ["Settings", "Invite members", "Add account", "Upgrade", "New workspace"]) {
		expect(screen.queryByRole("menuitem", { name: label })).not.toBeInTheDocument();
	}
	expect(screen.queryByTestId("settings-dialog")).not.toBeInTheDocument();
	expect(screen.queryByRole("button", { name: "Create child page" })).not.toBeInTheDocument();
}

function expectNoMemberRequests() {
	for (const [url] of mocks.get.mock.calls) {
		expect(["/workspaces", "/workspaces/A/access", "/workspaces/B/access", "/page-shares/shared-with-me"]).toContain(url);
	}
}

beforeEach(() => {
	vi.clearAllMocks();
	localStorage.clear();
	useSettingsDialog.setState({ open: false, section: "profile" });
	vi.stubGlobal("matchMedia", vi.fn(() => ({
		matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
	})));
	vi.spyOn(console, "log").mockImplementation(() => {});
	responses = new Map<string, unknown>([
		["/workspaces", workspaces],
		["/workspaces/A/access", access("A", "GUEST")],
		["/workspaces/B/access", access("B", "MEMBER")],
		["/page-shares/shared-with-me", sharedPages],
		["/page/workspace/A", []],
		["/page/workspace/B", []],
		["/teamspaces", []],
		["/page/favorites", []],
	]);
	mocks.get.mockImplementation(async (url: string) => {
		if (!responses.has(url)) throw new Error(`Unexpected GET ${url}`);
		const payload = await responses.get(url);
		if (payload instanceof Error) throw payload;
		return { data: { data: payload } };
	});
	mocks.patch.mockImplementation(async (url: string) => ({
		data: { data: { workspaceId: url.split("/")[2] } },
	}));
});

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("workspace membership sidebar", () => {
	it("renders only Shared for Guest, retains descendants and normal page navigation", async () => {
		const user = userEvent.setup();
		renderSidebar();
		expect(await screen.findByText("Shared with me")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Shared child" }));
		expect(mocks.push).toHaveBeenCalledWith("/page/shared-child");
		await user.click(screen.getByRole("button", { name: "Collapse page" }));
		expect(screen.queryByText("Shared child")).not.toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Expand page" }));
		expect(screen.getByText("Shared child")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /Workspace A/ }));
		expect(screen.getByRole("menuitem", { name: /Workspace B/ })).toBeInTheDocument();
		expectNoMemberNavigation();
		expectNoMemberRequests();
	});

	it("uses membership_type, not roles, to identify Guest", async () => {
		responses.set("/workspaces/A/access", access("A", "GUEST", ["OWNER"]));
		renderSidebar();
		await screen.findByText("Shared with me");
		expectNoMemberNavigation();
		expectNoMemberRequests();
	});

	it.each(["OWNER", "MEMBER"] as const)("preserves Member navigation and Settings for role %s", async (role) => {
		responses.set("/workspaces/A/access", access("A", "MEMBER", [role]));
		const user = userEvent.setup();
		renderSidebar();
		await screen.findByText("Private", { exact: true });
		for (const label of ["Teamspaces", "Shared with me", "Templates", "Trash", "Search", "Home"]) {
			expect(screen.getByText(label, { exact: true })).toBeInTheDocument();
		}
		expect(mocks.get.mock.calls.map(([url]) => url)).toEqual(
			expect.arrayContaining(["/page/workspace/A", "/teamspaces", "/page/favorites"]),
		);
		await user.click(screen.getByRole("button", { name: /Workspace A/ }));
		for (const label of ["Settings", "Invite members", "Add account", "Upgrade", "New workspace"]) {
			expect(screen.getByRole("menuitem", { name: label })).toBeInTheDocument();
		}
		await user.click(screen.getByRole("menuitem", { name: "Settings" }));
		await waitFor(() => expect(useSettingsDialog.getState().open).toBe(true));
		expect(screen.getByTestId("settings-dialog")).toBeInTheDocument();
	});

	it("does not flash Member navigation or fetch Member data during access loading", async () => {
		const pending = deferred<WorkspaceAccess>();
		responses.set("/workspaces/A/access", pending.promise);
		const user = userEvent.setup();
		renderSidebar();
		expectNoMemberNavigation();
		expect(screen.getByRole("status")).toBeInTheDocument();
		await user.click(await screen.findByRole("button", { name: /Workspace A/ }));
		expect(screen.getByText("Loading workspace access...")).toBeInTheDocument();
		expectNoMemberNavigation();
		expectNoMemberRequests();
		await user.keyboard("{Escape}");
		await act(async () => pending.resolve(access("A", "GUEST")));
		await screen.findByText("Shared with me");
		expectNoMemberNavigation();
	});

	it.each(["403 Forbidden", "Network Error"])("fails closed on access error: %s", async (message) => {
		responses.set("/workspaces/A/access", new Error(message));
		renderSidebar();
		expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load workspace access.");
		await userEvent.click(screen.getByRole("button", { name: /Workspace A/ }));
		expectNoMemberNavigation();
		expectNoMemberRequests();
	});

	it.each([undefined, "RESTRICTED_MEMBER"])("fails closed for unknown membership %s even with OWNER role", async (membership) => {
		responses.set("/workspaces/A/access", { ...access("A", "MEMBER", ["OWNER"]), membership_type: membership });
		renderSidebar();
		await screen.findByRole("alert");
		expectNoMemberNavigation();
		expectNoMemberRequests();
	});

	it("does not apply an access response belonging to another workspace", async () => {
		responses.set("/workspaces/A/access", access("B", "MEMBER"));
		renderSidebar();
		await screen.findByRole("alert");
		expectNoMemberNavigation();
		expectNoMemberRequests();
	});

	it("switches Guest A to Member B and back with separate access cache entries", async () => {
		const pending = deferred<WorkspaceAccess>();
		responses.set("/workspaces/B/access", pending.promise);
		const user = userEvent.setup();
		const { queryClient } = renderSidebar();
		await screen.findByText("Shared with me");
		await user.click(screen.getByRole("button", { name: /Workspace A/ }));
		await user.click(screen.getByRole("menuitem", { name: /Workspace B/ }));
		await screen.findByRole("status");
		expectNoMemberNavigation();
		expectNoMemberRequests();
		expect(mocks.patch).toHaveBeenCalledWith("/workspaces/B/select");
		await act(async () => pending.resolve(access("B", "MEMBER")));
		await screen.findByText("Private", { exact: true });
		expect(queryClient.getQueryData(workspaceKeys.access("A"))).toEqual(access("A", "GUEST"));
		expect(queryClient.getQueryData(workspaceKeys.access("B"))).toEqual(access("B", "MEMBER"));
		mocks.get.mockClear();
		await user.click(screen.getByRole("button", { name: /Workspace B/ }));
		await user.click(screen.getByRole("menuitem", { name: /Workspace A/ }));
		await screen.findByRole("button", { name: /Workspace A/ });
		expectNoMemberNavigation();
		expectNoMemberRequests();
		expect(mocks.patch).toHaveBeenCalledWith("/workspaces/A/select");
		await user.click(screen.getByRole("button", { name: /Workspace A/ }));
		await user.click(screen.getByRole("menuitem", { name: /Workspace B/ }));
		await screen.findByText("Private", { exact: true });
	});

	it("hides Member UI when switching to an uncached Guest workspace while access is pending", async () => {
		const pending = deferred<WorkspaceAccess>();
		responses.set("/workspaces/A/access", pending.promise);
		const user = userEvent.setup();
		renderSidebar("B");
		await screen.findByText("Private", { exact: true });
		await user.click(screen.getByRole("button", { name: /Workspace B/ }));
		await user.click(screen.getByRole("menuitem", { name: /Workspace A/ }));
		await screen.findByRole("status");
		expectNoMemberNavigation();
		expect(mocks.get.mock.calls.map(([url]) => url)).not.toContain("/page/workspace/A");
		await act(async () => pending.resolve(access("A", "GUEST")));
		await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
		expect(screen.getByText("Shared with me")).toBeInTheDocument();
		expectNoMemberNavigation();
	});

	it("does not fall back to cached Member navigation after access refetch fails", async () => {
		const { queryClient } = renderSidebar("B");
		await screen.findByText("Private", { exact: true });
		responses.set("/workspaces/B/access", new Error("Access revoked"));
		await act(async () => { await queryClient.invalidateQueries({ queryKey: workspaceKeys.access("B") }); });
		await screen.findByRole("alert");
		expectNoMemberNavigation();
	});

	it("keeps the existing default query behavior for callers without an enabled argument", async () => {
		const { wrapper } = createWrapper();
		const { result } = renderHook(() => ({ pages: usePagesByWorkspace("A"), teamspaces: useTeamspaces("A") }), { wrapper });
		await waitFor(() => expect(result.current.pages.isSuccess && result.current.teamspaces.isSuccess).toBe(true));
		expect(mocks.get.mock.calls.map(([url]) => url)).toEqual(expect.arrayContaining(["/page/workspace/A", "/teamspaces"]));
	});
});
