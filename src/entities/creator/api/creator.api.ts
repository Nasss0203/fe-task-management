import type { ApiResponse } from "@/shared/api";
import apiClient from "@/shared/api/api-client";
import publicApiClient from "@/shared/api/public-api-client";

import type {
	CreatorImageKind,
	MyCreatorProfile,
	PublicCreatorProfile,
	UpsertCreatorProfileInput,
} from "../model/creator.types";

const MY_PROFILE_API = "/creators/me/profile";

export const creatorApi = {
	getPublic: async (
		handle: string,
		signal?: AbortSignal,
	): Promise<PublicCreatorProfile> => {
		const response = await publicApiClient.get<
			ApiResponse<PublicCreatorProfile>
		>(`/public/creators/${encodeURIComponent(handle)}`, { signal });

		return response.data.data;
	},

	getMine: async (signal?: AbortSignal): Promise<MyCreatorProfile> => {
		const response = await apiClient.get<ApiResponse<MyCreatorProfile>>(
			MY_PROFILE_API,
			{ signal },
		);

		return response.data.data;
	},

	upsertMine: async (
		input: UpsertCreatorProfileInput,
	): Promise<MyCreatorProfile> => {
		const response = await apiClient.put<ApiResponse<MyCreatorProfile>>(
			MY_PROFILE_API,
			input,
		);

		return response.data.data;
	},

	uploadImage: async (
		kind: CreatorImageKind,
		file: File,
	): Promise<MyCreatorProfile> => {
		const formData = new FormData();
		formData.append("file", file);

		const response = await apiClient.put<ApiResponse<MyCreatorProfile>>(
			`${MY_PROFILE_API}/images/${kind}`,
			formData,
		);

		return response.data.data;
	},

	removeImage: async (kind: CreatorImageKind): Promise<MyCreatorProfile> => {
		const response = await apiClient.delete<ApiResponse<MyCreatorProfile>>(
			`${MY_PROFILE_API}/images/${kind}`,
		);

		return response.data.data;
	},
};
