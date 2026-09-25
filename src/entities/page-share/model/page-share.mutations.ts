import {
	type QueryClient,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { pageBlockKeys } from "@/entities/page-block/model/page-block.queries";
import { pageKeys } from "@/entities/page/model/page.queries";
import { workspaceKeys } from "@/entities/workspace/model/workspace.queries";
import { pageShareApi } from "../api/page-share.api";
import { pageShareKeys } from "./page-share.queries";
import type {
	PageShareAccessLevel,
	PageShareInvitationResult,
	ResolvedPageShareLink,
	SharePagePayload,
	UpdatePageShareSettingPayload,
} from "./page-share.types";

function updateResolvedInvitation(
	queryClient: QueryClient,
	token: string,
	result: PageShareInvitationResult,
	status: "ACCEPTED" | "REJECTED",
) {
	queryClient.setQueryData<ResolvedPageShareLink>(
		pageShareKeys.resolve(token),
		(resolved) => {
			if (
				resolved?.pageId !== result.pageId ||
				resolved.invitation?.shareId !== result.shareId
			) {
				return resolved;
			}

			return {
				...resolved,
				invitation: { ...resolved.invitation, status },
			};
		},
	);
}

export function useAcceptPageShareInvitation(token: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => pageShareApi.acceptInvitation(token),
		onSuccess: async (result) => {
			updateResolvedInvitation(queryClient, token, result, "ACCEPTED");

			// Accept có thể vừa tạo Guest; refresh cả workspace list và access.
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: workspaceKeys.all }),
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.resolve(token),
				}),
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.sharedWithMe(),
				}),
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.byPage(result.pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.access(result.pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pageKeys.detail(result.pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pageBlockKeys.byPage(result.pageId),
				}),
			]);
		},
	});
}

export function useRejectPageShareInvitation(token: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => pageShareApi.rejectInvitation(token),
		onSuccess: async (result) => {
			updateResolvedInvitation(queryClient, token, result, "REJECTED");
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.resolve(token),
				}),
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.sharedWithMe(),
				}),
				queryClient.invalidateQueries({
					queryKey: pageShareKeys.byPage(result.pageId),
				}),
			]);
		},
	});
}

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
