"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { databaseApi } from "../api/database.api";
import { databaseKeys } from "./database.queries";
import {
	DatabaseViewType,
	PropertyType,
	type DatabaseViewDetail,
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

interface SetDatabaseRowValueInput {
	rowId: string;
	propertyId: string;
	value: unknown;
}

export function useSetDatabaseRowValue(databaseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ rowId, propertyId, value }: SetDatabaseRowValueInput) =>
			databaseApi.setRowValue(rowId, propertyId, value),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: databaseKeys.rows(databaseId),
			});
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
