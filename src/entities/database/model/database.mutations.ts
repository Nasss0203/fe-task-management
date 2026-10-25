"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { databaseApi } from "../api/database.api";
import { databaseKeys } from "./database.queries";
import {
	DatabaseViewType,
	PropertyType,
	type Database,
	type DatabaseRow,
	type DatabaseViewDetail,
	type DatabaseViewFilter,
	type DatabaseViewSort,
} from "./database.types";

export function useCreateDatabaseRow(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => databaseApi.createRow(databaseId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.rows(databaseId),
			});
		},
	});
}

export function useDeleteDatabaseRow(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (rowId: string) => databaseApi.deleteRow(rowId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.rows(databaseId),
			});
		},
	});
}

interface MoveDatabaseRowInput {
	rowId: string;
	previousRowId: string | null;
	nextRowId: string | null;
}

export function moveRowInList<T extends { id: string }>(
	rows: T[],
	{ rowId, previousRowId, nextRowId }: MoveDatabaseRowInput,
): T[] {
	const moving = rows.find((row) => row.id === rowId);
	if (!moving) return rows;

	const others = rows.filter((row) => row.id !== rowId);
	const afterPrevious = others.findIndex((row) => row.id === previousRowId) + 1;
	const beforeNext = others.findIndex((row) => row.id === nextRowId);
	const index = previousRowId
		? afterPrevious
		: nextRowId && beforeNext !== -1
			? beforeNext
			: others.length;

	return [...others.slice(0, index), moving, ...others.slice(index)];
}

export function useMoveDatabaseRow(databaseId: string) {
	const queryClient = useQueryClient();
	const rowsKey = databaseKeys.rows(databaseId);

	return useMutation({
		mutationFn: ({ rowId, previousRowId, nextRowId }: MoveDatabaseRowInput) =>
			databaseApi.moveRow(rowId, { previousRowId, nextRowId }),

		onMutate: async (input) => {
			await queryClient.cancelQueries({ queryKey: rowsKey });
			const previous = queryClient.getQueryData<DatabaseRow[]>(rowsKey);

			queryClient.setQueryData<DatabaseRow[]>(rowsKey, (rows) =>
				rows ? moveRowInList(rows, input) : rows,
			);

			return { previous };
		},

		onError: (_error, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(rowsKey, context.previous);
			}
		},

		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: rowsKey });
		},
	});
}

interface SetDatabaseRowValueInput {
	rowId: string;
	propertyId: string;
	value: unknown;
}

export function useSetDatabaseRowValue(databaseId: string) {
	const queryClient = useQueryClient();
	const rowsKey = databaseKeys.rows(databaseId);

	return useMutation({
		// null = empty cell; the backend rejects null for most types, so clear instead.
		mutationFn: async ({
			rowId,
			propertyId,
			value,
		}: SetDatabaseRowValueInput): Promise<void> => {
			if (value === null) {
				await databaseApi.clearRowValue(rowId, propertyId);
				return;
			}

			await databaseApi.setRowValue(rowId, propertyId, value);
		},

		// Optimistic so cards dragged between board columns / calendar days stay put.
		onMutate: async ({ rowId, propertyId, value }) => {
			await queryClient.cancelQueries({ queryKey: rowsKey });
			const previous = queryClient.getQueryData<DatabaseRow[]>(rowsKey);

			queryClient.setQueryData<DatabaseRow[]>(rowsKey, (rows) =>
				rows?.map((row) => {
					if (row.id !== rowId) return row;
					const others = row.values.filter(
						(item) => item.propertyId !== propertyId,
					);
					return {
						...row,
						values:
							value === null
								? others
								: [
										...others,
										{ id: `optimistic-${propertyId}`, propertyId, value },
									],
					};
				}),
			);

			return { previous };
		},

		onError: (_error, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(rowsKey, context.previous);
			}
		},

		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: rowsKey });
		},
	});
}

interface AddDatabasePropertyInput {
	name: string;
	type: PropertyType;
}

export function useAddDatabaseProperty(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: AddDatabasePropertyInput) =>
			databaseApi.addProperty(databaseId, input),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.detail(databaseId),
			});
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.views(databaseId),
			});
		},
	});
}

export function useDeleteDatabaseProperty(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (propertyId: string) =>
			databaseApi.deleteProperty(databaseId, propertyId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.detail(databaseId),
			});
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.views(databaseId),
			});
		},
	});
}

interface RenameDatabasePropertyInput {
	propertyId: string;
	name: string;
}

export function useRenameDatabaseProperty(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ propertyId, name }: RenameDatabasePropertyInput) =>
			databaseApi.renameProperty(databaseId, propertyId, name),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.detail(databaseId),
			});
		},
	});
}

interface RenameDatabaseViewInput {
	viewId: string;
	name: string;
}

export function useRenameDatabase(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (name: string) => databaseApi.renameDatabase(databaseId, name),

		onSuccess: async ({ name }) => {
			queryClient.setQueryData<Database>(databaseKeys.detail(databaseId), (database) =>
				database ? { ...database, name } : database,
			);
			await queryClient.invalidateQueries({ queryKey: ["pages", "workspace"] });
		},
	});
}

export function useRenameDatabaseView(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ viewId, name }: RenameDatabaseViewInput) =>
			databaseApi.renameView(databaseId, viewId, name),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.views(databaseId),
			});
		},
	});
}

interface CreateDatabaseViewInput {
	name: string;
	type: DatabaseViewType;
}

export function useCreateDatabaseView(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateDatabaseViewInput) =>
			databaseApi.createView(databaseId, input),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.views(databaseId),
			});
		},
	});
}

export function useDeleteDatabaseView(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (viewId: string) =>
			databaseApi.deleteView(databaseId, viewId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.views(databaseId),
			});
		},
	});
}

interface SetViewPropertyVisibilityInput {
	propertyId: string;
	visible: boolean;
}

export function useSetViewPropertyVisibility(
	databaseId: string,
	viewId: string,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ propertyId, visible }: SetViewPropertyVisibilityInput) =>
			databaseApi.setViewPropertyVisibility(
				databaseId,
				viewId,
				propertyId,
				visible,
			),

		onSuccess: async (view: DatabaseViewDetail) => {
			queryClient.setQueryData(
				databaseKeys.viewDetail(databaseId, viewId),
				view,
			);
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.viewDetail(databaseId, viewId),
			});
		},
	});
}

interface SetViewPropertyWidthInput {
	propertyId: string;
	width: number | null;
}

export function useSetViewPropertyWidth(databaseId: string, viewId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ propertyId, width }: SetViewPropertyWidthInput) =>
			databaseApi.setViewPropertyWidth(
				databaseId,
				viewId,
				propertyId,
				width,
			),

		onSuccess: (view: DatabaseViewDetail) => {
			queryClient.setQueryData(
				databaseKeys.viewDetail(databaseId, viewId),
				view,
			);
		},
	});
}

export function useSetViewSorts(databaseId: string, viewId: string) {
	const queryClient = useQueryClient();
	const key = databaseKeys.viewDetail(databaseId, viewId);

	return useMutation({
		mutationFn: (sorts: DatabaseViewSort[]) =>
			databaseApi.setViewSorts(databaseId, viewId, sorts),

		onMutate: async (sorts) => {
			await queryClient.cancelQueries({ queryKey: key });
			const previous = queryClient.getQueryData<DatabaseViewDetail>(key);

			if (previous) {
				queryClient.setQueryData<DatabaseViewDetail>(key, {
					...previous,
					sorts,
				});
			}

			return { previous };
		},

		onError: (_error, _sorts, context) => {
			if (context?.previous) {
				queryClient.setQueryData(key, context.previous);
			}
		},

		onSuccess: (view: DatabaseViewDetail) => {
			queryClient.setQueryData(key, view);
		},
	});
}

export function useReorderViewProperties(databaseId: string, viewId: string) {
	const queryClient = useQueryClient();
	const key = databaseKeys.viewDetail(databaseId, viewId);

	return useMutation({
		mutationFn: (propertyIds: string[]) =>
			databaseApi.reorderViewProperties(databaseId, viewId, propertyIds),

		onMutate: async (propertyIds) => {
			await queryClient.cancelQueries({ queryKey: key });
			const previous = queryClient.getQueryData<DatabaseViewDetail>(key);

			if (previous) {
				const positionOf = new Map(
					propertyIds.map((propertyId, index) => [propertyId, String(index)]),
				);
				queryClient.setQueryData<DatabaseViewDetail>(key, {
					...previous,
					properties: previous.properties.map((item) => ({
						...item,
						position: positionOf.get(item.propertyId) ?? item.position,
					})),
				});
			}

			return { previous };
		},

		onError: (_error, _propertyIds, context) => {
			if (context?.previous) {
				queryClient.setQueryData(key, context.previous);
			}
		},

		onSuccess: (view: DatabaseViewDetail) => {
			queryClient.setQueryData(key, view);
		},
	});
}

export function useSetViewGroup(databaseId: string, viewId: string) {
	const queryClient = useQueryClient();
	const key = databaseKeys.viewDetail(databaseId, viewId);

	return useMutation({
		mutationFn: (propertyId: string | null) =>
			databaseApi.setViewGroup(databaseId, viewId, propertyId),

		onMutate: async (groupBy) => {
			await queryClient.cancelQueries({ queryKey: key });
			const previous = queryClient.getQueryData<DatabaseViewDetail>(key);

			if (previous) {
				queryClient.setQueryData<DatabaseViewDetail>(key, {
					...previous,
					groupBy,
				});
			}

			return { previous };
		},

		onError: (_error, _groupBy, context) => {
			if (context?.previous) {
				queryClient.setQueryData(key, context.previous);
			}
		},

		onSuccess: (view: DatabaseViewDetail) => {
			queryClient.setQueryData(key, view);
		},
	});
}

export function useSetViewFilters(databaseId: string, viewId: string) {
	const queryClient = useQueryClient();
	const key = databaseKeys.viewDetail(databaseId, viewId);

	return useMutation({
		mutationFn: (filters: DatabaseViewFilter[]) =>
			databaseApi.setViewFilters(databaseId, viewId, filters),

		onMutate: async (filters) => {
			await queryClient.cancelQueries({ queryKey: key });
			const previous = queryClient.getQueryData<DatabaseViewDetail>(key);

			if (previous) {
				queryClient.setQueryData<DatabaseViewDetail>(key, {
					...previous,
					filters,
				});
			}

			return { previous };
		},

		onError: (_error, _filters, context) => {
			if (context?.previous) {
				queryClient.setQueryData(key, context.previous);
			}
		},

		onSuccess: (view: DatabaseViewDetail) => {
			queryClient.setQueryData(key, view);
		},
	});
}

export function useAddPropertyOption(databaseId: string, propertyId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { name: string; color?: string | null }) =>
			databaseApi.addPropertyOption(databaseId, propertyId, input),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.detail(databaseId),
			});
		},
	});
}

export function useUpdatePropertyOption(
	databaseId: string,
	propertyId: string,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			optionId,
			name,
			color,
		}: {
			optionId: string;
			name: string;
			color?: string | null;
		}) =>
			databaseApi.updatePropertyOption(databaseId, propertyId, optionId, {
				name,
				color,
			}),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.detail(databaseId),
			});
		},
	});
}

export function useDeletePropertyOption(
	databaseId: string,
	propertyId: string,
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (optionId: string) =>
			databaseApi.deletePropertyOption(databaseId, propertyId, optionId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.detail(databaseId),
			});
		},
	});
}
