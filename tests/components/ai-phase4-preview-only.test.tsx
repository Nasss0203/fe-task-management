import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { AiModificationPlanPreview } from "@/widgets/ai-chat/ui/AiModificationPlanPreview";

const readyDraft = {
	id: "generation-preview",
	conversation_id: "conversation-page",
	capability: "GENERATE_PAGE_MODIFICATION_PLAN",
	status: "COMPLETED",
	output_data: {
		type: "AI_MODIFICATION_PLAN",
		schemaVersion: 1,
		pageId: "page-1",
		status: "PLAN_READY",
		summary: "Add a QA heading",
		operations: [{
			type: "INSERT_BLOCKS",
			parentBlockId: null,
			afterBlockId: null,
			blocks: [{ type: "HEADER", content: { text: "QA" } }],
		}],
	},
} as AiGeneration;

describe("Phase 4 Dashboard modification Preview", () => {
	it("shows operation counts and proposed content but never Apply or Discard", () => {
		const onConfirm = vi.fn();
		const onDiscard = vi.fn();
		render(<AiModificationPlanPreview generation={readyDraft} previewOnly
			onConfirm={onConfirm} onDiscard={onDiscard} />);
		expect(screen.getByText("Page modification plan")).toBeTruthy();
		expect(screen.getByText(/1 operation/).textContent).toContain("1 block");
		expect(screen.getByText("QA")).toBeTruthy();
		expect(screen.queryByRole("button", { name: /Apply changes/ })).toBeNull();
		expect(screen.queryByRole("button", { name: /Discard/ })).toBeNull();
		expect(onConfirm).not.toHaveBeenCalled();
		expect(onDiscard).not.toHaveBeenCalled();
	});

	it("keeps existing Page-level Apply/Discard behavior outside Dashboard", () => {
		const onConfirm = vi.fn();
		const onDiscard = vi.fn();
		render(<AiModificationPlanPreview generation={readyDraft}
			onConfirm={onConfirm} onDiscard={onDiscard} />);
		fireEvent.click(screen.getByRole("button", { name: /Apply changes/ }));
		expect(onConfirm).toHaveBeenCalledWith("generation-preview", "page-1");
		fireEvent.click(screen.getByRole("button", { name: /Discard/ }));
		expect(onDiscard).toHaveBeenCalledWith("generation-preview");
	});

	it("does not expose Apply when more context is required", () => {
		const needsContext = {
			...readyDraft,
			output_data: {
				...readyDraft.output_data as Record<string, unknown>,
				status: "NEED_MORE_CONTEXT",
				operations: [],
				contextRequests: [{ reason: "AMBIGUOUS_TARGET", description: "Which block?" }],
			},
		} as AiGeneration;
		render(<AiModificationPlanPreview generation={needsContext} previewOnly
			onConfirm={vi.fn()} onDiscard={vi.fn()} />);
		expect(screen.getByText("Which block?")).toBeTruthy();
		expect(screen.queryByRole("button", { name: /Apply changes/ })).toBeNull();
		expect(screen.queryByRole("button", { name: /Discard/ })).toBeNull();
	});
});
