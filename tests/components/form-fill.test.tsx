import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	PropertyType,
	type Database,
} from "@/entities/database/model/database.types";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { FormFill, type FormFillBlock } from "@/widgets/page-block-renderer/ui/form-fill";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http }));

const database = {
	id: "db-1",
	pageId: "page-1",
	name: "Signups",
	properties: [
		{ id: "name", name: "Name", type: PropertyType.TITLE, options: [], position: "0", isDefault: true, isHideable: false },
		{ id: "email", name: "Email", type: PropertyType.EMAIL, options: [], position: "1", isDefault: false, isHideable: true },
		{
			id: "team",
			name: "Team",
			type: PropertyType.SELECT,
			options: [
				{ id: "be", name: "Backend", color: null, position: "0" },
				{ id: "fe", name: "Frontend", color: null, position: "1" },
			],
			position: "2",
			isDefault: false,
			isHideable: true,
		},
	],
} as Database;

const field = (id: string, propertyId: string, required = false): FormFillBlock => ({
	id,
	type: PageBlockType.FORM_FIELD,
	content: { label: "" },
	data_config: { property_id: propertyId, required },
	children: [],
});

const section: FormFillBlock = {
	id: "section-1",
	type: PageBlockType.SECTION,
	content: { title: "Join" },
	data_config: { form: { database_id: "db-1" } },
	children: [
		field("f1", "name", true),
		{ id: "note", type: PageBlockType.TEXT, content: { text: "Tell us" }, data_config: null, children: [] },
		field("f2", "email"),
		field("f3", "team"),
	],
};

function renderForm() {
	return renderWithClient(
		<FormFill
			section={section}
			form={{ database_id: "db-1", submit_label: "Join", success_message: "Welcome!" }}
			database={database}
			renderBlock={(block) => <p>{(block.content as { text: string }).text}</p>}
		/>,
	);
}

beforeEach(() => vi.resetAllMocks());

describe("FormFill", () => {
	it("shows a field per question, keeps other blocks, and sends the answers", async () => {
		http.post.mockResolvedValue({ data: { data: { row_id: "row-1", success_message: null } } });
		const user = userEvent.setup();
		renderForm();

		expect(screen.getByText("Tell us")).toBeInTheDocument();
		await user.type(screen.getByLabelText(/Name/), "Lan");
		await user.type(screen.getByLabelText("Email"), "lan@example.com");
		await user.selectOptions(screen.getByLabelText("Team"), "fe");
		await user.click(screen.getByRole("button", { name: "Join" }));

		await waitFor(() =>
			expect(http.post).toHaveBeenCalledWith(
				"/forms/section-1/responses",
				{ answers: { name: "Lan", email: "lan@example.com", team: "fe" } },
				expect.anything(),
			),
		);
		expect(await screen.findByText("Welcome!")).toBeInTheDocument();
	});

	it("shows the server's reason when the answer is refused", async () => {
		http.post.mockRejectedValue(
			Object.assign(new Error("Bad"), {
				isAxiosError: true,
				response: { data: { message: '"Name" is required' } },
			}),
		);
		const user = userEvent.setup();
		renderForm();

		await user.click(screen.getByRole("button", { name: "Join" }));

		expect(await screen.findByRole("alert")).toHaveTextContent('"Name" is required');
	});
});
