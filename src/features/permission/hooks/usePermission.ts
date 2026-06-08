// src/features/permission/hooks/usePermission.ts
import { type PermissionCode } from "@/constants/permissions";
import { WORKSPACE_KEY } from "@/services/workspace/type";
import { findWorkspaceAccessApi } from "@/services/workspace/workspace.service";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export const usePermission = (workspaceId?: string) => {
	const query = useQuery({
		queryKey: [WORKSPACE_KEY.WORKSPACE_ACCESS, workspaceId],
		queryFn: () => findWorkspaceAccessApi(workspaceId as string),
		enabled: !!workspaceId,
		staleTime: 5 * 60 * 1000,
		retry: (_, error: any) => error?.response?.status !== 403,
	});

	const permissions = useMemo(
		() => query.data?.data.permissions ?? [],
		[query.data?.data.permissions],
	);

	// Typed — chỉ nhận PERMISSIONS.XYZ, không nhận string random
	const can = useCallback(
		(code: PermissionCode) => permissions.includes(code),
		[permissions],
	);

	return { ...query, permissions, can };
};
