"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateApi } from "../api/template.api";
import { templateKeys } from "./template.queries";
import type {
	CreateTemplateFromPagePayload,
	PageTemplate,
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

export interface UseTemplateInput {
	templateId: string;
	versionId: string;
	payload?: UseTemplatePayload;
	workspace_id?: string;
}

export function useUseTemplate() {
	return useMutation<UseTemplateResponse, Error, UseTemplateInput>({
		mutationFn: ({ templateId, versionId, payload, workspace_id }: UseTemplateInput) => {
			const resolvedPayload: UseTemplatePayload = payload ?? {
				workspace_id: workspace_id || "",
			};
			return templateApi.useTemplate(templateId, versionId, resolvedPayload);
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

