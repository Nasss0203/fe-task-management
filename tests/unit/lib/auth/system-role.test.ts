import { describe, it, expect } from "vitest";
import { SystemRole } from "@/services/auth/type";
import { isSystemAdmin, ADMIN_SYSTEM_ROLES } from "@/lib/auth/system-role";
import type { GetMeResponse } from "@/services/auth/type";

describe("system-role helper", () => {
	describe("ADMIN_SYSTEM_ROLES", () => {
		it("phải chứa chính xác các role dành cho admin hệ thống", () => {
			expect(ADMIN_SYSTEM_ROLES).toContain(SystemRole.SYSTEM_ADMIN);
			expect(ADMIN_SYSTEM_ROLES).toContain(SystemRole.SUPER_ADMIN);
			expect(ADMIN_SYSTEM_ROLES).not.toContain(SystemRole.USER);
		});
	});

	describe("isSystemAdmin", () => {
		it("trả về true nếu user có quyền SYSTEM_ADMIN", () => {
			const mockUser = { systemRole: SystemRole.SYSTEM_ADMIN } as GetMeResponse;
			expect(isSystemAdmin(mockUser)).toBe(true);
		});

		it("trả về true nếu user có quyền SUPER_ADMIN", () => {
			const mockUser = { systemRole: SystemRole.SUPER_ADMIN } as GetMeResponse;
			expect(isSystemAdmin(mockUser)).toBe(true);
		});

		it("trả về false nếu user có quyền USER", () => {
			const mockUser = { systemRole: SystemRole.USER } as GetMeResponse;
			expect(isSystemAdmin(mockUser)).toBe(false);
		});

		it("trả về false nếu user bị thiếu thuộc tính systemRole", () => {
			const mockUser = {} as GetMeResponse;
			expect(isSystemAdmin(mockUser)).toBe(false);
		});

		it("trả về false nếu truyền vào null hoặc undefined", () => {
			expect(isSystemAdmin(null)).toBe(false);
			expect(isSystemAdmin(undefined)).toBe(false);
		});
	});
});
