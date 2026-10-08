import type { InteractionMode } from "@/shared/model/interaction-mode";

export interface TemplatePreviewInteractions {
	mode?: InteractionMode;
	onDatabaseValueChange?: (
		databaseId: string,
		rowId: string,
		propertyId: string,
		value: unknown,
	) => void;
	onDatabaseViewChange?: (blockId: string, viewId: string) => void;
	onTodoCheckedChange?: (blockId: string, checked: boolean) => void;
}
