import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { templateApi } from "../api/template.api";

export const templateKeys = {
	all: ["templates"] as const,

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

	publicList: (filters: { search?: string; limit?: number }) =>
		[
			...templateKeys.publicLists(),
			{
				search: filters.search,
				limit: filters.limit,
			},
		] as const,

	publicPreview: (templateId: string, versionId: string) =>
		[...templateKeys.all, "public-preview", templateId, versionId] as const,

	detail: (id: string) => [...templateKeys.all, "detail", id] as const,

	versions: (templateId: string) =>
		[...templateKeys.detail(templateId), "versions"] as const,

	preview: (templateId: string, versionId: string) =>
		[...templateKeys.detail(templateId), "preview", versionId] as const,

	thumbnail: (templateId: string, versionId: string) =>
		[...templateKeys.detail(templateId), "thumbnail", versionId] as const,
};

export interface UseInfiniteTemplatesOptions {
	scope: "mine" | "workspace";
	workspaceId?: string;
	search?: string;
	limit?: number;
	enabled?: boolean;
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
					workspaceId:
						scope === "workspace" ? workspaceId : undefined,
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
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: templateKeys.thumbnail(templateId, versionId ?? ""),

		queryFn: ({ signal }) =>
			templateApi.getVersionThumbnail(templateId, versionId!, signal),

		enabled: Boolean(templateId && versionId) && (options?.enabled ?? true),

		retry: (failureCount, error) => {
			if (axios.isAxiosError(error) && error.response?.status === 404) {
				return failureCount < 5;
			}

			return false;
		},

		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),

		staleTime: 10 * 60 * 1000,
	});
}

export interface UseInfinitePublicTemplatesOptions {
	search?: string;
	limit?: number;
	enabled?: boolean;
}

export function useInfinitePublicTemplates({
	search,
	limit = 20,
	enabled = true,
}: UseInfinitePublicTemplatesOptions = {}) {
	const trimmedSearch = search?.trim() || undefined;

	return useInfiniteQuery({
		queryKey: templateKeys.publicList({
			search: trimmedSearch,
			limit,
		}),

		queryFn: ({ pageParam, signal }) =>
			templateApi.listPublic(
				{
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
