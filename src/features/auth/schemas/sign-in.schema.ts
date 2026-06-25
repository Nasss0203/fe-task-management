import { z } from "zod";

export const formSchema = z.object({
	email: z
		.string()
		.email("Email không hợp lệ.")
		.min(5, "Email phải có ít nhất 5 ký tự.")
		.max(32, "Email không được vượt quá 32 ký tự."),
	password: z
		.string()
		.min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
		.max(100, "Mật khẩu không được vượt quá 100 ký tự."),
});
