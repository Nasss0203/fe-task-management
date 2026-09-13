import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pageShareApi } from "../api/page-share.api";

import { pageShareKeys } from "./page-share.queries";

import type {
	PageShareAccessLevel,
	SharePagePayload,
	UpdatePageShareSettingPayload,
} from "./page-share.types";

export function useSharePage(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: SharePagePayload) =>
			pageShareApi.sharePage(pageId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.byPage(pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.candidates(pageId),
				}),
			]);
		},
	});
}

export function useUpdatePageShareSetting(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdatePageShareSettingPayload) =>
			pageShareApi.updatePageShareSetting(pageId, payload),

		onSuccess: (setting) => {
			queryClient.setQueryData(pageShareKeys.setting(pageId), setting);

			queryClient.invalidateQueries({
				queryKey: pageShareKeys.access(pageId),
			});
		},
	});
}

interface UpdatePageShareAccessVariables {
	shareId: string;
	accessLevel: PageShareAccessLevel;
}

export function useUpdatePageShareAccess(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			shareId,
			accessLevel,
		}: UpdatePageShareAccessVariables) =>
			pageShareApi.updatePageShareAccess(shareId, accessLevel),

		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.byPage(pageId),
				}),

				queryClient.invalidateQueries({
					queryKey: pageShareKeys.sharedWithMe(),
				}),

				queryClient.invalidateQueries({
					queryKey: pageShareKeys.access(pageId),
				}),
			]);
		},
	});
}
