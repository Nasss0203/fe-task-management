import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { PropertyType } from "@/entities/database/model/database.types";
import { AiModificationPlanPreview } from "@/widgets/ai-chat/ui/AiModificationPlanPreview";

const state: { database: unknown; isPending: boolean } = { database: undefined, isPending: false };

vi.mock("@/entities/database/model/database.queries", () => ({
	useDatabase: () => ({ data: state.database, isPending: state.isPending, isError: false }),
}));

const option = (id: string, name: string) => ({ id, name, color: null, position: "0" });
const property = (id: string, name: string, type: PropertyType, options: ReturnType<typeof option>[] = []) => ({
	id, name, type, isDefault: false, isHideable: true, position: "0", options,
});
const tasks = {
	id: "db-1", pageId: "page-1", name: "Tasks",
	properties: [
		property("p-name", "Tên", PropertyType.TITLE),
		property("p-status", "Trạng thái", PropertyType.SELECT, [option("o-todo", "Todo"), option("o-done", "Done")]),
		property("p-tags", "Nhãn", PropertyType.MULTI_SELECT, [option("t-a", "Gấp"), option("t-b", "Khách")]),
		property("p-points", "Điểm", PropertyType.NUMBER),
	],
};

function preview(values: Record<string, unknown>) {
	const plan = {
		type: "AI_MODIFICATION_PLAN", schemaVersion: 1, pageId: "page-1", status: "PLAN_READY",
		summary: "Thêm 1 dòng", operations: [{ type: "CREATE_DATABASE_ROWS", databaseId: "db-1", rows: [{ values }] }],
	};
	const generation = {
		id: "generation-rows", conversation_id: "conversation-page", workspace_id: "workspace-1",
		capability: "GENERATE_PAGE_MODIFICATION_PLAN", status: "COMPLETED", output_data: plan,
	} as unknown as AiGeneration;
	render(<AiModificationPlanPreview generation={generation} previewOnly onConfirm={vi.fn()} onDiscard={vi.fn()} />);
}

describe("CREATE_DATABASE_ROWS preview (L3)", () => {
	beforeEach(() => {
		state.database = tasks;
		state.isPending = false;
	});

	it("shows the option name of a SELECT value, not its id", () => {
		preview({ "p-name": "Gọi khách", "p-status": "o-done" });
		expect(screen.getByText("Trạng thái")).toBeTruthy();
		expect(screen.getByText("Done")).toBeTruthy();
		expect(screen.queryByText("o-done")).toBeNull();
		expect(screen.getByText("Gọi khách")).toBeTruthy();
	});

	it("shows every option name of a MULTI_SELECT value", () => {
		preview({ "p-name": "Gọi khách", "p-tags": ["t-a", "t-b"] });
		expect(screen.getByText("Gấp, Khách")).toBeTruthy();
	});

	it("keeps text and number values as they are", () => {
		preview({ "p-name": "o-done", "p-points": 3 });
		expect(screen.getByText("o-done")).toBeTruthy();
		expect(screen.getByText("3")).toBeTruthy();
	});

	it("marks an option that is no longer in the table", () => {
		preview({ "p-name": "Gọi khách", "p-status": "o-gone" });
		expect(screen.getByText("o-gone (không còn trong bảng)")).toBeTruthy();
	});

	it("shows the raw value while the table is loading", () => {
		state.database = undefined;
		state.isPending = true;
		preview({ "p-status": "o-done" });
		expect(screen.getByText("o-done")).toBeTruthy();
	});
});
