import instance from "@/shared/api/api-client";

import { ApiResponse } from "@/shared/api";
import type {
	Database,
	DatabaseProperty,
	DatabaseRow,
	DatabaseView,
	DatabaseViewDetail,
	DatabaseViewType,
	PropertyOption,
	PropertyType,
	SetDatabaseRowValueResponse,
} from "../model/database.types";

const DATABASE_API = "/databases";

export const databaseApi = {
	getById: async (
		databaseId: string,
		signal?: AbortSignal,
	): Promise<Database> => {
		const response = await instance.get<ApiResponse<Database>>(
			`${DATABASE_API}/${databaseId}`,
			{ signal },
		);

		return response.data.data;
	},

	getViews: async (
		databaseId: string,
		signal?: AbortSignal,
	): Promise<DatabaseView[]> => {
		const response = await instance.get<ApiResponse<DatabaseView[]>>(
			`${DATABASE_API}/${databaseId}/views`,
			{ signal },
		);

		return response.data.data;
	},

	getViewById: async (
		databaseId: string,
		viewId: string,
		signal?: AbortSignal,
	): Promise<DatabaseViewDetail> => {
		const response = await instance.get<ApiResponse<DatabaseViewDetail>>(
			`${DATABASE_API}/${databaseId}/views/${viewId}`,
			{ signal },
		);

		return response.data.data;
	},

	getRows: async (
		databaseId: string,
		signal?: AbortSignal,
	): Promise<DatabaseRow[]> => {
		const response = await instance.get<ApiResponse<DatabaseRow[]>>(
			`${DATABASE_API}/${databaseId}/rows`,
			{ signal },
		);

		return response.data.data;
	},

	createRow: async (databaseId: string): Promise<DatabaseRow> => {
		const response = await instance.post<ApiResponse<DatabaseRow>>(
			`${DATABASE_API}/${databaseId}/rows`,
		);

		return response.data.data;
	},

	setRowValue: async (
		rowId: string,
		propertyId: string,
		value: unknown,
	): Promise<SetDatabaseRowValueResponse> => {
		const response = await instance.patch<
			ApiResponse<SetDatabaseRowValueResponse>
		>(`/database-rows/${rowId}/values/${propertyId}`, {
			value,
		});

		return response.data.data;
	},

	addProperty: async (
		databaseId: string,
		input: {
			name: string;
			type: PropertyType;
		},
	): Promise<DatabaseProperty> => {
		const response = await instance.post<ApiResponse<DatabaseProperty>>(
			`${DATABASE_API}/${databaseId}/properties`,
			input,
		);

		return response.data.data;
	},

	renameProperty: async (
		databaseId: string,
		propertyId: string,
		name: string,
	): Promise<DatabaseProperty> => {
		const response = await instance.patch<ApiResponse<DatabaseProperty>>(
			`${DATABASE_API}/${databaseId}/properties/${propertyId}`,
			{
				name,
			},
		);

		return response.data.data;
	},

	deleteProperty: async (
		databaseId: string,
		propertyId: string,
	): Promise<{ id: string }> => {
		const response = await instance.delete<ApiResponse<{ id: string }>>(
			`${DATABASE_API}/${databaseId}/properties/${propertyId}`,
		);

		return response.data.data;
	},

	renameView: async (
		databaseId: string,
		viewId: string,
		name: string,
	): Promise<DatabaseView> => {
		const response = await instance.patch<ApiResponse<DatabaseView>>(
			`${DATABASE_API}/${databaseId}/views/${viewId}`,
			{
				name,
			},
		);

		return response.data.data;
	},

	createView: async (
		databaseId: string,
		input: {
			name: string;
			type: DatabaseViewType;
		},
	): Promise<DatabaseView> => {
		const response = await instance.post<ApiResponse<DatabaseView>>(
			`${DATABASE_API}/${databaseId}/views`,
			input,
		);

		return response.data.data;
	},
	deleteView: async (
		databaseId: string,
		viewId: string,
	): Promise<{ id: string }> => {
		const response = await instance.delete<ApiResponse<{ id: string }>>(
			`${DATABASE_API}/${databaseId}/views/${viewId}`,
		);

		return response.data.data;
	},

	setViewPropertyVisibility: async (
		databaseId: string,
		viewId: string,
		propertyId: string,
		visible: boolean,
	): Promise<DatabaseViewDetail> => {
		const response = await instance.patch<ApiResponse<DatabaseViewDetail>>(
			`${DATABASE_API}/${databaseId}/views/${viewId}/properties/${propertyId}/visibility`,
			{ visible },
		);

		return response.data.data;
	},

	addPropertyOption: async (
		databaseId: string,
		propertyId: string,
		input: {
			name: string;
			color?: string | null;
		},
	): Promise<PropertyOption> => {
		const response = await instance.post<ApiResponse<PropertyOption>>(
			`${DATABASE_API}/${databaseId}/properties/${propertyId}/options`,
			input,
		);

		return response.data.data;
	},

	updatePropertyOption: async (
		databaseId: string,
		propertyId: string,
		optionId: string,
		input: {
			name: string;
			color?: string | null;
		},
	): Promise<PropertyOption> => {
		const response = await instance.patch<ApiResponse<PropertyOption>>(
			`${DATABASE_API}/${databaseId}/properties/${propertyId}/options/${optionId}`,
			input,
		);

		return response.data.data;
	},

	deletePropertyOption: async (
		databaseId: string,
		propertyId: string,
		optionId: string,
	): Promise<{ id: string }> => {
		const response = await instance.delete<ApiResponse<{ id: string }>>(
			`${DATABASE_API}/${databaseId}/properties/${propertyId}/options/${optionId}`,
		);

		return response.data.data;
	},
};
