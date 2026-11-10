import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { BillingPlan } from "@/entities/billing/model/billing.types";
import { PlanLimitDialog, usePlanLimitNotifier } from "@/features/workspace-billing";
import type { PlanLimitNotice } from "@/features/workspace-billing/lib/plan-limit";
import { useBillingDialog } from "@/features/workspace-billing/model/use-billing-dialog";
import { usePlanLimitDialog } from "@/features/workspace-billing/model/use-plan-limit-dialog";
import { useSettingsDialog } from "@/features/workspace-settings/model/use-settings-dialog";

const getBillingPlans = vi.hoisted(() => vi.fn());
const getAccess = vi.hoisted(() => vi.fn());

vi.mock("@/entities/billing/api/billing.api", async (importOriginal) => ({
	...(await importOriginal<object>()),
	getBillingPlans,
}));
vi.mock("@/entities/workspace/api/workspace.api", async (importOriginal) => {
	const original = await importOriginal<{ workspaceApi: object }>();
	return { ...original, workspaceApi: { ...original.workspaceApi, getAccess } };
});

const plan = (name: string, storageMb: number, teamspaces: number, publish: boolean): BillingPlan => ({
	id: name,
	code: name.toUpperCase(),
	name,
	description: "",
	prices: [],
	features: [
		{ id: `${name}-s`, featureId: "s", code: "MAX_STORAGE_MB", name: "Storage", description: "", valueType: "NUMBER", value: storageMb },
		{ id: `${name}-t`, featureId: "t", code: "MAX_TEAMSPACES", name: "Teamspaces", description: "", valueType: "NUMBER", value: teamspaces },
		{ id: `${name}-p`, featureId: "p", code: "PUBLIC_PAGE", name: "Public page", description: "", valueType: "BOOLEAN", value: publish },
	],
});

const plans = [plan("Free", 500, 1, false), plan("Plus", 10240, 10, true), plan("Business", 102400, 50, true)];

const limitError = (feature: string, limit: number | boolean) =>
	new AxiosError("Forbidden", "ERR_BAD_REQUEST", undefined, undefined, {
		status: 403,
		statusText: "Forbidden",
		headers: {},
		config: { headers: new AxiosHeaders() },
		data: { code: "WORKSPACE_LIMIT_EXCEEDED", message: "Limit", details: { feature, limit, usage: limit } },
	});

const access = (canManage: boolean) => ({
	workspace_id: "ws-1",
	membership_type: "MEMBER",
	roles: canManage ? ["OWNER"] : ["MEMBER"],
	permissions: canManage ? ["workspace.read", "workspace.update"] : ["workspace.read"],
});

function renderNotifier(canManage: boolean) {
	getBillingPlans.mockResolvedValue({ items: plans });
	getAccess.mockResolvedValue(access(canManage));
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	return renderHook(() => usePlanLimitNotifier("ws-1"), { wrapper }).result;
}

async function shownNotice(): Promise<PlanLimitNotice> {
	await waitFor(() => expect(usePlanLimitDialog.getState().notice).not.toBeNull());
	return usePlanLimitDialog.getState().notice as PlanLimitNotice;
}

afterEach(() => {
	vi.clearAllMocks();
	usePlanLimitDialog.setState({ notice: null });
	useBillingDialog.setState({ open: false });
	useSettingsDialog.setState({ open: false });
});

describe("usePlanLimitNotifier", () => {
	it("suggests the closest higher plan to an owner who hits the teamspace limit", async () => {
		const notify = renderNotifier(true);

		expect(notify.current(limitError("MAX_TEAMSPACES", 1))).toBe(true);

		expect(await shownNotice()).toMatchObject({
			title: "Teamspace limit reached",
			description: "Your plan includes 1 teamspace. Upgrade to Plus to get up to 10 teamspaces.",
			action: "upgrade",
			actionLabel: "Upgrade to Plus",
		});
	});

	it("tells a member to ask an owner without an action", async () => {
		const notify = renderNotifier(false);

		notify.current(limitError("MAX_TEAMSPACES", 1));

		expect(await shownNotice()).toMatchObject({
			description:
				"Your plan includes 1 teamspace. Only workspace owners can change the plan. Ask an owner to upgrade to Plus to get up to 10 teamspaces.",
			action: null,
		});
	});

	it("offers Manage storage instead of Upgrade on the highest storage plan", async () => {
		const notify = renderNotifier(true);

		notify.current(limitError("MAX_STORAGE_MB", 102400));

		expect(await shownNotice()).toMatchObject({
			title: "Storage limit reached",
			action: "manage-storage",
			actionLabel: "Manage storage",
		});
	});

	it("explains publishing as a plan feature", async () => {
		const notify = renderNotifier(true);

		notify.current(limitError("PUBLIC_PAGE", false));

		expect(await shownNotice()).toMatchObject({
			title: "Publishing isn't included in your plan",
			description: "Upgrade to Plus to publish pages to the web.",
			actionLabel: "Upgrade to Plus",
		});
	});

	it("waits for access that has not loaded yet before choosing the owner wording", async () => {
		let resolveAccess: (value: ReturnType<typeof access>) => void = () => {};
		const notify = renderNotifier(true);
		getAccess.mockReset();
		getAccess.mockReturnValue(new Promise((resolve) => (resolveAccess = resolve)));

		notify.current(limitError("MAX_TEAMSPACES", 1));
		expect(usePlanLimitDialog.getState().notice).toBeNull();
		resolveAccess(access(true));

		expect((await shownNotice()).action).toBe("upgrade");
	});

	it("does not tell an owner to ask an owner when access cannot be loaded", async () => {
		const notify = renderNotifier(true);
		getAccess.mockReset();
		getAccess.mockRejectedValue(new Error("Network down"));

		notify.current(limitError("MAX_TEAMSPACES", 1));

		expect(await shownNotice()).toMatchObject({
			description: "Your plan includes 1 teamspace. Upgrade to Plus to get up to 10 teamspaces.",
			action: null,
		});
	});

	it("ignores errors that are not plan limit errors", () => {
		const notify = renderNotifier(true);

		expect(notify.current(new Error("Network down"))).toBe(false);
		expect(notify.current(undefined)).toBe(false);
		expect(usePlanLimitDialog.getState().notice).toBeNull();
	});
});

describe("PlanLimitDialog", () => {
	const notice = (overrides: Partial<PlanLimitNotice>): PlanLimitNotice => ({
		title: "Teamspace limit reached",
		description: "Your plan includes 1 teamspace.",
		action: "upgrade",
		actionLabel: "Upgrade to Plus",
		...overrides,
	});

	it("closes and opens the billing dialog on Upgrade", async () => {
		const user = userEvent.setup();
		usePlanLimitDialog.setState({ notice: notice({}) });
		render(<PlanLimitDialog />);

		await user.click(screen.getByRole("button", { name: "Upgrade to Plus" }));

		expect(usePlanLimitDialog.getState().notice).toBeNull();
		expect(useBillingDialog.getState().open).toBe(true);
	});

	it("opens Settings at Storage on Manage storage", async () => {
		const user = userEvent.setup();
		usePlanLimitDialog.setState({
			notice: notice({ action: "manage-storage", actionLabel: "Manage storage" }),
		});
		render(<PlanLimitDialog />);

		await user.click(screen.getByRole("button", { name: "Manage storage" }));

		expect(useSettingsDialog.getState()).toMatchObject({ open: true, section: "storage" });
		expect(useBillingDialog.getState().open).toBe(false);
	});

	it("shows only Got it when there is nothing the viewer can do", async () => {
		const user = userEvent.setup();
		usePlanLimitDialog.setState({ notice: notice({ action: null, actionLabel: null }) });
		render(<PlanLimitDialog />);

		expect(screen.queryByRole("button", { name: /Upgrade/ })).not.toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Got it" }));

		expect(usePlanLimitDialog.getState().notice).toBeNull();
	});
});
