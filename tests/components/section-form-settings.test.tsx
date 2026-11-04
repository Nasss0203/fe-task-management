import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { SectionFormSettings } from "@/widgets/page-block-renderer/ui/section-form-controls";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http, refreshAccessToken: vi.fn() }));

const responses: Record<string, unknown> = {
	"/databases/db-1": { id: "db-1", name: "Quiz responses", pageId: "page-2", properties: [] },
	"/page/page-1": { id: "page-1", workspace_id: "ws-1" },
	"/page/workspace/ws-1/databases": [
		{ id: "db-1", name: "Quiz responses", pageId: "page-2" },
		{ id: "db-2", name: "Signups", pageId: "page-3" },
	],
};

const section = {
	id: "section-1",
	page_id: "page-1",
	parent_block_id: null,
	type: PageBlockType.SECTION,
	data_config: {
		form: { database_id: "db-1" },
		quiz: { show_result: "score", max_attempts: null, score_property_id: "score" },
	},
	children: [],
} as unknown as PageBlockNode;

beforeEach(() => {
	vi.resetAllMocks();
	http.get.mockImplementation((url: string) =>
		Promise.resolve({ data: { data: responses[url] ?? null } }),
	);
});

describe("SectionFormSettings", () => {
	it("shows the linked database instead of the picker until Change is clicked", async () => {
		const user = userEvent.setup();
		renderWithClient(
			<SectionFormSettings
				block={section}
				form={{ database_id: "db-1" }}
				hasQuestions={false}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Form settings" }));

		expect(screen.getByText("Quiz", { selector: "p" })).toBeInTheDocument();
		expect(await screen.findByText("Quiz responses")).toBeInTheDocument();
		expect(screen.getByText(/Changing it turns off the quiz/)).toBeInTheDocument();
		expect(screen.queryByLabelText("Find a database")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Change" }));

		expect(screen.getByLabelText("Find a database")).toBeInTheDocument();
		expect(await screen.findByText("Signups")).toBeInTheDocument();
	});
});
