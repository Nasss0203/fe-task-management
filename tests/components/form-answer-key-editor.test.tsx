import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	PropertyType,
	type FormDatabase,
} from "@/entities/database/model/database.types";
import { AnswerKeyEditor } from "@/widgets/page-block-renderer/ui/form-answer-key-editor";
import { renderWithClient } from "../utils/test-utils";

const http = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock("@/shared/api/api-client", () => ({ default: http }));

const team: FormDatabase["properties"][number] = {
	id: "team",
	name: "Team",
	type: PropertyType.MULTI_SELECT,
	options: [
		{ id: "be", name: "Backend", color: null, position: "0" },
		{ id: "fe", name: "Frontend", color: null, position: "1" },
	],
	position: "0",
};

const city: FormDatabase["properties"][number] = {
	id: "city",
	name: "City",
	type: PropertyType.TEXT,
	options: [],
	position: "1",
};

beforeEach(() => {
	vi.resetAllMocks();
	http.put.mockResolvedValue({ data: { data: {} } });
});

describe("AnswerKeyEditor", () => {
	it("saves the picked options with the question's points", async () => {
		const user = userEvent.setup();
		renderWithClient(
			<AnswerKeyEditor
				sectionBlockId='section-1'
				fieldBlockId='f1'
				property={team}
				answerKey={{ field_block_id: "f1", correct_value: ["be"], points: 3 }}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Frontend" }));

		await waitFor(() =>
			expect(http.put).toHaveBeenCalledWith(
				"/forms/section-1/answer-keys/f1",
				{ correct_value: ["be", "fe"], points: 3 },
			),
		);
	});

	it("clears the answer when the last option is unpicked", async () => {
		const user = userEvent.setup();
		renderWithClient(
			<AnswerKeyEditor
				sectionBlockId='section-1'
				fieldBlockId='f1'
				property={team}
				answerKey={{ field_block_id: "f1", correct_value: ["be"], points: 3 }}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Backend" }));

		await waitFor(() =>
			expect(http.put).toHaveBeenCalledWith(
				"/forms/section-1/answer-keys/f1",
				{ correct_value: null, points: 3 },
			),
		);
	});

	it("saves a trimmed text answer and keeps points locked until there is one", async () => {
		const user = userEvent.setup();
		renderWithClient(
			<AnswerKeyEditor
				sectionBlockId='section-1'
				fieldBlockId='f2'
				property={city}
				answerKey={undefined}
			/>,
		);

		expect(screen.getByLabelText("Points")).toBeDisabled();

		await user.type(screen.getByLabelText("Correct answer"), "  Hue ");
		await user.tab();

		await waitFor(() =>
			expect(http.put).toHaveBeenCalledWith(
				"/forms/section-1/answer-keys/f2",
				{ correct_value: "Hue", points: 1 },
			),
		);
	});
});
