import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { buildPageBlockTree } from "@/entities/page-block/lib/build-page-block-tree";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { PageBlockEditorProvider } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { MermaidBlockEditor } from "@/widgets/page-block-renderer/ui/mermaid-block-editor";
import { makePageBlock } from "../utils/page-block-fixture";
import { renderWithClient } from "../utils/test-utils";

vi.mock("@/shared/api/api-client", () => ({ default: { patch: vi.fn() }, refreshAccessToken: vi.fn() }));
vi.mock("@/shared/ui/mermaid-diagram", () => ({
	MermaidDiagram: ({ code }: { code: string }) => <pre data-testid='diagram'>{code}</pre>,
}));
vi.mock("@uiw/react-codemirror", () => ({
	oneDark: [],
	Prec: { highest: (extension: unknown) => extension },
	EditorView: { theme: () => [] },
	default: ({ value }: { value: string }) => <textarea aria-label='Code' defaultValue={value} />,
}));

function renderMermaid(text: string) {
	const [block] = buildPageBlockTree([makePageBlock({ type: PageBlockType.MERMAID, content: { text } })]);

	return renderWithClient(
		<PageBlockEditorProvider orderedBlockIds={[block.id]}>
			<MermaidBlockEditor block={block} />
		</PageBlockEditorProvider>,
	);
}

describe("MermaidBlockEditor", () => {
	it("shows the diagram first and switches to the code tab", async () => {
		const user = userEvent.setup();
		renderMermaid("graph TD; A-->B");

		expect(screen.getByTestId("diagram")).toHaveTextContent("graph TD; A-->B");
		// Editor vẫn trong DOM nhưng panel đang ẩn (Tailwind ẩn theo data-state, jsdom không chạy CSS)
		const codePanel = () => screen.getByRole("textbox", { name: "Code", hidden: true }).closest("[role=tabpanel]");
		expect(codePanel()).toHaveAttribute("data-state", "inactive");

		await user.click(screen.getByRole("tab", { name: "Code" }));

		expect(codePanel()).toHaveAttribute("data-state", "active");
		expect(screen.queryByTestId("diagram")).not.toBeInTheDocument();
	});

	it("opens the code tab for a new empty diagram", () => {
		renderMermaid("");

		expect(screen.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByRole("textbox", { name: "Code", hidden: true }).closest("[role=tabpanel]")).toHaveAttribute(
			"data-state",
			"active",
		);
	});
});
