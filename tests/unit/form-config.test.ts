import { describe, expect, it } from "vitest";

import { PropertyType } from "@/entities/database/model/database.types";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	getSectionQuiz,
	hiddenFormProperties,
	nextColumnName,
} from "@/widgets/page-block-renderer/lib/form-config";

describe("getSectionQuiz", () => {
	it("is off without a score column", () => {
		expect(getSectionQuiz({ quiz: { show_result: "score" } })).toBeNull();
		expect(getSectionQuiz(null)).toBeNull();
	});

	it("falls back to showing the score and no attempt limit", () => {
		expect(
			getSectionQuiz({
				quiz: { score_property_id: "score", show_result: "x", max_attempts: "2" },
			}),
		).toEqual({ show_result: "score", max_attempts: null, score_property_id: "score" });
	});
});

describe("hiddenFormProperties", () => {
	const question = (propertyId: string, showWhen?: [string, string]) => ({
		type: PageBlockType.FORM_FIELD,
		data_config: {
			property_id: propertyId,
			show_when: showWhen
				? { property_id: showWhen[0], option_id: showWhen[1] }
				: null,
		},
	});
	const properties = [
		{
			id: "team",
			name: "Team",
			type: PropertyType.SELECT,
			position: "0",
			options: [{ id: "fe", name: "FE", color: null, position: "0" }],
		},
	] as Parameters<typeof hiddenFormProperties>[1];
	const blocks = [question("team"), question("skills", ["team", "fe"])];

	it("hides until the chosen answer is picked", () => {
		expect(hiddenFormProperties(blocks, properties, {}).has("skills")).toBe(true);
		expect(
			hiddenFormProperties(blocks, properties, { team: "fe" }).has("skills"),
		).toBe(false);
	});

	it("shows the question again when its option is gone", () => {
		const gone = [question("team"), question("skills", ["team", "deleted"])];

		expect(hiddenFormProperties(gone, properties, {}).size).toBe(0);
	});

	it("shows the question when its source comes later", () => {
		const moved = [question("skills", ["team", "fe"]), question("team")];

		expect(hiddenFormProperties(moved, properties, {}).size).toBe(0);
	});
});

describe("hiddenFormProperties with option conditions", () => {
	const blocks = [
		{
			type: PageBlockType.FORM_FIELD,
			data_config: { property_id: "team" },
		},
		{
			type: PageBlockType.FORM_FIELD,
			data_config: {
				property_id: "skills",
				option_conditions: { property_id: "team", options: { node: "be" } },
			},
		},
	];
	const properties = [
		{
			id: "team",
			name: "Team",
			type: PropertyType.SELECT,
			position: "0",
			options: [
				{ id: "fe", name: "FE", color: null, position: "0" },
				{ id: "be", name: "BE", color: null, position: "1" },
			],
		},
		{
			id: "skills",
			name: "Skills",
			type: PropertyType.MULTI_SELECT,
			position: "1",
			options: [{ id: "node", name: "Node", color: null, position: "0" }],
		},
	] as Parameters<typeof hiddenFormProperties>[1];

	it("shows the question only when the answer has options", () => {
		const hiddenFor = (team?: string) =>
			hiddenFormProperties(blocks, properties, { team }).has("skills");

		expect(hiddenFor()).toBe(true);
		expect(hiddenFor("fe")).toBe(true);
		expect(hiddenFor("be")).toBe(false);
	});
});

describe("nextColumnName", () => {
	it("keeps the label when it is free", () => {
		expect(nextColumnName("Email", ["Name"])).toBe("Email");
	});

	it("counts up past taken names, ignoring case", () => {
		expect(nextColumnName("Email", ["email", "Email 2"])).toBe("Email 3");
	});
});
