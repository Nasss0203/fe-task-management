"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { templateApi } from "../api/template.api";
import { templateKeys } from "./template.queries";
import type {
	CreateTemplateFromPagePayload,
	CreateTemplateListingPayload,
	PageTemplate,
	PublishTemplateToMarketplacePayload,
	UpdateTemplateListingPayload,
	TemplateEntitlementDto,
	TemplateListingDto,
	TemplateVersion,
	UpdateTemplatePayload,
	UseTemplatePayload,
	UseTemplateResponse,
	TemplateLikeResponse,
	UpsertTemplateReviewInput,
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
	const queryClient = useQueryClient();

	return useMutation<UseTemplateResponse, Error, UseTemplateInput>({
		// Using a FREE template claims it on the backend: refresh the library and detail badges.
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: [...templateKeys.all, "claimed"],
			}),
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

function useInvalidateTemplateFeedback() {
	const queryClient = useQueryClient();

	return (templateId: string) =>
		Promise.all([
			queryClient.invalidateQueries({
				queryKey: templateKeys.publicReviewsRoot(templateId),
			}),
			queryClient.invalidateQueries({
				queryKey: templateKeys.publicDetail(templateId),
			}),
			queryClient.invalidateQueries({ queryKey: templateKeys.publicLists() }),
		]);
}

export function useUpsertTemplateReview(templateId: string) {
	const invalidate = useInvalidateTemplateFeedback();

	return useMutation<void, Error, UpsertTemplateReviewInput>({
		mutationFn: (input) => templateApi.upsertReview(templateId, input),
		onSuccess: () => invalidate(templateId),
	});
}

export function useDeleteTemplateReview(templateId: string) {
	const invalidate = useInvalidateTemplateFeedback();

	return useMutation<void, Error, void>({
		mutationFn: () => templateApi.deleteReview(templateId),
		onSuccess: () => invalidate(templateId),
	});
}

export function useSetTemplateLike(templateId: string) {
	const invalidate = useInvalidateTemplateFeedback();

	return useMutation<TemplateLikeResponse, Error, boolean>({
		mutationFn: (liked) => templateApi.setLike(templateId, liked),
		onSuccess: () => invalidate(templateId),
	});
}

export interface CreateTemplateListingInput {
	templateId: string;
	payload?: CreateTemplateListingPayload;
}

export interface PublishTemplateToMarketplaceInput {
	templateId: string;
	versionId: string;
	/** Defaults to a FREE offer, matching the original marketplace flow. */
	payload?: Omit<PublishTemplateToMarketplacePayload, "version_id">;
}

export function usePublishTemplateToMarketplace() {
	const queryClient = useQueryClient();
	return useMutation({
		retry: false,
		mutationFn: ({ templateId, versionId, payload }: PublishTemplateToMarketplaceInput) =>
			templateApi.publishToMarketplace(templateId, {
				offer_type: "FREE",
				...payload,
				version_id: versionId,
			}),
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
			if (typeof variables === "string") {
				return templateApi.createListing(variables);
			}
			return templateApi.createListing(
				variables.templateId,
				variables.payload,
			);
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

export interface UpdateTemplateListingInput {
	templateId: string;
	payload: UpdateTemplateListingPayload;
}

export function useUpdateTemplateListing() {
	const queryClient = useQueryClient();

	return useMutation<TemplateListingDto, Error, UpdateTemplateListingInput>({
		retry: false,
		mutationFn: ({ templateId, payload }) =>
			templateApi.updateListing(templateId, payload),
		onSuccess: async (listing, { templateId }) => {
			queryClient.setQueryData(templateKeys.listing(templateId), listing);
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: templateKeys.publicDetail(templateId),
				}),
				queryClient.invalidateQueries({
					queryKey: templateKeys.publicLists(),
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

/**
 * Records one VIEW per mounted detail page. Fire-and-forget: analytics must
 * never break the page. The ref stops React Strict Mode's double effect in dev
 * from sending two requests.
 */
export function useRecordTemplateView(templateId: string) {
	const recordedFor = useRef<string | null>(null);

	useEffect(() => {
		if (recordedFor.current === templateId) return;
		recordedFor.current = templateId;
		templateApi.recordPublicView(templateId).catch(() => undefined);
	}, [templateId]);
}
