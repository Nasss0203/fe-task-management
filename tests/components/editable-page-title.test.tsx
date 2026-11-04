import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditablePageTitle } from "@/features/page/ui/editable-page-title";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ patch: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http }));

const renderTitle = () =>
	renderWithClient(
		<EditablePageTitle pageId='page-1' workspaceId='ws-1' title='Table' />,
	);

beforeEach(() => {
	vi.resetAllMocks();
	http.patch.mockResolvedValue({
		data: { data: { id: "page-1", title: "Hồ sơ" } },
	});
});

describe("EditablePageTitle", () => {
	it("saves the new title on Enter", async () => {
		const user = userEvent.setup();
		renderTitle();

		const input = screen.getByLabelText("Page title");
		await user.clear(input);
		await user.type(input, "Hồ sơ{Enter}");

		await waitFor(() =>
			expect(http.patch).toHaveBeenCalledWith("/page/page-1", { title: "Hồ sơ" }),
		);
	});

	it("keeps the old title when left empty or cancelled", async () => {
		const user = userEvent.setup();
		renderTitle();

		const input = screen.getByLabelText("Page title");
		await user.clear(input);
		await user.tab();
		expect(input).toHaveValue("Table");

		await user.type(input, " 2{Escape}");
		expect(input).toHaveValue("Table");
		expect(http.patch).not.toHaveBeenCalled();
	});
});
