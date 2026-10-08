export type InteractionMode = "editable" | "preview" | "readonly";

export function canInteract(mode: InteractionMode) {
	return mode === "editable" || mode === "preview";
}
