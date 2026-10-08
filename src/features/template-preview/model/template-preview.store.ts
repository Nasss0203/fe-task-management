import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { TemplatePreview } from "@/entities/template/model/template.types";

type TemplatePreviewStore = {
	sessionKey: string | null;
	initialSnapshot: TemplatePreview | null;
	preview: TemplatePreview | null;

	initialize: (
		templateId: string,
		versionId: string,
		snapshot: TemplatePreview,
	) => void;

	setRowValue: (
		databaseId: string,
		rowId: string,
		propertyId: string,
		value: unknown,
	) => void;

	setDatabaseView: (blockId: string, viewId: string) => void;
	setTodoChecked: (blockId: string, checked: boolean) => void;

	reset: () => void;
	clear: () => void;
};

export const useTemplatePreviewStore = create<TemplatePreviewStore>()(
	persist(
		(set, get) => ({
			sessionKey: null,
			initialSnapshot: null,
			preview: null,

			initialize: (templateId, versionId, snapshot) => {
				const sessionKey = `${templateId}:${versionId}`;

				if (get().sessionKey === sessionKey && get().preview) {
					return;
				}

				set({
					sessionKey,
					initialSnapshot: structuredClone(snapshot),
					preview: structuredClone(snapshot),
				});
			},

			setTodoChecked: (blockId, checked) => {
				const current = get().preview;

				if (!current) return;

				const next = structuredClone(current);

				const block = next.blocks.find(
					(item) => item.id === blockId && item.type === "TODO",
				);

				if (!block) return;

				block.content = {
					...(block.content ?? {}),
					checked,
				};

				set({
					preview: next,
				});
			},

			setRowValue: (databaseId, rowId, propertyId, value) => {
				const current = get().preview;

				if (!current) return;

				const next = structuredClone(current);

				const database = next.databases.find(
					(item) => item.id === databaseId,
				);

				if (!database) return;

				const propertyExists = database.properties.some(
					(property) => property.id === propertyId,
				);

				if (!propertyExists) return;

				const row = database.rows.find((item) => item.id === rowId);

				if (!row) return;

				const rowValue = row.values.find(
					(item) => item.template_property_id === propertyId,
				);

				if (rowValue) {
					rowValue.value = structuredClone(value);
				} else {
					row.values.push({
						id: `preview:${rowId}:${propertyId}`,
						template_row_id: rowId,
						template_property_id: propertyId,
						value: structuredClone(value),
					});
				}

				set({
					preview: next,
				});
			},

			setDatabaseView: (blockId, viewId) => {
				const current = get().preview;

				if (!current) return;

				const next = structuredClone(current);

				const block = next.blocks.find(
					(item) =>
						item.id === blockId && item.type === "DATABASE_VIEW",
				);

				if (!block) return;

				const databaseId =
					block.data_config?.database_id ??
					block.content?.database_id;

				const database = next.databases.find(
					(item) => item.id === databaseId,
				);

				if (
					!database?.views.some(
						(view) => view.id === viewId && view.type === "TABLE",
					)
				) {
					return;
				}

				block.data_config = {
					...block.data_config,
					view_id: viewId,
				};

				set({
					preview: next,
				});
			},

			reset: () => {
				const initialSnapshot = get().initialSnapshot;

				if (!initialSnapshot) return;

				set({
					preview: structuredClone(initialSnapshot),
				});
			},

			clear: () => {
				set({
					sessionKey: null,
					initialSnapshot: null,
					preview: null,
				});
			},
		}),
		{
			name: "template-preview-session",

			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
