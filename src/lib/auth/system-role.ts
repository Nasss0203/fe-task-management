import { GetMeResponse, SystemRole } from "@/services/auth/type";

export const ADMIN_SYSTEM_ROLES = [
	SystemRole.SYSTEM_ADMIN,
	SystemRole.SUPER_ADMIN,
];

export function isSystemAdmin(user?: GetMeResponse | null): boolean {
	if (!user?.systemRole) return false;

	return ADMIN_SYSTEM_ROLES.includes(user.systemRole);
}
