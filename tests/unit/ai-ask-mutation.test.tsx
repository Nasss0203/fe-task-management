import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import { useAskAi, useCreateAiConversation, useSubmitAiMessage, useGenerateAiModificationPlan,
  useGeneratePagePlanFromInstruction, useConfirmPageComposition, useConfirmAiModificationPlan,
  useDiscardAiGeneration } from "@/entities/ai-assistant/model/ai-assistant.mutations";
import { pageKeys } from "@/entities/page/model/page.queries";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import { databaseKeys } from "@/entities/database/model/database.queries";
import type { AiGeneration } from "@/entities/ai-assistant/model/ai-assistant.types";
import { askResponses, workspaceId, pageId, requestId, generationId, conversationId, writingGeneration } from "./ai-ask.fixtures";

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 3, retryDelay: 0 } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}
afterEach(() => vi.restoreAllMocks());

describe("useAskAi", () => {
  it.each(["writing", "composition", "plan", "context", "unsupported"] as const)("returns %s without implicit mutations or invalidation", async (name) => {
    const ask = vi.spyOn(api, "askAi").mockResolvedValue(askResponses[name]);
    const create = vi.spyOn(api, "createAiConversation");
    const confirm = vi.spyOn(api, "confirmPageComposition");
    const modify = vi.spyOn(api, "confirmAiModificationPlan");
    const discard = vi.spyOn(api, "discardAiGeneration");
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useAskAi(), { wrapper });
    const input = { workspaceId, instruction: "Prepare a draft", requestId };
    await act(async () => { expect(await result.current.mutateAsync(input)).toBe(askResponses[name]); });
    // M2: Ask also carries the browser's time zone.
    expect(ask).toHaveBeenCalledExactlyOnceWith({ ...input, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    for (const spy of [create, confirm, modify, discard, invalidate]) expect(spy).not.toHaveBeenCalled();
    client.clear();
  });

  it("overrides retry-enabled QueryClient defaults and propagates failure", async () => {
    const error = new Error("network unavailable");
    const ask = vi.spyOn(api, "askAi").mockRejectedValue(error);
    const { client, wrapper } = setup();
    const { result } = renderHook(() => useAskAi(), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync({ workspaceId, instruction: "Help" })).rejects.toBe(error);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(ask).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(error);
    client.clear();
  });
});

describe("legacy mutation regression", () => {
  it("keeps creation, submit, planner and discard dispatch unchanged", async () => {
    const generation: AiGeneration = { ...writingGeneration, capability: "writing.improve" };
    const conversation = { id: conversationId, workspace_id: workspaceId, scope: "GLOBAL" as const,
      page_id: null, title: "QA", status: "ACTIVE", created_at: generation.created_at, updated_at: generation.updated_at };
    const create = vi.spyOn(api, "createAiConversation").mockResolvedValue(conversation);
    const submit = vi.spyOn(api, "submitAiMessage").mockResolvedValue(generation);
    const plan = vi.spyOn(api, "generateAiModificationPlan").mockResolvedValue(askResponses.plan.planning.plan);
    const instruction = vi.spyOn(api, "generatePagePlanFromInstruction").mockResolvedValue(askResponses.plan.planning);
    const discard = vi.spyOn(api, "discardAiGeneration").mockResolvedValue({ ...generation, status: "DISCARDED" });
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => ({
      create: useCreateAiConversation(), submit: useSubmitAiMessage(), plan: useGenerateAiModificationPlan(),
      instruction: useGeneratePagePlanFromInstruction(), discard: useDiscardAiGeneration(),
    }), { wrapper });
    const submitInput = { content: "QA", capability: "writing.improve" as const };
    await act(async () => {
      await result.current.create.mutateAsync({ workspaceId });
      await result.current.submit.mutateAsync({ conversationId, input: submitInput });
      await result.current.plan.mutateAsync({ pageId, input: { instruction: "Add QA" } });
      await result.current.instruction.mutateAsync({ workspaceId, instruction: "Add QA" });
      await result.current.discard.mutateAsync(generationId);
    });
    expect(create).toHaveBeenCalledExactlyOnceWith({ workspaceId });
    expect(submit).toHaveBeenCalledExactlyOnceWith(conversationId, submitInput);
    expect(plan).toHaveBeenCalledExactlyOnceWith(pageId, { instruction: "Add QA" });
    expect(instruction).toHaveBeenCalledExactlyOnceWith({ workspaceId, instruction: "Add QA" });
    expect(discard).toHaveBeenCalledExactlyOnceWith(generationId);
    expect(invalidate).not.toHaveBeenCalled();
    client.clear();
  });

  it("preserves Composition and Modification Confirm cache invalidation", async () => {
    const generation: AiGeneration = { ...writingGeneration, capability: "GENERATE_PAGE_COMPOSITION", status: "APPLIED" };
    const composition = vi.spyOn(api, "confirmPageComposition").mockResolvedValue({ generation,
      execution: { pageId, blockIds: {}, databaseIds: {}, propertyIds: {}, optionIds: {}, viewIds: {}, rowIds: {} } });
    const modification = vi.spyOn(api, "confirmAiModificationPlan").mockResolvedValue({
      generation: { ...generation, capability: "GENERATE_PAGE_MODIFICATION_PLAN", output_data: {
        ...askResponses.plan.planning.plan, operations: [{ type: "CREATE_DATABASE_ROWS", databaseId: "db-1", rows: [{ values: {} }] }],
      } }, execution: { createdBlockIds: [], createdRowIds: ["row-1"] },
    });
    const { client, wrapper } = setup();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => ({ composition: useConfirmPageComposition(), modification: useConfirmAiModificationPlan() }), { wrapper });
    await act(async () => { await result.current.composition.mutateAsync({ generationId }); });
    expect(composition).toHaveBeenCalledExactlyOnceWith(generationId, {});
    expect(invalidate).toHaveBeenCalledExactlyOnceWith({ queryKey: pageKeys.byWorkspace(workspaceId) });
    invalidate.mockClear();
    await act(async () => { await result.current.modification.mutateAsync({ generationId, pageId: "stale-page" }); });
    expect(modification).toHaveBeenCalledExactlyOnceWith(generationId);
    expect(invalidate).toHaveBeenCalledTimes(3);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: pageKeys.detail(pageId) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: pageBlockKeys.byPage(pageId) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: databaseKeys.rows("db-1") });
    client.clear();
  });
});
