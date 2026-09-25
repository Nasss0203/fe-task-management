import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_TOKEN_CHANGED_EVENT,
  clearStoredAccessToken,
  clearStoredAuth,
  clearStoredUser,
  getStoredAccessToken,
  setStoredAccessToken,
  setStoredUser,
  USER_STORAGE_CHANGED_EVENT,
  USER_STORAGE_KEY,
} from "@/features/auth";

describe("auth-storage helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStoredAccessToken();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores the access token only in memory and emits its event", () => {
    const eventCallback = vi.fn();
    window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, eventCallback);

    setStoredAccessToken("test-token-123");

    expect(getStoredAccessToken()).toBe("test-token-123");
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(eventCallback).toHaveBeenCalledTimes(1);
    expect(
      (eventCallback.mock.calls[0]?.[0] as CustomEvent<string>).detail,
    ).toBe("test-token-123");

    window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, eventCallback);
  });

  it("clears the in-memory access token", () => {
    setStoredAccessToken("temp-token");

    clearStoredAccessToken();

    expect(getStoredAccessToken()).toBeNull();
  });

  it("stores and clears the non-credential user snapshot", () => {
    const eventCallback = vi.fn();
    window.addEventListener(USER_STORAGE_CHANGED_EVENT, eventCallback);
    const user = { id: "1", name: "User" };

    setStoredUser(user);
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBe(JSON.stringify(user));

    clearStoredUser();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(eventCallback).toHaveBeenCalledTimes(2);

    window.removeEventListener(USER_STORAGE_CHANGED_EVENT, eventCallback);
  });

  it("clears access and user state without calling a cookie BFF", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    setStoredAccessToken("access-token");
    setStoredUser({ id: "1" });

    clearStoredAuth();

    expect(getStoredAccessToken()).toBeNull();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
