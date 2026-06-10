// src/features/permission/components/RequirePermission.tsx
"use client";

import { type PermissionCode } from "@/constants/permissions";
import { usePermission } from "@/features/permission/hooks/usePermission";
import {
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";

type RequirePermissionProps = {
	workspaceId?: string;
	code: PermissionCode; // typed — chỉ nhận PERMISSIONS.XYZ
	children: ReactNode;
	fallback?: ReactNode;
	mode?: "hide" | "disable";
	bypass?: boolean;
};

export function RequirePermission({
	workspaceId,
	code,
	children,
	fallback = null,
	mode = "hide",
	bypass = false,
}: RequirePermissionProps) {
	const { can, isLoading } = usePermission(workspaceId);

	if (bypass) return <>{children}</>;

	if (!workspaceId) return <>{children}</>;

	if (isLoading) {
		if (mode === "disable" && isValidElement(children)) {
			const child = children as ReactElement<{ disabled?: boolean }>;
			return cloneElement(child, { disabled: true });
		}
		return <>{children}</>;
	}

	if (can(code)) return <>{children}</>;

	if (mode === "disable" && isValidElement(children)) {
		const child = children as ReactElement<{ disabled?: boolean }>;
		return cloneElement(child, { disabled: true });
	}

	return <>{fallback}</>;
}
