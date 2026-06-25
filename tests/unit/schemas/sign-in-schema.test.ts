import { describe, it, expect } from "vitest";
import { formSchema } from "@/features/auth/schemas/sign-in.schema";

describe("SignIn formSchema", () => {
	it("hợp lệ với email và password đúng chuẩn", () => {
		const validData = {
			email: "user@example.com",
			password: "password123",
		};
		const result = formSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	describe("Validation Email", () => {
		it("thất bại nếu thiếu email", () => {
			const result = formSchema.safeParse({ password: "password123" });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toContain("email");
			}
		});

		it("thất bại nếu email sai định dạng", () => {
			const result = formSchema.safeParse({
				email: "invalid-email",
				password: "password123",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe("Email không hợp lệ.");
			}
		});

		it("thất bại nếu email quá ngắn (<5 ký tự)", () => {
			const result = formSchema.safeParse({
				email: "a@b.",
				password: "password123",
			});
			expect(result.success).toBe(false);
		});

		it("thất bại nếu email vượt quá 32 ký tự", () => {
			const longEmail = "a".repeat(25) + "@test.com"; // 35 ký tự
			const result = formSchema.safeParse({
				email: longEmail,
				password: "password123",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe("Email không được vượt quá 32 ký tự.");
			}
		});
	});

	describe("Validation Password", () => {
		it("thất bại nếu thiếu mật khẩu", () => {
			const result = formSchema.safeParse({ email: "user@example.com" });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].path).toContain("password");
			}
		});

		it("thất bại nếu mật khẩu ngắn hơn 6 ký tự", () => {
			const result = formSchema.safeParse({
				email: "user@example.com",
				password: "12345",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe("Mật khẩu phải có ít nhất 6 ký tự.");
			}
		});

		it("thất bại nếu mật khẩu vượt quá 100 ký tự", () => {
			const result = formSchema.safeParse({
				email: "user@example.com",
				password: "a".repeat(101),
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0].message).toBe("Mật khẩu không được vượt quá 100 ký tự.");
			}
		});
	});
});
