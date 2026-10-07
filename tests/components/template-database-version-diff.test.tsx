import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemplateDatabasePreview } from "@/features/template-preview";
import type {
	TemplateBlock,
	TemplateDatabaseSnapshot,
} from "@/entities/template";
import versionData from "../fixtures/real-version-diff.json";

describe("Template Database Version Visibility Isolation", () => {
	const v1Data = versionData.v1;
	const v2Data = versionData.v2;

	const dbBlockV1 = v1Data.blocks.find(
		(b: TemplateBlock) => b.type === "DATABASE_VIEW",
	) as TemplateBlock;

	const dbBlockV2 = v2Data.blocks.find(
		(b: TemplateBlock) => b.type === "DATABASE_VIEW",
	) as TemplateBlock;

	const databasesV1 = v1Data.databases as TemplateDatabaseSnapshot[];
	const databasesV2 = v2Data.databases as TemplateDatabaseSnapshot[];

	it("1. Baseline v1: Priority column is visible in v1 UI", () => {
		render(
			<TemplateDatabasePreview
				block={dbBlockV1}
				databases={databasesV1}
			/>,
		);

		// Priority column header is visible
		expect(screen.getByText("Priority")).toBeInTheDocument();
		expect(screen.getByText("Status")).toBeInTheDocument();
		expect(screen.getByText("Team")).toBeInTheDocument();
		expect(screen.getByText("Story Points")).toBeInTheDocument();
		expect(screen.getByText("Due date")).toBeInTheDocument();

		// Real database title and row count
		expect(screen.getByText("Release Tasks")).toBeInTheDocument();
		expect(screen.getByText(/Release Overview · 8 rows/)).toBeInTheDocument();
	});

	it("2. v2 Result: Priority column is hidden in v2 UI after being hidden in source view", () => {
		render(
			<TemplateDatabasePreview
				block={dbBlockV2}
				databases={databasesV2}
			/>,
		);

		// Priority column header is NOT visible
		expect(screen.queryByText("Priority")).not.toBeInTheDocument();

		// Other columns remain visible
		expect(screen.getByText("Status")).toBeInTheDocument();
		expect(screen.getByText("Team")).toBeInTheDocument();
		expect(screen.getByText("Story Points")).toBeInTheDocument();
		expect(screen.getByText("Due date")).toBeInTheDocument();

		// Rows still render correctly
		expect(screen.getByText("Release Tasks")).toBeInTheDocument();
		expect(screen.getByText(/Release Overview · 8 rows/)).toBeInTheDocument();
	});

	it("3. Re-check v1: Priority column remains visible in v1 UI (immutable snapshot)", () => {
		render(
			<TemplateDatabasePreview
				block={dbBlockV1}
				databases={databasesV1}
			/>,
		);

		// Priority column header is still visible in v1
		expect(screen.getByText("Priority")).toBeInTheDocument();
		expect(screen.getByText("Status")).toBeInTheDocument();
		expect(screen.getByText("Team")).toBeInTheDocument();
	});
});
