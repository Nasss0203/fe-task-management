import { describe, expect, it } from "vitest";
import type { AiAskResponse } from "@/entities/ai-assistant/model/ai-assistant.types";
import { mapAiAskResponse } from "@/widgets/ai-chat/model/ai-ask-response-mapper";
import { askResponses, workspaceId } from "./ai-ask.fixtures";

// M4 (kế hoạch lọc theo cấu trúc, E5): a titled Page in a named place.
const scope = { parentTitle: "Dự án A", teamspaceName: null };
type Planning = { planning: { intent: object; candidates?: object[] } };
const scopedIntent = { ...(askResponses.plan as unknown as Planning).planning.intent, scope };
const withPlanning = (response: AiAskResponse, planning: Record<string, unknown>) =>
	({ ...response, planning: { ...(response as unknown as Planning).planning, ...planning } }) as AiAskResponse;

describe("M4: a Page in a named place", () => {
	it("accepts a draft whose intent carries the place", () => {
		const plan = withPlanning(askResponses.plan, { intent: scopedIntent });
		expect(mapAiAskResponse(plan, { workspaceId, instruction: "Thêm checklist vào trang Tasks trong trang Dự án A" }).kind)
			.toBe("plan");
	});

	it("offers every Page with the title when none is in the place", () => {
		const ambiguous = withPlanning(askResponses.ambiguous, { intent: scopedIntent, scopeUnmatched: true });
		expect(mapAiAskResponse(ambiguous, { workspaceId, instruction: "Thêm checklist vào trang Tasks trong trang Dự án C" }))
			.toMatchObject({ kind: "page-selection" });
	});
});
