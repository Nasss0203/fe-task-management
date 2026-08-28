"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pageApi } from "../api/page.api";
import { pageKeys } from "./page.queries";
import type { CreatePageInput } from "./page.types";

export function useCreatePage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreatePageInput) => pageApi.create(input),

		onSuccess: async (page) => {
			await queryClient.invalidateQueries({
				queryKey: pageKeys.byWorkspace(page.workspace_id),
			});
		},
	});
}
