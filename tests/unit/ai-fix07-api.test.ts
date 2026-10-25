import { afterEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/shared/api/api-client";
import type { AxiosRequestConfig } from "axios";
import * as api from "@/entities/ai-assistant/api/ai-assistant.api";
import { aiHistoryKeys } from "@/entities/ai-assistant/model/ai-assistant.queries";
import { workspaceId, pageId, conversationId, generationId, requestId } from "./ai-ask.fixtures";

const token = "secret-page-token-A";
const signal = new AbortController().signal;
const ask = { workspaceId, currentPageId: pageId, instruction: "Add QA", requestId };
const message = { content: "QA", capability: "writing.improve" as const, requestId };
const planner = { instruction: "Add QA", requestId };
const filters = { workspaceId, scope: "PAGE" as const, pageId };
const cases = [
  ["ask", "post", "/ai-assistant/ask", (t?: string) => api.askAi(ask, t), ask, 180000],
  ["create", "post", "/ai-assistant/conversations", (t?: string) => api.createAiConversation({ workspaceId, pageId, scope: "PAGE" }, t), { workspaceId, pageId, scope: "PAGE" }, undefined],
  ["detail", "get", `/ai-assistant/conversations/${conversationId}`, (t?: string) => api.getAiConversation(conversationId, signal, t), undefined, undefined],
  ["list", "get", "/ai-assistant/conversations", (t?: string) => api.listAiConversations(filters, "cursor-1", signal, t), undefined, undefined],
  ["messages", "get", `/ai-assistant/conversations/${conversationId}/messages`, (t?: string) => api.listAiConversationMessages(conversationId, "cursor-1", signal, t), undefined, undefined],
  ["generations", "get", `/ai-assistant/conversations/${conversationId}/generations`, (t?: string) => api.listAiConversationGenerations(conversationId, "cursor-1", signal, t), undefined, undefined],
  ["submit", "post", `/ai-assistant/conversations/${conversationId}/messages`, (t?: string) => api.submitAiMessage(conversationId, message, t), message, 90000],
  ["plan", "post", `/ai-assistant/pages/${pageId}/modification-plan`, (t?: string) => api.generateAiModificationPlan(pageId, planner, t), planner, 180000],
  ["instruction", "post", "/ai-assistant/pages/modification-plan/from-instruction", (t?: string) => api.generatePagePlanFromInstruction({ workspaceId, ...planner }, t), { workspaceId, ...planner }, 180000],
  ["generation", "get", `/ai-assistant/generations/${generationId}`, (t?: string) => api.getAiGeneration(generationId, signal, t), undefined, undefined],
  ["composition", "post", `/ai-assistant/generations/${generationId}/confirm`, (t?: string) => api.confirmPageComposition(generationId, { parentPageId: pageId }, t), { parentPageId: pageId }, 90000],
  ["modification", "post", `/ai-assistant/generations/${generationId}/confirm`, (t?: string) => api.confirmAiModificationPlan(generationId, t), {}, 90000],
  ["discard", "post", `/ai-assistant/generations/${generationId}/discard`, (t?: string) => api.discardAiGeneration(generationId, t), undefined, undefined],
] as const;
afterEach(() => vi.restoreAllMocks());

describe("FIX07 real Axios wrapper contracts", () => {
  it.each(cases)("%s propagates query token without altering payload, timeout or signal", async (_name, method, url, call, body, timeout) => {
    const request = vi.spyOn(apiClient, method).mockResolvedValue({ data: { data: { ok: true } } });
    const logs = [vi.spyOn(console, "log"), vi.spyOn(console, "warn"), vi.spyOn(console, "error"), vi.spyOn(console, "debug")];
    await call(token);
    const args = request.mock.calls[0];
    expect(args[0]).toBe(url);
    const config = args[method === "get" ? 1 : 2] as AxiosRequestConfig | undefined;
    expect(config).toMatchObject({ params: { shareToken: token } });
    if (method === "get") expect(config).toMatchObject({ signal });
    else expect(args[1]).toEqual(body);
    if (timeout) expect(config).toMatchObject({ timeout });
    expect(JSON.stringify(body) ?? "").not.toContain(token);
    expect(request).toHaveBeenCalledTimes(1);
    for (const log of logs) expect(log).not.toHaveBeenCalled();
  });

  it.each(cases)("%s retains no-token request shape", async (_name, method, _url, call) => {
    const request = vi.spyOn(apiClient, method).mockResolvedValue({ data: { data: {} } });
    await call();
    const args = request.mock.calls[0];
    const config = args[method === "get" ? 1 : 2] as AxiosRequestConfig | undefined;
    expect(config?.params ?? {}).not.toHaveProperty("shareToken");
    expect(JSON.stringify(args)).not.toMatch(/shareToken|null/);
    if (["list", "messages", "generations"].includes(_name)) {
      expect(config?.params).toMatchObject({ cursor: "cursor-1", limit: _name === "list" ? 30 : 100 });
    }
  });

  it.each(["conversation", "messages", "generations"] as const)("partitions %s keys across direct/A/B without embedding a secret", (kind) => {
    const direct = aiHistoryKeys[kind]("user-1", conversationId);
    const a = aiHistoryKeys[kind]("user-1", conversationId, "opaque-A");
    const b = aiHistoryKeys[kind]("user-1", conversationId, "opaque-B");
    expect(a).not.toEqual(direct);
    expect(a).not.toEqual(b);
    expect(JSON.stringify(a)).not.toContain(token);
  });
  it("partitions list filters and FIX06 markers by access identity", () => {
    expect(aiHistoryKeys.conversations("user-1", filters, "opaque-A"))
      .not.toEqual(aiHistoryKeys.conversations("user-1", filters, "opaque-B"));
  });
});
