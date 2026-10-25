import { describe, expect, expectTypeOf, it } from "vitest";
import type { AiAskResponse, AiAskGeneration, AiCapability, AskAiRequest } from "@/entities/ai-assistant/model/ai-assistant.types";
import { askResponses, writingGeneration } from "./ai-ask.fixtures";

// Compiled by tsc; this function is intentionally not executed.
function checkNarrowing(response: AiAskResponse) {
  if (response.status === "GENERATION_CREATED") {
    expectTypeOf(response.capability).toEqualTypeOf<string>();
    expectTypeOf(response.generation.capability).toEqualTypeOf<string>();
    expectTypeOf(response.generation).toEqualTypeOf<AiAskGeneration>();
    // @ts-expect-error Wire capabilities require validation before legacy use.
    const capability: AiCapability = response.generation.capability;
    void capability;
  } else if (response.status === "PLAN_GENERATED") {
    expectTypeOf(response.planning.plan.status).toEqualTypeOf<"PLAN_READY">();
    expectTypeOf(response.generationId).toEqualTypeOf<string>();
    expectTypeOf(response.preview.type).toEqualTypeOf<"AI_MODIFICATION_PLAN">();
  } else if (response.status === "PLAN_NEEDS_MORE_CONTEXT") {
    expectTypeOf(response.planning.plan.status).toEqualTypeOf<"NEED_MORE_CONTEXT">();
    expectTypeOf(response.planning.plan.operations).toEqualTypeOf<[]>();
    expectTypeOf(response.planning.plan.contextRequests).toBeArray();
  } else {
    // @ts-expect-error Feedback does not guarantee a generation ID.
    void response.generationId;
    // @ts-expect-error Feedback does not contain a generation.
    void response.generation;
    // @ts-expect-error Feedback does not contain a preview.
    void response.preview;
    if (response.status === "NEEDS_CLARIFICATION" || response.status === "UNSUPPORTED_OPERATION") {
      if (response.capability === null) {
        expectTypeOf(response.reason).toEqualTypeOf<string>();
        // @ts-expect-error Business feedback has no planning.
        void response.planning;
      } else {
        expectTypeOf(response.planning.reason).toBeString();
        // @ts-expect-error Planning reason is nested.
        void response.reason;
      }
    }
    if (response.status === "AMBIGUOUS_PAGE") expectTypeOf(response.planning.candidates).toBeArray();
  }
}
void checkNarrowing;
type ReadyResponse = Extract<AiAskResponse, { status: "PLAN_GENERATED" }>;
type ContextResponse = Extract<AiAskResponse, { status: "PLAN_NEEDS_MORE_CONTEXT" }>;

describe("Ask wire types", () => {
  it("covers all twelve response variants with distinct nested plan status", () => {
    expect(Object.keys(askResponses)).toHaveLength(12);
    expectTypeOf<ReadyResponse["planning"]["plan"]["status"]>().toEqualTypeOf<"PLAN_READY">();
    expectTypeOf<ContextResponse["planning"]["plan"]["status"]>().toEqualTypeOf<"NEED_MORE_CONTEXT">();
    expectTypeOf<ContextResponse>().not.toExtend<ReadyResponse>();
    expectTypeOf<AskAiRequest>().not.toHaveProperty("capability");
    expectTypeOf<AskAiRequest>().not.toHaveProperty("userId");
  });
  it("retains unknown wire capability without widening legacy AiCapability", () => {
    const response: AiAskResponse = { ...askResponses.writing, capability: "future.action",
      generation: { ...writingGeneration, capability: "future.action" } };
    expect(response.generation.capability).toBe("future.action");
  });
});
