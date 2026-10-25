import { act, cleanup, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import { useAskAi, useCreateAiConversation, useSubmitAiMessage, useGenerateAiModificationPlan, useGeneratePagePlanFromInstruction, useConfirmPageComposition, useConfirmAiModificationPlan, useDiscardAiGeneration } from "@/entities/ai-assistant/model/ai-assistant.mutations";
import { askResponses, workspaceId, pageId, generationId, conversationId, requestId } from "./ai-ask.fixtures";
import { foundationConversation, foundationGeneration } from "./ai-foundation.fixtures";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: 3, retryDelay: 0 } } });
  const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const hook = renderHook(() => ({ ask: useAskAi(), create: useCreateAiConversation(), submit: useSubmitAiMessage(), plan: useGenerateAiModificationPlan(), instruction: useGeneratePagePlanFromInstruction(), composition: useConfirmPageComposition(), modification: useConfirmAiModificationPlan(), discard: useDiscardAiGeneration() }), { wrapper });
  return { client, ...hook };
}
const token = "operation-secret-A";
const instruction = { workspaceId, currentPageId: pageId, instruction: "Add QA", requestId };
const message = { content: "QA", capability: "writing.improve" as const, requestId };

describe("FIX07 mutation variables", () => {
  it("forwards captured tokens separately from business payload for all eight mutations", async () => {
    const ask = vi.spyOn(api, "askAi").mockResolvedValue(askResponses.clarification);
    const create = vi.spyOn(api, "createAiConversation").mockResolvedValue(foundationConversation);
    const submit = vi.spyOn(api, "submitAiMessage").mockResolvedValue(foundationGeneration);
    const plan = vi.spyOn(api, "generateAiModificationPlan").mockResolvedValue(askResponses.plan.planning.plan);
    const planner = vi.spyOn(api, "generatePagePlanFromInstruction").mockResolvedValue(askResponses.plan.planning);
    const execution = { pageId, blockIds: {}, databaseIds: {}, propertyIds: {}, optionIds: {}, viewIds: {}, rowIds: {} };
    const composition = vi.spyOn(api, "confirmPageComposition").mockResolvedValue({ generation: foundationGeneration, execution });
    const modification = vi.spyOn(api, "confirmAiModificationPlan").mockResolvedValue({ generation: foundationGeneration, execution: { createdBlockIds: [], createdRowIds: [] } });
    const discard = vi.spyOn(api, "discardAiGeneration").mockResolvedValue(foundationGeneration);
    const { result, client } = setup();
    await act(async () => {
      await result.current.ask.mutateAsync({ ...instruction, shareToken: token });
      await result.current.create.mutateAsync({ workspaceId, scope: "PAGE", pageId, shareToken: token });
      await result.current.submit.mutateAsync({ conversationId, input: message, shareToken: token });
      await result.current.plan.mutateAsync({ pageId, input: { instruction: "Add QA", requestId }, shareToken: token });
      await result.current.instruction.mutateAsync({ ...instruction, shareToken: token });
      await result.current.composition.mutateAsync({ generationId, input: { parentPageId: pageId }, shareToken: token });
      await result.current.modification.mutateAsync({ generationId, pageId, shareToken: token });
      await result.current.discard.mutateAsync({ generationId, shareToken: token });
    });
    expect(ask).toHaveBeenCalledExactlyOnceWith(instruction, token);
    expect(create).toHaveBeenCalledExactlyOnceWith({ workspaceId, scope: "PAGE", pageId }, token);
    expect(submit).toHaveBeenCalledExactlyOnceWith(conversationId, message, token);
    expect(plan).toHaveBeenCalledExactlyOnceWith(pageId, { instruction: "Add QA", requestId }, token);
    expect(planner).toHaveBeenCalledExactlyOnceWith(instruction, token);
    expect(composition).toHaveBeenCalledExactlyOnceWith(generationId, { parentPageId: pageId }, token);
    expect(modification).toHaveBeenCalledExactlyOnceWith(generationId, token);
    expect(discard).toHaveBeenCalledExactlyOnceWith(generationId, token);
    client.clear();
  });

  it("overrides retry-enabled defaults for every side effect", async () => {
    const error = new Error("network outcome unknown");
    const spies = [vi.spyOn(api, "askAi"), vi.spyOn(api, "createAiConversation"), vi.spyOn(api, "submitAiMessage"), vi.spyOn(api, "generateAiModificationPlan"), vi.spyOn(api, "generatePagePlanFromInstruction"), vi.spyOn(api, "confirmPageComposition"), vi.spyOn(api, "confirmAiModificationPlan"), vi.spyOn(api, "discardAiGeneration")];
    for (const spy of spies) spy.mockRejectedValue(error);
    const { result, client } = setup();
    await act(async () => {
      const calls = [result.current.ask.mutateAsync({ ...instruction, shareToken: token }), result.current.create.mutateAsync({ workspaceId, shareToken: token }), result.current.submit.mutateAsync({ conversationId, input: message, shareToken: token }), result.current.plan.mutateAsync({ pageId, input: { instruction: "QA" }, shareToken: token }), result.current.instruction.mutateAsync({ ...instruction, shareToken: token }), result.current.composition.mutateAsync({ generationId, shareToken: token }), result.current.modification.mutateAsync({ generationId, pageId, shareToken: token }), result.current.discard.mutateAsync({ generationId, shareToken: token })];
      for (const outcome of await Promise.allSettled(calls)) expect(outcome).toMatchObject({ status: "rejected", reason: error });
    });
    for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
    client.clear();
  });
});
