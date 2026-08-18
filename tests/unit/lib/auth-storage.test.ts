import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	getStoredAccessToken,
	setStoredAccessToken,
	clearStoredAccessToken,
	setStoredUser,
	clearStoredUser,
	setSessionCookie,
	clearSessionCookie,
	AUTH_TOKEN_CHANGED_EVENT,
	USER_STORAGE_CHANGED_EVENT,
	USER_STORAGE_KEY,
} from "@/features/auth";

describe("auth-storage helper", () => {
	// Giả lập fetch API
	const mockFetch = vi.fn();
	
	beforeEach(() => {
		vi.clearAllMocks();
		
		// Reset in-memory token bằng cách gọi clear
		clearStoredAccessToken();
		
		// Setup localStorage mock
		localStorage.clear();
		
		// Override global fetch
		global.fetch = mockFetch;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Access Token Management (In-Memory)", () => {
		it("1. Lấy token mặc định trả về null", () => {
			expect(getStoredAccessToken()).toBeNull();
		});

		it("2. setStoredAccessToken lưu token vào bộ nhớ và phát sự kiện", () => {
			const mockEventCallback = vi.fn();
			window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, mockEventCallback);

			setStoredAccessToken("test-token-123");

			expect(getStoredAccessToken()).toBe("test-token-123");
			
			expect(mockEventCallback).toHaveBeenCalledTimes(1);
			const eventArg = mockEventCallback.mock.calls[0][0] as CustomEvent;
			expect(eventArg.detail).toBe("test-token-123");

			window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, mockEventCallback);
		});

		it("3. clearStoredAccessToken xóa token và phát sự kiện với null", () => {
			setStoredAccessToken("temp-token");
			
			const mockEventCallback = vi.fn();
			window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, mockEventCallback);

			clearStoredAccessToken();

			expect(getStoredAccessToken()).toBeNull();
			
			expect(mockEventCallback).toHaveBeenCalledTimes(1);
			const eventArg = mockEventCallback.mock.calls[0][0] as CustomEvent;
			expect(eventArg.detail).toBeNull();

			window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, mockEventCallback);
		});
	});

	describe("User Management (LocalStorage)", () => {
		it("4. setStoredUser lưu user vào localStorage và phát sự kiện", () => {
			const mockEventCallback = vi.fn();
			window.addEventListener(USER_STORAGE_CHANGED_EVENT, mockEventCallback);

			const userData = { id: "1", name: "John Doe" };
			setStoredUser(userData);

			const storedData = localStorage.getItem(USER_STORAGE_KEY);
			expect(storedData).toBe(JSON.stringify(userData));
			expect(mockEventCallback).toHaveBeenCalledTimes(1);

			window.removeEventListener(USER_STORAGE_CHANGED_EVENT, mockEventCallback);
		});

		it("5. clearStoredUser xóa user khỏi localStorage và phát sự kiện", () => {
			localStorage.setItem(USER_STORAGE_KEY, "some-data");
			
			const mockEventCallback = vi.fn();
			window.addEventListener(USER_STORAGE_CHANGED_EVENT, mockEventCallback);

			clearStoredUser();

			expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
			expect(mockEventCallback).toHaveBeenCalledTimes(1);

			window.removeEventListener(USER_STORAGE_CHANGED_EVENT, mockEventCallback);
		});
	});

	describe("Session Cookie Management (Fetch)", () => {
		it("6. setSessionCookie gọi fetch API đúng endpoint và payload", async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await setSessionCookie("refresh-token-xyz");

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith("/api/auth/session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refresh_token: "refresh-token-xyz" }),
			});
		});

		it("7. clearSessionCookie gọi fetch API method DELETE", async () => {
			mockFetch.mockResolvedValueOnce({ ok: true });

			await clearSessionCookie();

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith("/api/auth/session", {
				method: "DELETE",
			});
		});

		it("8. Xử lý lỗi (Fallback): console.error khi fetch thất bại", async () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const mockError = new Error("Network Error");
			mockFetch.mockRejectedValueOnce(mockError);

			await setSessionCookie("token-fail");

			expect(consoleSpy).toHaveBeenCalledWith("Failed to set session cookie", mockError);
			
			consoleSpy.mockRestore();
		});
	});
});
