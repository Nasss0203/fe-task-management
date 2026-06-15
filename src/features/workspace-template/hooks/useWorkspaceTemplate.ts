"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getWorkspaceTemplatesApi,
	saveWorkspaceAsTemplateApi,
	updateWorkspaceTemplateApi,
	deleteWorkspaceTemplateApi,
} from "@/services/workspace-template/workspace-template.service";
import { WORKSPACE_TEMPLATE_KEY } from "@/services/workspace-template/type";

export const useWorkspaceTemplate = (params?: {
	ownedByMe?: boolean;
	status?: string;
	category?: string;
	page?: number;
	limit?: number;
}) => {
	const queryClient = useQueryClient();

	const workspaceTemplates = useQuery({
		queryKey: [WORKSPACE_TEMPLATE_KEY.TEMPLATES, params],
		queryFn: () => getWorkspaceTemplatesApi(params),
	});

	const saveWorkspaceAsTemplate = useMutation({
		mutationFn: saveWorkspaceAsTemplateApi,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [WORKSPACE_TEMPLATE_KEY.TEMPLATES],
			});
		},
		onError: (err) => {
			console.error("saveWorkspaceAsTemplateApi failed", err);
		},
	});

	const updateWorkspaceTemplate = useMutation({
		mutationFn: updateWorkspaceTemplateApi,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [WORKSPACE_TEMPLATE_KEY.TEMPLATES],
			});
		},
		onError: (err) => {
			console.error("updateWorkspaceTemplateApi failed", err);
		},
	});

	const deleteWorkspaceTemplate = useMutation({
		mutationFn: deleteWorkspaceTemplateApi,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: [WORKSPACE_TEMPLATE_KEY.TEMPLATES],
			});
		},
		onError: (err) => {
			console.error("deleteWorkspaceTemplateApi failed", err);
		},
	});

	return {
		workspaceTemplates,
		saveWorkspaceAsTemplate,
		updateWorkspaceTemplate,
		deleteWorkspaceTemplate,
	};
};
