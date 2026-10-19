"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { databaseApi } from "@/entities/database/api/database.api";
import { databaseKeys } from "@/entities/database/model/database.queries";
import {
	PropertyType,
	type Database,
} from "@/entities/database/model/database.types";

/** `value: undefined` skips that property's default (e.g. a "No Status" column). */
export type InitialRowValue = { propertyId: string; value: unknown };

/** Like Notion, a new row starts at the first option of every Status property. */
function getDefaultValues(database: Database): InitialRowValue[] {
	return database.properties.flatMap((property) => {
		if (property.type !== PropertyType.STATUS) return [];
		const first = [...property.options].sort(
			(a, b) => Number(a.position) - Number(b.position),
		)[0];
		return first ? [{ propertyId: property.id, value: first.id }] : [];
	});
}

/**
 * Creates a row with default Status values plus any pre-filled values (e.g. the
 * board column or calendar dates it was added from) and remembers it so its
 * title can take focus. Refetches once so the row first renders in its group.
 */
export function useQuickAddRow(database: Database) {
	const queryClient = useQueryClient();
	const [focusRowId, setFocusRowId] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	/** Resolves to the new row id, or null when creating failed. */
	const addRow = async (
		initial: InitialRowValue[] = [],
	): Promise<string | null> => {
		setIsPending(true);
		let rowId: string | null = null;
		try {
			const row = await databaseApi.createRow(database.id);
			const overridden = new Set(initial.map((item) => item.propertyId));
			const values = [
				...getDefaultValues(database).filter(
					(item) => !overridden.has(item.propertyId),
				),
				...initial,
			].filter((item) => item.value !== undefined);

			// The row exists already; a failed pre-fill only loses that value.
			const results = await Promise.allSettled(
				values.map((item) =>
					databaseApi.setRowValue(row.id, item.propertyId, item.value),
				),
			);
			if (results.some((result) => result.status === "rejected")) {
				toast.error("Row added, but some values couldn't be set");
			}

			setFocusRowId(row.id);
			rowId = row.id;
		} catch {
			toast.error("Couldn't add row");
		} finally {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.rows(database.id),
			});
			setIsPending(false);
		}
		return rowId;
	};

	return { addRow, focusRowId, isPending };
}
