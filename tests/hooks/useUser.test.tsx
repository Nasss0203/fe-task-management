import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUser } from "@/features/auth/model/use-user";
import {
  USER_STORAGE_CHANGED_EVENT,
  USER_STORAGE_KEY,
} from "@/features/auth/lib/auth-storage";
import { SystemRole } from "@/entities/user";

const authSession = vi.hoisted(() => ({
  snapshot: {
    isBootstrapping: false,
    isBootstrapped: true,
    isAuthenticated: true,
  },
}));

vi.mock("@/features/auth/model/auth-session", () => ({
  useAuthSessionSnapshot: () => authSession.snapshot,
}));

describe("useUser hook", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    authSession.snapshot = {
      isBootstrapping: false,
      isBootstrapped: true,
      isAuthenticated: true,
    };
  });

  afterEach(() => {
    // Clean up event listeners after each test to prevent memory leaks
    vi.restoreAllMocks();
  });

  it("does not trust a stale user snapshot before bootstrap completes", () => {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({ id: "stale-user" }),
    );
    authSession.snapshot = {
      isBootstrapping: true,
      isBootstrapped: false,
      isAuthenticated: false,
    };

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toBeUndefined();
    expect(result.current.isBootstrapped).toBe(false);
  });

  it("1. Trả về undefined nếu chưa có user trong storage", () => {
    const { result } = renderHook(() => useUser());
    expect(result.current.user).toBeUndefined();
  });

  it("2. Lấy dữ liệu user hợp lệ từ localStorage (snapshot)", () => {
    const mockUser = {
      id: "1",
      email: "test@example.com",
      username: "testuser",
      systemRole: SystemRole.USER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toEqual(mockUser);
  });

  it("3. Cập nhật state khi có sự kiện USER_STORAGE_CHANGED_EVENT", () => {
    const { result } = renderHook(() => useUser());

    expect(result.current.user).toBeUndefined();

    const mockUser = {
      id: "2",
      email: "update@example.com",
      username: "updateuser",
      systemRole: SystemRole.SYSTEM_ADMIN,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
      window.dispatchEvent(new Event(USER_STORAGE_CHANGED_EVENT));
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it("4. Trả về undefined nếu JSON trong localStorage bị lỗi (fallback)", () => {
    localStorage.setItem(USER_STORAGE_KEY, "{ invalid-json }");

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toBeUndefined();
  });

  it("5. Hàm setUser cập nhật giá trị đúng vào storage và phát event", () => {
    const mockUser = {
      id: "3",
      email: "set@example.com",
      username: "setuser",
      avatarUrl: null,
      systemRole: SystemRole.USER,
      isActive: true,
      lastActiveWorkspaceId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const eventSpy = vi.fn();
    window.addEventListener(USER_STORAGE_CHANGED_EVENT, eventSpy);

    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(localStorage.getItem(USER_STORAGE_KEY)).toBe(
      JSON.stringify(mockUser),
    );
    expect(eventSpy).toHaveBeenCalled();

    window.removeEventListener(USER_STORAGE_CHANGED_EVENT, eventSpy);
  });

  it("6. Hàm setUser(undefined) sẽ xóa storage và phát event", () => {
    const mockUser = {
      id: "4",
      email: "del@example.com",
      username: "deluser",
      systemRole: SystemRole.USER,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));

    const eventSpy = vi.fn();
    window.addEventListener(USER_STORAGE_CHANGED_EVENT, eventSpy);

    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.setUser(undefined);
    });

    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(eventSpy).toHaveBeenCalled();

    window.removeEventListener(USER_STORAGE_CHANGED_EVENT, eventSpy);
  });
});
