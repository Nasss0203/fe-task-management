"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { creatorApi } from "../api/creator.api";
import { creatorKeys } from "./creator.queries";
import type {
	CreatorImageKind,
	MyCreatorProfile,
	UpsertCreatorProfileInput,
} from "./creator.types";

function useStoreMyProfile(userId: string | undefined) {
	const queryClient = useQueryClient();

	return (profile: MyCreatorProfile) => {
		queryClient.setQueryData(creatorKeys.mine(userId), profile);
		void queryClient.invalidateQueries({
			queryKey: [...creatorKeys.all, "public"],
		});
		void queryClient.invalidateQueries({ queryKey: ["templates"] });
	};
}

export function useUpsertMyCreatorProfile(userId: string | undefined) {
	const store = useStoreMyProfile(userId);

	return useMutation<MyCreatorProfile, Error, UpsertCreatorProfileInput>({
		mutationFn: (input) => creatorApi.upsertMine(input),
		onSuccess: store,
	});
}

export function useSetCreatorImage(userId: string | undefined) {
	const store = useStoreMyProfile(userId);

	return useMutation<
		MyCreatorProfile,
		Error,
		{ kind: CreatorImageKind; file: File | null }
	>({
		mutationFn: ({ kind, file }) =>
			file ? creatorApi.uploadImage(kind, file) : creatorApi.removeImage(kind),
		onSuccess: store,
	});
}
