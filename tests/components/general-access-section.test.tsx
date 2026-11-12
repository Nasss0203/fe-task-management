import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { PageShareSetting } from "@/entities/page-share/model/page-share.types";
import { GeneralAccessSection } from "@/features/page-share/ui/GeneralAccessSection";

function renderSection({
	setting = { workspaceAccessLevel: "EDITOR", linkAccessLevel: null },
	teamspacePage = false,
	privateTeamspace = false,
}: {
	setting?: PageShareSetting;
	teamspacePage?: boolean;
	privateTeamspace?: boolean;
} = {}) {
	const onUpdate = vi.fn();

	render(
		<GeneralAccessSection
			setting={setting}
			teamspacePage={teamspacePage}
			privateTeamspace={privateTeamspace}
			canManage
			isPending={false}
			isError={false}
			isUpdating={false}
			isUpdateError={false}
			onUpdate={onUpdate}
		/>,
	);

	return onUpdate;
}

const restricted: PageShareSetting = {
	workspaceAccessLevel: null,
	linkAccessLevel: null,
};

describe("GeneralAccessSection", () => {
	it("shows only Can view for the workspace on a teamspace page", () => {
		renderSection({ teamspacePage: true });

		expect(screen.getByText("Can view")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Can edit/ })).toBeNull();
		expect(screen.queryByRole("button", { name: /Can view/ })).toBeNull();
	});

	it("keeps the level menus for a page outside a teamspace", () => {
		renderSection();

		expect(screen.getByRole("button", { name: /Can edit/ })).toBeInTheDocument();
	});

	it("shows only Can view for a link on a teamspace page and turns the link on as view only", async () => {
		const onUpdate = renderSection({
			setting: { workspaceAccessLevel: null, linkAccessLevel: "EDITOR" },
			teamspacePage: true,
		});

		expect(screen.getByText("Can view")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Can edit/ })).toBeNull();

		await userEvent.click(screen.getByRole("combobox", { name: "General access" }));
		await userEvent.click(await screen.findByRole("option", { name: "Only people invited" }));
		expect(onUpdate).toHaveBeenCalledWith({
			workspace_access_level: null,
			link_access_level: null,
		});
	});

	it("sends a view-only link when a teamspace page turns the link on", async () => {
		const onUpdate = renderSection({ setting: restricted, teamspacePage: true });

		await userEvent.click(screen.getByRole("combobox", { name: "General access" }));
		await userEvent.click(await screen.findByRole("option", { name: "Anyone with the link" }));

		expect(onUpdate).toHaveBeenCalledWith({
			workspace_access_level: null,
			link_access_level: "VIEWER",
		});
	});

	it("hides Everyone in workspace in a private teamspace", async () => {
		renderSection({ setting: restricted, teamspacePage: true, privateTeamspace: true });

		await userEvent.click(screen.getByRole("combobox", { name: "General access" }));

		expect(await screen.findByRole("option", { name: "Anyone with the link" })).toBeInTheDocument();
		expect(screen.queryByRole("option", { name: "Everyone in workspace" })).toBeNull();
	});

	it("keeps an old workspace setting in a private teamspace visible so it can be turned off", () => {
		renderSection({
			setting: { workspaceAccessLevel: "VIEWER", linkAccessLevel: null },
			teamspacePage: true,
			privateTeamspace: true,
		});

		expect(screen.getByText("Everyone in workspace")).toBeInTheDocument();
		expect(screen.getByText("Not in effect: this page is in a private teamspace.")).toBeInTheDocument();
	});
});
