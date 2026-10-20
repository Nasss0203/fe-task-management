import { describe, expect, it } from "vitest";
import { mergeAiWorkspaceHistory, shouldReuseAiConversation } from "@/widgets/ai-chat/model/ai-history-conversations";
import { getAiChatScope } from "@/widgets/ai-chat/model/use-ai-chat-store";
import { mapAiHistoryMessages } from "@/widgets/ai-chat/model/ai-history-mapper";
import type { AiConversation, AiGeneration, AiHistoryMessage } from "@/entities/ai-assistant/model/ai-assistant.types";

const makeConversation = (
  id: string, scope: "PAGE" | "GLOBAL", workspace_id = "workspace-1",
): AiConversation => ({
  id, scope, workspace_id, page_id: scope === "PAGE" ? "page-1" : null,
  title: id, status: "ACTIVE", created_at: "2026-10-18T10:00:00.000Z",
  updated_at: "2026-10-18T10:00:00.000Z",
});

describe("Phase 4 workspace PAGE draft recovery", () => {
  it("merges GLOBAL and PAGE conversations once, filters foreign Workspace and sorts stably", () => {
    const global = makeConversation("global-a", "GLOBAL");
    const page = makeConversation("page-a", "PAGE");
    expect(mergeAiWorkspaceHistory(
      [global, makeConversation("foreign", "GLOBAL", "workspace-2")],
      [page, page], "workspace-1", true,
    ).map((item) => item.id)).toEqual(["page-a", "global-a"]);
    expect(mergeAiWorkspaceHistory([global], [page], "workspace-1", false))
      .toEqual([global]);
  });

  it("never reuses PAGE conversations for GLOBAL messages or the wrong Page", () => {
    const page = makeConversation("page-a", "PAGE");
    expect(shouldReuseAiConversation(page, "workspace-1", "GLOBAL")).toBe(false);
    expect(shouldReuseAiConversation(page, "workspace-1", "PAGE", "page-2")).toBe(false);
    expect(shouldReuseAiConversation(page, "workspace-1", "PAGE", "page-1")).toBe(true);
  });

  it("separates user/workspace ephemeral threads", () => {
    expect(getAiChatScope(undefined, "workspace-a", "user-a")).not.toBe(
      getAiChatScope(undefined, "workspace-b", "user-a"),
    );
    expect(getAiChatScope(undefined, "workspace-a", "user-a")).not.toBe(
      getAiChatScope(undefined, "workspace-a", "user-b"),
    );
  });

  it("marks recovered Dashboard PAGE draft preview-only", () => {
    const generation = {
      id: "generation-1", capability: "GENERATE_PAGE_MODIFICATION_PLAN",
    } as AiGeneration;
    const messages = [{
      id: "message-1", conversation_id: "page-a", role: "ASSISTANT",
      content: "Plan ready", metadata: { generationId: "generation-1" },
      created_at: "2026-10-18T10:00:00.000Z",
    }] as AiHistoryMessage[];
    expect(mapAiHistoryMessages(messages, [generation], { previewOnly: true })[0].previewOnly).toBe(true);
    expect(mapAiHistoryMessages(messages, [generation])[0].previewOnly).toBeUndefined();
  });
});
