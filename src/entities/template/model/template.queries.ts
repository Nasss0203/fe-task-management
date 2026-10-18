import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { templateApi } from "../api/template.api";
import type { PreviewTemplateDemoPayload } from "./template.types";

export const templateKeys = {
	all: ["templates"] as const,
	claimed: (userId: string | undefined, limit = 20) =>
		[...templateKeys.all, "claimed", userId, { limit }] as const,

	lists: () => [...templateKeys.all, "list"] as const,

	list: (filters: {
		scope: "mine" | "workspace";
		workspaceId?: string;
		search?: string;
	}) =>
		[
			...templateKeys.lists(),
			{
				scope: filters.scope,
				workspaceId: filters.workspaceId,
				search: filters.search,
			},
		] as const,

	publicLists: () => [...templateKeys.all, "public-list"] as const,

	publicList: (filters: { search?: string; category?: string; limit?: number }) =>
		[
			...templateKeys.publicLists(),
			{
				search: filters.search,
				category: filters.category,
				limit: filters.limit,
			},
		] as const,

	purchase: (purchaseId: string, userId?: string) =>
		[...templateKeys.all, "purchase", purchaseId, userId] as const,
	usableVersions: (templateId: string, userId?: string) =>
		[...templateKeys.all, "usable-versions", templateId, userId] as const,

	publicDetail: (templateId: string) =>
		[...templateKeys.all, "public-detail", templateId] as const,

	publicPreview: (templateId: string, versionId: string) =>
		[...templateKeys.all, "public-preview", templateId, versionId] as const,

	detail: (id: string) => [...templateKeys.all, "detail", id] as const,

	versions: (templateId: string) =>
		[...templateKeys.detail(templateId), "versions"] as const,

	preview: (templateId: string, versionId: string) =>
		[...templateKeys.detail(templateId), "preview", versionId] as const,

	thumbnail: (templateId: string, versionId: string) =>
		[...templateKeys.detail(templateId), "thumbnail", versionId] as const,

	listing: (templateId: string) =>
		[...templateKeys.detail(templateId), "listing"] as const,

	categories: () => [...templateKeys.all, "categories"] as const,

	demoPreview: (templateId: string, payload: unknown) =>
		[...templateKeys.detail(templateId), "demo-preview", payload] as const,
};

export interface UseInfiniteTemplatesOptions {
	scope: "mine" | "workspace";
	workspaceId?: string;
	search?: string;
	limit?: number;
	enabled?: boolean;
}

export interface UseMyClaimedTemplatesOptions {
	/** Cache isolation only; identity is never sent in the request. */
	userId?: string;
	limit?: number;
	enabled?: boolean;
}

export function useMyClaimedTemplates({
	userId,
	limit = 20,
	enabled = true,
}: UseMyClaimedTemplatesOptions) {
	return useInfiniteQuery({
		queryKey: templateKeys.claimed(userId, limit),
		queryFn: ({ pageParam, signal }) =>
			templateApi.listMyClaimedTemplates({ limit, cursor: pageParam }, signal),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		enabled: Boolean(userId) && enabled,
		staleTime: 0,
	});
}

export function useInfiniteTemplates({
	scope,
	workspaceId,
	search,
	limit = 20,
	enabled = true,
}: UseInfiniteTemplatesOptions) {
	const trimmedSearch = search?.trim() || undefined;

	return useInfiniteQuery({
		queryKey: templateKeys.list({
			scope,
			workspaceId: scope === "workspace" ? workspaceId : undefined,
			search: trimmedSearch,
		}),
		queryFn: ({ pageParam, signal }) =>
			templateApi.list(
				{
					scope,
					workspaceId: scope === "workspace" ? workspaceId : undefined,
					search: trimmedSearch,
					cursor: pageParam,
					limit,
				},
				signal,
			),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
		enabled,
	});
}

export function useTemplateDetail(
	templateId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: templateKeys.detail(templateId),
		queryFn: ({ signal }) => templateApi.getById(templateId, signal),
		enabled: Boolean(templateId) && (options?.enabled ?? true),
	});
}

export function useTemplateVersions(
	templateId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: templateKeys.versions(templateId),
		queryFn: ({ signal }) => templateApi.listVersions(templateId, signal),
		enabled: Boolean(templateId) && (options?.enabled ?? true),
		retry: false,
	});
}

export function useTemplatePreview(
	templateId: string,
	versionId?: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: templateKeys.preview(templateId, versionId ?? ""),
		queryFn: ({ signal }) =>
			templateApi.getPreview(templateId, versionId!, signal),
		enabled: Boolean(templateId && versionId) && (options?.enabled ?? true),
	});
}

export function useTemplateVersionThumbnail(
	templateId: string,
	versionId?: string,
	options?: {
		enabled?: boolean;
		/**
		 * Retry 404s while a new thumbnail is generated. Turn off for paid
		 * listings, where 404 is the backend hiding the paid screenshot.
		 */
		retryMissing?: boolean;
	},
) {
	const retryMissing = options?.retryMissing ?? true;

	return useQuery({
		queryKey: templateKeys.thumbnail(templateId, versionId ?? ""),

		queryFn: ({ signal }) =>
			templateApi.getVersionThumbnail(templateId, versionId!, signal),

		enabled: Boolean(templateId && versionId) && (options?.enabled ?? true),

		retry: (failureCount, error) => {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return retryMissing && failureCount < 5;
			}

			return false;
		},

		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),

		staleTime: 10 * 60 * 1000,
	});
}

export interface UseInfinitePublicTemplatesOptions {
	search?: string;
	category?: string;
	limit?: number;
	enabled?: boolean;
}

export function useInfinitePublicTemplates({
	search,
	category,
	limit = 20,
	enabled = true,
}: UseInfinitePublicTemplatesOptions = {}) {
	const trimmedSearch = search?.trim() || undefined;

	return useInfiniteQuery({
		queryKey: templateKeys.publicList({
			search: trimmedSearch,
			category,
			limit,
		}),

		queryFn: ({ pageParam, signal }) =>
			templateApi.listPublic(
				{
					search: trimmedSearch,
					...(category ? { category } : {}),
					cursor: pageParam,
					limit,
				},
				signal,
			),

		initialPageParam: undefined as string | undefined,

		getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,

		enabled,
	});
}

export function usePublicTemplatePreview(
	templateId: string,
	versionId?: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: templateKeys.publicPreview(templateId, versionId ?? ""),

		queryFn: ({ signal }) =>
			templateApi.getPublicPreview(templateId, versionId!, signal),

		enabled: Boolean(templateId && versionId) && (options?.enabled ?? true),
	});
}

export function usePublicTemplate(
	templateId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: templateKeys.publicDetail(templateId),
		queryFn: ({ signal }) => templateApi.getPublicById(templateId, signal),
		enabled: Boolean(templateId) && (options?.enabled ?? true),
	});
}

export function useTemplateListing(
	templateId: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: templateKeys.listing(templateId),
		queryFn: ({ signal }) => templateApi.getListing(templateId, signal),
		enabled: Boolean(templateId) && (options?.enabled ?? true),
		retry: (failureCount, error) => {
			if (
				axios.isAxiosError(error) &&
				(error.response?.status === 404 ||
					error.response?.status === 403 ||
					error.response?.status === 401)
			) {
				return false;
			}
			return failureCount < 2;
		},
	});
}

export function useTemplateCategories() {
	return useQuery({
		queryKey: templateKeys.categories(),
		queryFn: ({ signal }) => templateApi.listPublicCategories(signal),
		staleTime: 5 * 60 * 1000,
	});
}

export function useTemplateDemoPreview(
	templateId: string,
	payload: PreviewTemplateDemoPayload | null,
) {
	return useQuery({
		queryKey: templateKeys.demoPreview(templateId, payload),
		queryFn: ({ signal }) =>
			templateApi.previewDemo(templateId, payload!, signal),
		enabled: Boolean(templateId && payload?.demo_version_id),
		retry: false,
		placeholderData: (previous) => previous,
	});
}

/**
 * Official releases the signed-in user may use. A 403 means "no entitlement"
 * (not claimed / not purchased) and is not retried.
 */
export function useUsableTemplateVersions(
	templateId: string,
	options?: { userId?: string; enabled?: boolean },
) {
	return useQuery({
		queryKey: templateKeys.usableVersions(templateId, options?.userId),
		queryFn: ({ signal }) => templateApi.listUsableVersions(templateId, signal),
		enabled:
			Boolean(templateId && options?.userId) && (options?.enabled ?? true),
		retry: false,
	});
}
