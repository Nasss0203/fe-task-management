import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationKeys } from "@/entities/notification/model/notification.keys";

import {
	createPageEditRequest,
	reviewPageEditRequest,
} from "../api/page-edit-request.api";
import { pageEditRequestKeys } from "./page-edit-request.queries";
import type { PageEditRequest } from "./page-edit-request.types";

export function useCreatePageEditRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPageEditRequest,
		onSuccess: (request) => {
			queryClient.setQueryData<PageEditRequest[]>(
				pageEditRequestKeys.mine(),
				(requests = []) => [
					...requests.filter((item) => item.id !== request.id),
					request,
				],
			);
		},
	});
}

export function useReviewPageEditRequest() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			requestId,
			decision,
		}: {
			requestId: string;
			decision: "approve" | "reject";
		}) => reviewPageEditRequest(requestId, decision),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: notificationKeys.all,
			});
		},
	});
}
