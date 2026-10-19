import { useQuery } from "@tanstack/react-query";

import { creatorApi } from "../api/creator.api";

export const creatorKeys = {
	all: ["creators"] as const,
	public: (handle: string) => [...creatorKeys.all, "public", handle] as const,
	mine: (userId: string | undefined) =>
		[...creatorKeys.all, "mine", userId] as const,
};

export function usePublicCreator(handle: string) {
	return useQuery({
		queryKey: creatorKeys.public(handle),
		queryFn: ({ signal }) => creatorApi.getPublic(handle, signal),
		enabled: Boolean(handle),
	});
}

export function useMyCreatorProfile(userId: string | undefined) {
	return useQuery({
		queryKey: creatorKeys.mine(userId),
		queryFn: ({ signal }) => creatorApi.getMine(signal),
		enabled: Boolean(userId),
	});
}
