import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationKeys } from "@/entities/notification/model/notification.keys";
import type { PageShareAccessLevel } from "@/entities/page-share/model/page-share.types";

import { pageAccessRequestApi } from "../api/page-access-request.api";
import { pageAccessRequestKeys } from "./page-access-request.queries";
import type { EditAccessSource } from "./page-access-request.types";

export function useCreatePageAccessRequest(pageId: string, token: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			pageAccessRequestApi.create(pageId, {
				token,
			}),

		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: pageAccessRequestKeys.mine(pageId),
			});
		},
	});
}

export function useRequestEditAccess(pageId: string, source: EditAccessSource) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () =>
			pageAccessRequestApi.create(
				pageId,
				// Link share đang cho xem: xin thêm quyền sửa; site luôn là xin sửa
				"token" in source ? { token: source.token, intent: "edit" } : source,
			),

		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: pageAccessRequestKeys.mine(pageId),
			});
		},
	});
}

interface ApprovePageAccessRequestVariables {
	requestId: string;
	accessLevel: PageShareAccessLevel;
}

export function useApprovePageAccessRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			requestId,
			accessLevel,
		}: ApprovePageAccessRequestVariables) =>
			pageAccessRequestApi.approve(requestId, accessLevel),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: notificationKeys.all,
			});
		},
	});
}

interface RejectPageAccessRequestVariables {
	requestId: string;
}

export function useRejectPageAccessRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ requestId }: RejectPageAccessRequestVariables) =>
			pageAccessRequestApi.reject(requestId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: notificationKeys.all,
			});
		},
	});
}
