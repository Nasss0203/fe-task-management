"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateApi } from "../api/template.api";
import { templateKeys } from "./template.queries";
import type {
	CreateTemplateFromPagePayload,
	PageTemplate,
	TemplateEntitlementDto,
	TemplateListingDto,
	TemplateVersion,
	UpdateTemplatePayload,
	UseTemplatePayload,
	UseTemplateResponse,
} from "./template.types";

export interface CreateTemplateFromPageInput {
	pageId: string;
	payload: CreateTemplateFromPagePayload;
}

export function useCreateTemplateFromPage() {
	const queryClient = useQueryClient();

	return useMutation<PageTemplate, Error, CreateTemplateFromPageInput>({
		mutationFn: ({ pageId, payload }: CreateTemplateFromPageInput) =>
			templateApi.createFromPage(pageId, payload),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: templateKeys.lists(),
			});
		},
	});
}

export interface PublishTemplateVersionInput {
	templateId: string;
	versionId: string;
}

export function usePublishTemplateVersion() {
	const queryClient = useQueryClient();

	return useMutation<TemplateVersion, Error, PublishTemplateVersionInput>({
		mutationFn: ({ templateId, versionId }: PublishTemplateVersionInput) =>
			templateApi.publishVersion(templateId, versionId),
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.detail(variables.templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.versions(variables.templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.lists(),
				}),
			]);
		},
	});
}

export interface CreateTemplateVersionInput {
	templateId: string;
}

export function useCreateTemplateVersion() {
	const queryClient = useQueryClient();

	return useMutation<TemplateVersion, Error, CreateTemplateVersionInput>({
		mutationFn: ({ templateId }: CreateTemplateVersionInput) =>
			templateApi.createVersion(templateId),

		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.versions(variables.templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.lists(),
				}),
			]);
		},
	});
}

export interface UseTemplateInput {
	templateId: string;
	versionId: string;
	payload?: UseTemplatePayload;
	workspace_id?: string;
}

export function useUseTemplate() {
	return useMutation<UseTemplateResponse, Error, UseTemplateInput>({
		mutationFn: ({
			templateId,
			versionId,
			payload,
			workspace_id,
		}: UseTemplateInput) => {
			const resolvedPayload: UseTemplatePayload = payload ?? {
				workspace_id: workspace_id || "",
			};
			return templateApi.useTemplate(
				templateId,
				versionId,
				resolvedPayload,
			);
		},
	});
}

export interface ClaimFreeTemplateInput {
	templateId: string;
}

export function useClaimFreeTemplate() {
	const queryClient = useQueryClient();

	return useMutation<
		TemplateEntitlementDto,
		Error,
		string | ClaimFreeTemplateInput
	>({
		mutationFn: (variables: string | ClaimFreeTemplateInput) => {
			const templateId =
				typeof variables === "string" ? variables : variables.templateId;
			return templateApi.claimFreeTemplate(templateId);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [...templateKeys.all, "claimed"],
			});
		},
	});
}

export interface CreateTemplateListingInput {
	templateId: string;
}

export function usePublishTemplateToMarketplace() {
	const queryClient = useQueryClient();
	return useMutation({
		retry: false,
		mutationFn: ({ templateId, versionId }: { templateId: string; versionId: string }) =>
			templateApi.publishToMarketplace(templateId, { version_id: versionId, offer_type: "FREE" }),
		onSuccess: async (result, { templateId }) => {
			queryClient.setQueryData(templateKeys.listing(templateId), result.listing);
			await Promise.all([
				templateKeys.detail(templateId),
				templateKeys.versions(templateId),
				templateKeys.listing(templateId),
				templateKeys.lists(),
				templateKeys.publicLists(),
				templateKeys.publicDetail(templateId),
				[...templateKeys.all, "public-preview", templateId],
			].map(queryKey => queryClient.invalidateQueries({ queryKey })));
		},
	});
}

export function useCreateTemplateListing() {
	const queryClient = useQueryClient();

	return useMutation<
		TemplateListingDto,
		Error,
		string | CreateTemplateListingInput
	>({
		mutationFn: (variables: string | CreateTemplateListingInput) => {
			const templateId =
				typeof variables === "string" ? variables : variables.templateId;
			return templateApi.createListing(templateId);
		},
		onSuccess: async (_, variables) => {
			const templateId =
				typeof variables === "string" ? variables : variables.templateId;
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.listing(templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.detail(templateId),
				}),
			]);
		},
	});
}

export interface PublishTemplateListingInput {
	templateId: string;
}

export function usePublishTemplateListing() {
	const queryClient = useQueryClient();

	return useMutation<
		TemplateListingDto,
		Error,
		string | PublishTemplateListingInput
	>({
		mutationFn: (variables: string | PublishTemplateListingInput) => {
			const templateId =
				typeof variables === "string" ? variables : variables.templateId;
			return templateApi.publishListing(templateId);
		},
		onSuccess: async (_, variables) => {
			const templateId =
				typeof variables === "string" ? variables : variables.templateId;
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.listing(templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.detail(templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.publicLists(),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.publicDetail(templateId),
				}),
			]);
		},
	});
}

export interface UnpublishTemplateListingInput {
	templateId: string;
}

export function useUnpublishTemplateListing() {
	const queryClient = useQueryClient();

	return useMutation<
		TemplateListingDto,
		Error,
		string | UnpublishTemplateListingInput
	>({
		mutationFn: (variables: string | UnpublishTemplateListingInput) => {
			const templateId =
				typeof variables === "string" ? variables : variables.templateId;
			return templateApi.unpublishListing(templateId);
		},
		onSuccess: async (_, variables) => {
			const templateId =
				typeof variables === "string" ? variables : variables.templateId;
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.listing(templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.detail(templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.publicLists(),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.publicDetail(templateId),
				}),
			]);
		},
	});
}

export interface UpdateTemplateInput {
	templateId: string;
	payload: UpdateTemplatePayload;
}

export function useUpdateTemplate() {
	const queryClient = useQueryClient();

	return useMutation<PageTemplate, Error, UpdateTemplateInput>({
		mutationFn: ({ templateId, payload }: UpdateTemplateInput) =>
			templateApi.update(templateId, payload),
		onSuccess: async (updatedTemplate) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.detail(updatedTemplate.id),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.lists(),
				}),
			]);
		},
	});
}

export function useArchiveTemplate() {
	const queryClient = useQueryClient();

	return useMutation<PageTemplate, Error, string | { templateId: string }>({
		mutationFn: (arg: string | { templateId: string }) => {
			const templateId = typeof arg === "string" ? arg : arg.templateId;
			return templateApi.archive(templateId);
		},
		onSuccess: async (archivedTemplate) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.detail(archivedTemplate.id),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.lists(),
				}),
			]);
		},
	});
}

export function useRestoreTemplate() {
	const queryClient = useQueryClient();

	return useMutation<PageTemplate, Error, string | { templateId: string }>({
		mutationFn: (arg: string | { templateId: string }) => {
			const templateId = typeof arg === "string" ? arg : arg.templateId;
			return templateApi.restore(templateId);
		},
		onSuccess: async (restoredTemplate) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.detail(restoredTemplate.id),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.lists(),
				}),
			]);
		},
	});
}
