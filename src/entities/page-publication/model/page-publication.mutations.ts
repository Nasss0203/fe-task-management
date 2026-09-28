import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pagePublicationApi } from "../api/page-publication.api";
import { pagePublicationKeys } from "./page-publication.queries";
import type { PublishSitePayload } from "./page-publication.types";

export function usePublishPage(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: PublishSitePayload) =>
			pagePublicationApi.publishPage(pageId, payload),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: pagePublicationKeys.detail(pageId),
			});
		},
	});
}

export function useUnpublishPage(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => pagePublicationApi.unpublishPage(pageId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: pagePublicationKeys.detail(pageId),
			});
		},
	});
}

export function useRepublishPage(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => pagePublicationApi.republishPage(pageId),

		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: pagePublicationKeys.detail(pageId),
			});
		},
	});
}
