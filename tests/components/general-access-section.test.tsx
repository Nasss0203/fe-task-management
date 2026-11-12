import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GeneralAccessSection } from "@/features/page-share/ui/GeneralAccessSection";

function renderSection(workspaceViewOnly: boolean) {
	return render(
		<GeneralAccessSection
			setting={{ workspaceAccessLevel: "EDITOR", linkAccessLevel: null }}
			workspaceViewOnly={workspaceViewOnly}
			canManage
			isPending={false}
			isError={false}
			isUpdating={false}
			isUpdateError={false}
			onUpdate={vi.fn()}
		/>,
	);
}

describe("GeneralAccessSection workspace access", () => {
	it("shows only Can view for a teamspace page", () => {
		renderSection(true);

		expect(screen.getByText("Can view")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Can edit/ })).toBeNull();
		expect(screen.queryByRole("button", { name: /Can view/ })).toBeNull();
	});

	it("keeps the level menu for a page outside a teamspace", () => {
		renderSection(false);

		expect(screen.getByRole("button", { name: /Can edit/ })).toBeInTheDocument();
	});
});
