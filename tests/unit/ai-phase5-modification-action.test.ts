import { describe, expect, it } from "vitest";
import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { assertModificationDraftTarget } from "@/widgets/ai-chat/model/ai-modification-action";

const valid = {
  id: "generation-1",
  workspace_id: "workspace-1",
  capability: "GENERATE_PAGE_MODIFICATION_PLAN",
  status: "COMPLETED",
  output_data: {
    schemaVersion: 1,
    type: "AI_MODIFICATION_PLAN",
    pageId: "page-1",
    status: "PLAN_READY",
    summary: "Add QA",
    operations: [{ type: "INSERT_BLOCKS", blocks: [{ type: "TEXT", content: { text: "QA" } }] }],
  },
} as AiGeneration;

describe("Phase 5.3 AI modification preflight", () => {
  it("accepts a ready generation in the current workspace", () => {
    expect(() => assertModificationDraftTarget(valid, "page-1", "workspace-1")).not.toThrow();
    expect(() => assertModificationDraftTarget(valid, "page-1", "workspace-1", "page-1")).not.toThrow();
  });

  it("rejects cross-workspace, wrong page, completed actions and empty plans", () => {
    expect(() => assertModificationDraftTarget(valid, "page-1", "workspace-2")).toThrow();
    expect(() => assertModificationDraftTarget(valid, "page-2", "workspace-1")).toThrow();
    expect(() => assertModificationDraftTarget(valid, "page-1", "workspace-1", "page-2")).toThrow();
    expect(() => assertModificationDraftTarget({ ...valid, status: "APPLIED" }, "page-1", "workspace-1")).toThrow();
    expect(() => assertModificationDraftTarget({ ...valid, output_data: { ...valid.output_data as object, operations: [] } }, "page-1", "workspace-1")).toThrow();
  });

  it("permits discard of a NEED_MORE_CONTEXT draft but prevents Apply", () => {
    const draft = { ...valid, output_data: {
      ...valid.output_data as object,
      status: "NEED_MORE_CONTEXT",
      operations: [],
    } } as AiGeneration;
    expect(() => assertModificationDraftTarget(draft, "page-1", "workspace-1")).toThrow();
    expect(() => assertModificationDraftTarget(draft, "page-1", "workspace-1", undefined, true)).not.toThrow();
  });
});
