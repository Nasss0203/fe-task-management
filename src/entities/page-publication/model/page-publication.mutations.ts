import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pagePublicationApi } from "../api/page-publication.api";
import { pagePublicationKeys } from "./page-publication.queries";
import type { PublicationSettingsPayload, PublishSitePayload } from "./page-publication.types";

export function usePublishPage(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: PublishSitePayload) =>
			pagePublicationApi.publishPage(pageId, payload),

		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.list(pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.detail(pageId),
				}),
			]);
		},
	});
}

export function useUnpublishPage(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (siteId: string) =>
			pagePublicationApi.unpublishPage(pageId, siteId),

		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.list(pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.detail(pageId),
				}),
			]);
		},
	});
}

export function useRepublishPage(pageId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (siteId: string) =>
			pagePublicationApi.republishPage(pageId, siteId),

		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.list(pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.detail(pageId),
				}),
			]);
		},
	});
}

export function useUpdatePublicationSettings(pageId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ siteId, payload }: { siteId: string; payload: PublicationSettingsPayload }) =>
			pagePublicationApi.updatePublicationSettings(pageId, siteId, payload),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.list(pageId),
				}),
				queryClient.invalidateQueries({
					queryKey: pagePublicationKeys.detail(pageId),
				}),
			]);
		},
	});
}

export function useUpdatePageVisibility(pageId: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (published: boolean) => pagePublicationApi.updatePageVisibility(pageId, published),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: pagePublicationKeys.list(pageId) }),
				queryClient.invalidateQueries({ queryKey: pagePublicationKeys.detail(pageId) }),
			]);
		},
	});
}
