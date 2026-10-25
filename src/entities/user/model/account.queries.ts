"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useUser } from "@/features/auth/model/use-user";

import { accountApi } from "../api/account.api";
import type { Account } from "./user.types";

export const accountKeys = {
	me: ["account", "me"] as const,
};

export function useAccount() {
	return useQuery({
		queryKey: accountKeys.me,
		queryFn: ({ signal }) => accountApi.get(signal),
	});
}

function useApplyAccount() {
	const queryClient = useQueryClient();
	const { user, setUser } = useUser();

	return (account: Account) => {
		queryClient.setQueryData(accountKeys.me, account);
		if (user) {
			setUser({
				...user,
				username: account.username,
				avatarUrl: account.avatarUrl,
			});
		}
		void queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
	};
}

export function useUpdateUsername() {
	const applyAccount = useApplyAccount();

	return useMutation({
		mutationFn: (username: string) => accountApi.updateUsername(username),
		onSuccess: applyAccount,
	});
}

export function useUploadAvatar() {
	const applyAccount = useApplyAccount();

	return useMutation({
		mutationFn: (file: File) => accountApi.uploadAvatar(file),
		onSuccess: applyAccount,
	});
}

export function useRemoveAvatar() {
	const applyAccount = useApplyAccount();

	return useMutation({
		mutationFn: () => accountApi.removeAvatar(),
		onSuccess: applyAccount,
	});
}

export function useChangePassword() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: accountApi.changePassword,
		onSuccess: () =>
			queryClient.setQueryData<Account>(accountKeys.me, (account) =>
				account ? { ...account, hasPassword: true } : account,
			),
	});
}
