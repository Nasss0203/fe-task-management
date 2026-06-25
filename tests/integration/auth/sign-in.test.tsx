import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignIn from "@/app/(auth)/sign-in/page";
import { useLogin, useResendVerification } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { SystemRole } from "@/services/auth/type";

// Mocks
vi.mock("@/features/auth/hooks/useAuth");
vi.mock("next/navigation", () => ({
	useRouter: vi.fn(),
}));

describe("SignIn Page Integration", () => {
	const mockLoginMutate = vi.fn();
	const mockResendMutate = vi.fn();
	const mockPush = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		
		(useRouter as any).mockReturnValue({ push: mockPush });
		
		(useLogin as any).mockReturnValue({
			mutate: mockLoginMutate,
			isPending: false,
		});

		(useResendVerification as any).mockReturnValue({
			mutate: mockResendMutate,
			isPending: false,
		});
	});

	it("1. Render form thành công với các trường email và password", () => {
		render(<SignIn />);
		
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /đăng nhập/i })).toBeInTheDocument();
	});

	it("2. Hiển thị lỗi validation khi submit form thiếu dữ liệu (clear default)", async () => {
		const user = userEvent.setup();
		render(<SignIn />);
		
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/mật khẩu/i);
		
		// Xóa default values
		await user.clear(emailInput);
		await user.clear(passwordInput);
		
		const submitButton = screen.getByRole("button", { name: /đăng nhập/i });
		await user.click(submitButton);

		// Expect errors to appear
		await waitFor(() => {
			expect(screen.getByText("Email không hợp lệ.")).toBeInTheDocument();
			expect(screen.getByText("Mật khẩu phải có ít nhất 6 ký tự.")).toBeInTheDocument();
		});

		// Không gọi mutate API
		expect(mockLoginMutate).not.toHaveBeenCalled();
	});

	it("3. Gọi mutate API khi submit form hợp lệ và chuyển hướng đúng (role USER)", async () => {
		const user = userEvent.setup();
		// Mock the onSuccess call behavior
		mockLoginMutate.mockImplementation((data: any, options: any) => {
			if (options?.onSuccess) {
				options.onSuccess({ systemRole: SystemRole.USER });
			}
		});

		render(<SignIn />);
		
		const emailInput = screen.getByLabelText(/email/i);
		const passwordInput = screen.getByLabelText(/mật khẩu/i);
		
		await user.clear(emailInput);
		await user.clear(passwordInput);

		await user.type(emailInput, "user@example.com");
		await user.type(passwordInput, "validpassword");
		
		const submitButton = screen.getByRole("button", { name: /đăng nhập/i });
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockLoginMutate).toHaveBeenCalledTimes(1);
		});

		// Expect router.push to dashboard for USER
		expect(mockPush).toHaveBeenCalledWith("/dashboard");
	});

	it("4. Chuyển hướng sang trang admin nếu user là SYSTEM_ADMIN", async () => {
		const user = userEvent.setup();
		mockLoginMutate.mockImplementation((data: any, options: any) => {
			if (options?.onSuccess) {
				options.onSuccess({ systemRole: SystemRole.SYSTEM_ADMIN });
			}
		});

		render(<SignIn />);
		
		const submitButton = screen.getByRole("button", { name: /đăng nhập/i });
		await user.click(submitButton); // Use default form valid data

		await waitFor(() => {
			expect(mockLoginMutate).toHaveBeenCalledTimes(1);
		});

		expect(mockPush).toHaveBeenCalledWith("/admin");
	});

	it("5. Hiển thị đúng trạng thái loading", () => {
		(useLogin as any).mockReturnValue({
			mutate: mockLoginMutate,
			isPending: true,
		});

		render(<SignIn />);
		
		// Because it's loading, the button text is removed, we select by form attribute or disabled state
		const submitButton = screen.getByRole("button", { name: "" }) as HTMLButtonElement;
		expect(submitButton).toBeDisabled();
		expect(submitButton).toHaveAttribute("type", "submit");
	});
});
