import type { AiModificationOperation } from "@/entities/ai-assistant/model/ai-assistant.types";

export function pluralize(count: number, singular: string, plural: string): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

/** "1 operation · 1 edit": the operation count, then only the non-zero parts. */
export function formatPlanCounts(operations: readonly AiModificationOperation[]): string {
	const sum = (count: (operation: AiModificationOperation) => number) =>
		operations.reduce((total, operation) => total + count(operation), 0);
	const blocks = sum((operation) => (operation.type === "INSERT_BLOCKS" ? operation.blocks.length : 0));
	const rows = sum((operation) => (operation.type === "CREATE_DATABASE_ROWS" ? operation.rows.length : 0));
	const todos = sum((operation) => (operation.type === "SET_TODO_CHECKED" ? 1 : 0));
	const edits = sum((operation) => (operation.type === "SET_BLOCK_TEXT" ? 1 : 0));
	const deletions = sum((operation) => (operation.type === "DELETE_BLOCK" ? 1 : 0));
	return [
		pluralize(operations.length, "operation", "operations"),
		blocks > 0 && pluralize(blocks, "block", "blocks"),
		rows > 0 && pluralize(rows, "row", "rows"),
		todos > 0 && pluralize(todos, "to-do", "to-dos"),
		edits > 0 && pluralize(edits, "edit", "edits"),
		deletions > 0 && pluralize(deletions, "deletion", "deletions"),
	]
		.filter(Boolean)
		.join(" · ");
}
