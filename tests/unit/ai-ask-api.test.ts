import { afterEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import apiClient from "@/shared/api/api-client";
import { askAi } from "@/entities/ai-assistant/api/ai-assistant.api";
import type { AskAiRequest } from "@/entities/ai-assistant/model/ai-assistant.types";
import { askResponses, requestId, workspaceId, pageId, conversationId } from "./ai-ask.fixtures";

afterEach(() => vi.restoreAllMocks());

describe("Unified Ask API", () => {
  it.each(Object.entries(askResponses))("unwraps HTTP 201 %s without converting business status", async (_name, response) => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({
      status: 201, data: { statusCode: 201, message: "AI request processed", data: response },
    });
    const input: AskAiRequest = {
      workspaceId, instruction: '  Add heading "QA"  ', selectedText: "Original text",
      currentPageId: pageId, selectedPageId: pageId, conversationId, requestId,
    };
    expect(await askAi(input)).toBe(response);
    expect(post).toHaveBeenCalledExactlyOnceWith("/ai-assistant/ask", input, { timeout: 180_000 });
    expect(post.mock.calls[0][1]).toBe(input);
    expect(post.mock.calls[0][1]).not.toHaveProperty("userId");
    expect(post.mock.calls[0][1]).not.toHaveProperty("capability");
  });

  it.each([
    { workspaceId, instruction: "Help" },
    { workspaceId, instruction: "Help", selectedText: null, currentPageId: null,
      selectedPageId: null, conversationId: null, requestId: null },
  ] satisfies AskAiRequest[])("preserves omitted and null context", async (input) => {
    const post = vi.spyOn(apiClient, "post").mockResolvedValue({ data: { data: askResponses.clarification } });
    await askAi(input);
    expect(post.mock.calls[0][1]).toEqual(input);
    expect(apiClient.defaults.timeout).toBe(10_000);
  });

  it.each(["ECONNABORTED", "ERR_NETWORK", "ERR_BAD_RESPONSE"])("propagates %s without retry or logging", async (code) => {
    const error = new AxiosError("synthetic-sensitive-marker", code);
    const post = vi.spyOn(apiClient, "post").mockRejectedValue(error);
    const logs = [vi.spyOn(console, "log"), vi.spyOn(console, "warn"), vi.spyOn(console, "error"), vi.spyOn(console, "debug")];
    await expect(askAi({ workspaceId, instruction: "Help" })).rejects.toBe(error);
    expect(post).toHaveBeenCalledTimes(1);
    for (const log of logs) expect(log).not.toHaveBeenCalled();
  });
});
