import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemplateDatabasePreview } from "@/features/template-preview";
import type {
	TemplateBlock,
	TemplateDatabaseSnapshot,
} from "@/entities/template";

describe("TemplateDatabasePreview", () => {
	const mockSnapshot: TemplateDatabaseSnapshot = {
		id: "db-123",
		version_id: "ver-1",
		name: "Sprint Tasks",
		properties: [
			{
				id: "prop-title",
				template_database_id: "db-123",
				name: "Task Name",
				type: "TITLE",
				is_default: true,
				is_hideable: false,
				position: "a0",
				options: [],
			},
			{
				id: "prop-status",
				template_database_id: "db-123",
				name: "Status",
				type: "STATUS",
				is_default: false,
				is_hideable: true,
				position: "a1",
				options: [
					{
						id: "opt-in-progress",
						template_property_id: "prop-status",
						name: "In Progress",
						color: "blue",
						position: "0",
					},
					{
						id: "opt-done",
						template_property_id: "prop-status",
						name: "Completed",
						color: "green",
						position: "1",
					},
				],
			},
			{
				id: "prop-select",
				template_database_id: "db-123",
				name: "Priority",
				type: "SELECT",
				is_default: false,
				is_hideable: true,
				position: "a2",
				options: [
					{
						id: "opt-high",
						template_property_id: "prop-select",
						name: "Urgent",
						color: "red",
						position: "0",
					},
				],
			},
			{
				id: "prop-multiselect",
				template_database_id: "db-123",
				name: "Tags",
				type: "MULTI_SELECT",
				is_default: false,
				is_hideable: true,
				position: "a3",
				options: [
					{
						id: "opt-frontend",
						template_property_id: "prop-multiselect",
						name: "Frontend",
						color: "purple",
						position: "0",
					},
					{
						id: "opt-backend",
						template_property_id: "prop-multiselect",
						name: "Backend",
						color: "amber",
						position: "1",
					},
				],
			},
			{
				id: "prop-number",
				template_database_id: "db-123",
				name: "Story Points",
				type: "NUMBER",
				is_default: false,
				is_hideable: true,
				position: "a4",
				options: [],
			},
			{
				id: "prop-checkbox",
				template_database_id: "db-123",
				name: "Blocked",
				type: "CHECKBOX",
				is_default: false,
				is_hideable: true,
				position: "a5",
				options: [],
			},
			{
				id: "prop-date",
				template_database_id: "db-123",
				name: "Sprint Dates",
				type: "DATE",
				is_default: false,
				is_hideable: true,
				position: "a6",
				options: [],
			},
			{
				id: "prop-person",
				template_database_id: "db-123",
				name: "Assignee",
				type: "PERSON",
				is_default: false,
				is_hideable: true,
				position: "a7",
				options: [],
			},
			{
				id: "prop-url",
				template_database_id: "db-123",
				name: "Docs Link",
				type: "URL",
				is_default: false,
				is_hideable: true,
				position: "a8",
				options: [],
			},
			{
				id: "prop-email",
				template_database_id: "db-123",
				name: "Contact Email",
				type: "EMAIL",
				is_default: false,
				is_hideable: true,
				position: "a9",
				options: [],
			},
		],
		rows: [
			{
				id: "row-1",
				template_database_id: "db-123",
				values: [
					{
						id: "val-1",
						template_row_id: "row-1",
						template_property_id: "prop-title",
						value: "Implement Auth Flow",
					},
					{
						id: "val-2",
						template_row_id: "row-1",
						template_property_id: "prop-status",
						value: "opt-in-progress",
					},
					{
						id: "val-select",
						template_row_id: "row-1",
						template_property_id: "prop-select",
						value: "opt-high",
					},
					{
						id: "val-multi",
						template_row_id: "row-1",
						template_property_id: "prop-multiselect",
						value: ["opt-frontend", "opt-backend"],
					},
					{
						id: "val-3",
						template_row_id: "row-1",
						template_property_id: "prop-number",
						value: 8,
					},
					{
						id: "val-4",
						template_row_id: "row-1",
						template_property_id: "prop-checkbox",
						value: true,
					},
					{
						id: "val-5",
						template_row_id: "row-1",
						template_property_id: "prop-date",
						value: { start: "2026-10-01", end: "2026-10-15" },
					},
					{
						id: "val-person",
						template_row_id: "row-1",
						template_property_id: "prop-person",
						value: ["user-uuid-123"],
					},
					{
						id: "val-url",
						template_row_id: "row-1",
						template_property_id: "prop-url",
						value: "https://example.com/spec",
					},
					{
						id: "val-email",
						template_row_id: "row-1",
						template_property_id: "prop-email",
						value: "lead@example.com",
					},
				],
			},
			{
				id: "row-2",
				template_database_id: "db-123",
				values: [
					{
						id: "val-6",
						template_row_id: "row-2",
						template_property_id: "prop-title",
						value: "Deploy API Gateway",
					},
					{
						id: "val-7",
						template_row_id: "row-2",
						template_property_id: "prop-status",
						value: "opt-done",
					},
					{
						id: "val-8",
						template_row_id: "row-2",
						template_property_id: "prop-number",
						value: 5,
					},
					{
						id: "val-9",
						template_row_id: "row-2",
						template_property_id: "prop-checkbox",
						value: false,
					},
				],
			},
		],
		views: [
			{
				id: "view-board",
				template_database_id: "db-123",
				name: "Active Sprint",
				type: "TABLE",
				position: "0",
				properties: [
					{
						id: "vp-1",
						template_view_id: "view-board",
						template_property_id: "prop-title",
						position: "0",
						visible: true,
						width: 200,
					},
					{
						id: "vp-2",
						template_view_id: "view-board",
						template_property_id: "prop-status",
						position: "1",
						visible: true,
						width: 150,
					},
					{
						id: "vp-select",
						template_view_id: "view-board",
						template_property_id: "prop-select",
						position: "2",
						visible: true,
						width: 120,
					},
					{
						id: "vp-multi",
						template_view_id: "view-board",
						template_property_id: "prop-multiselect",
						position: "3",
						visible: true,
						width: 160,
					},
					{
						id: "vp-3",
						template_view_id: "view-board",
						template_property_id: "prop-number",
						position: "4",
						visible: true,
						width: 100,
					},
					{
						id: "vp-4",
						template_view_id: "view-board",
						template_property_id: "prop-checkbox",
						position: "5",
						visible: true,
						width: 80,
					},
					{
						id: "vp-5",
						template_view_id: "view-board",
						template_property_id: "prop-date",
						position: "6",
						visible: true,
						width: 180,
					},
					{
						id: "vp-person",
						template_view_id: "view-board",
						template_property_id: "prop-person",
						position: "7",
						visible: true,
						width: 140,
					},
					{
						id: "vp-url",
						template_view_id: "view-board",
						template_property_id: "prop-url",
						position: "8",
						visible: true,
						width: 180,
					},
					{
						id: "vp-email",
						template_view_id: "view-board",
						template_property_id: "prop-email",
						position: "9",
						visible: true,
						width: 180,
					},
				],
			},
		],
	};

	const mockBlock: TemplateBlock = {
		id: "block-db-1",
		version_id: "ver-1",
		parent_block_id: null,
		type: "DATABASE_VIEW",
		title: null,
		position_x: null,
		position_y: null,
		width: null,
		height: null,
		order_index: 0,
		content: {},
		style_config: {},
		data_config: {
			database_id: "db-123",
			view_id: "view-board",
		},
		created_by: "user-1",
		is_open: true,
		created_at: "2026-10-01T00:00:00Z",
		updated_at: "2026-10-01T00:00:00Z",
	};

	it("renders real database and view names from snapshot", () => {
		render(
			<TemplateDatabasePreview
				block={mockBlock}
				databases={[mockSnapshot]}
			/>,
		);

		expect(screen.getByText("Sprint Tasks")).toBeInTheDocument();
		expect(screen.getByText(/Active Sprint · 2 rows/)).toBeInTheDocument();
	});

	it("renders real columns from view visible properties without fake fallback", () => {
		render(
			<TemplateDatabasePreview
				block={mockBlock}
				databases={[mockSnapshot]}
			/>,
		);

		expect(screen.getByText("Task Name")).toBeInTheDocument();
		expect(screen.getByText("Status")).toBeInTheDocument();
		expect(screen.getByText("Priority")).toBeInTheDocument();
		expect(screen.getByText("Tags")).toBeInTheDocument();
		expect(screen.getByText("Story Points")).toBeInTheDocument();
		expect(screen.getByText("Blocked")).toBeInTheDocument();
		expect(screen.getByText("Sprint Dates")).toBeInTheDocument();
		expect(screen.getByText("Assignee")).toBeInTheDocument();
		expect(screen.getByText("Docs Link")).toBeInTheDocument();
		expect(screen.getByText("Contact Email")).toBeInTheDocument();

		// Verify fake fallback rows are absent
		expect(
			screen.queryByText("Team Onboarding Guide"),
		).not.toBeInTheDocument();
		expect(
			screen.queryByText("Technical Architecture Spec"),
		).not.toBeInTheDocument();
	});

	it("renders real typed row values correctly", () => {
		render(
			<TemplateDatabasePreview
				block={mockBlock}
				databases={[mockSnapshot]}
			/>,
		);

		// TITLE
		expect(screen.getByText("Implement Auth Flow")).toBeInTheDocument();
		expect(screen.getByText("Deploy API Gateway")).toBeInTheDocument();

		// STATUS option names resolved from template option ID
		expect(screen.getByText("In Progress")).toBeInTheDocument();
		expect(screen.getByText("Completed")).toBeInTheDocument();

		// SELECT option name resolved from template option ID
		expect(screen.getByText("Urgent")).toBeInTheDocument();

		// MULTI_SELECT option names resolved from template option IDs
		expect(screen.getByText("Frontend")).toBeInTheDocument();
		expect(screen.getByText("Backend")).toBeInTheDocument();

		// NUMBER
		expect(screen.getByText("8")).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();

		// DATE
		expect(
			screen.getByText("2026-10-01 → 2026-10-15"),
		).toBeInTheDocument();

		// PERSON (read-only truncated id)
		expect(screen.getByText("user-uui...")).toBeInTheDocument();

		// URL & EMAIL
		expect(screen.getByText("https://example.com/spec")).toBeInTheDocument();
		expect(screen.getByText("lead@example.com")).toBeInTheDocument();
	});

	it("renders empty snapshot unavailable message when database is not found", () => {
		const blockMissingDb: TemplateBlock = {
			...mockBlock,
			data_config: { database_id: "db-non-existent" },
		};

		render(
			<TemplateDatabasePreview
				block={blockMissingDb}
				databases={[mockSnapshot]}
			/>,
		);

		expect(
			screen.getByText("Database snapshot unavailable"),
		).toBeInTheDocument();
		expect(
			screen.queryByText("Team Onboarding Guide"),
		).not.toBeInTheDocument();
	});

	it("handles snapshot with 0 rows correctly", () => {
		const emptyRowsSnapshot: TemplateDatabaseSnapshot = {
			...mockSnapshot,
			rows: [],
		};

		render(
			<TemplateDatabasePreview
				block={mockBlock}
				databases={[emptyRowsSnapshot]}
			/>,
		);

		expect(screen.getByText(/Active Sprint · 0 rows/)).toBeInTheDocument();
		expect(
			screen.getByText("No rows in this database snapshot"),
		).toBeInTheDocument();
	});
});
