import { SystemRole, type GetMeResponse } from "@/entities/user";
import { createAuthSessionLifecycle } from "@/features/auth/model/auth-session";
import { beforeEach, describe, expect, it, vi } from "vitest";

const user: GetMeResponse = {
  id: "user-id",
  email: "user@example.com",
  username: "user",
  avatarUrl: null,
  isActive: true,
  systemRole: SystemRole.USER,
  lastActiveWorkspaceId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const createDependencies = () => ({
  refreshAccessToken: vi.fn<() => Promise<string>>(),
  getCurrentUser: vi.fn<() => Promise<GetMeResponse>>(),
  setAccessToken: vi.fn<(accessToken: string) => void>(),
  setUser: vi.fn<(value: GetMeResponse) => void>(),
  clearAccessToken: vi.fn<() => void>(),
  clearUserSnapshot: vi.fn<() => void>(),
});

describe("auth session lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bootstraps a valid cookie session in refresh, token, me, user order", async () => {
    const events: string[] = [];
    const dependencies = createDependencies();
    dependencies.refreshAccessToken.mockImplementation(async () => {
      events.push("refresh");
      return "access-token";
    });
    dependencies.setAccessToken.mockImplementation(() => {
      events.push("token");
    });
    dependencies.getCurrentUser.mockImplementation(async () => {
      events.push("me");
      return user;
    });
    dependencies.setUser.mockImplementation(() => {
      events.push("user");
    });
    const lifecycle = createAuthSessionLifecycle(dependencies);

    await expect(lifecycle.bootstrap()).resolves.toBe(true);

    expect(events).toEqual(["refresh", "token", "me", "user"]);
    expect(dependencies.setAccessToken).toHaveBeenCalledWith("access-token");
    expect(dependencies.setUser).toHaveBeenCalledWith(user);
    expect(lifecycle.getSnapshot()).toEqual({
      isBootstrapping: false,
      isBootstrapped: true,
      isAuthenticated: true,
    });
  });

  it("clears a stale snapshot and completes when no refresh cookie exists", async () => {
    const dependencies = createDependencies();
    dependencies.refreshAccessToken.mockRejectedValue(
      new Error("refresh cookie missing"),
    );
    const lifecycle = createAuthSessionLifecycle(dependencies);

    await expect(lifecycle.bootstrap()).resolves.toBe(false);

    expect(dependencies.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(dependencies.clearUserSnapshot).toHaveBeenCalledTimes(1);
    expect(dependencies.getCurrentUser).not.toHaveBeenCalled();
    expect(lifecycle.getSnapshot()).toEqual({
      isBootstrapping: false,
      isBootstrapped: true,
      isAuthenticated: false,
    });
  });

  it("clears access and user state when loading /auth/me fails", async () => {
    const dependencies = createDependencies();
    dependencies.refreshAccessToken.mockResolvedValue("access-token");
    dependencies.getCurrentUser.mockRejectedValue(new Error("me failed"));
    const lifecycle = createAuthSessionLifecycle(dependencies);

    await expect(lifecycle.bootstrap()).resolves.toBe(false);

    expect(dependencies.setAccessToken).toHaveBeenCalledWith("access-token");
    expect(dependencies.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(dependencies.clearUserSnapshot).toHaveBeenCalledTimes(1);
    expect(dependencies.setUser).not.toHaveBeenCalled();
    expect(lifecycle.getSnapshot().isAuthenticated).toBe(false);
  });

  it("shares one bootstrap chain between React Strict Mode callers", async () => {
    let resolveRefresh: ((accessToken: string) => void) | undefined;
    const dependencies = createDependencies();
    dependencies.refreshAccessToken.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    dependencies.getCurrentUser.mockResolvedValue(user);
    const lifecycle = createAuthSessionLifecycle(dependencies);

    const firstBootstrap = lifecycle.bootstrap();
    const secondBootstrap = lifecycle.bootstrap();

    expect(firstBootstrap).toBe(secondBootstrap);
    expect(dependencies.refreshAccessToken).toHaveBeenCalledTimes(1);

    resolveRefresh?.("access-token");
    await expect(firstBootstrap).resolves.toBe(true);
    await expect(secondBootstrap).resolves.toBe(true);
  });

  it("does not reject or remain loading when storage cleanup throws SecurityError", async () => {
    const dependencies = createDependencies();
    dependencies.refreshAccessToken.mockRejectedValue(
      new Error("refresh failed"),
    );
    dependencies.clearAccessToken.mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    dependencies.clearUserSnapshot.mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    const lifecycle = createAuthSessionLifecycle(dependencies);

    await expect(lifecycle.bootstrap()).resolves.toBe(false);

    expect(dependencies.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(dependencies.clearUserSnapshot).toHaveBeenCalledTimes(1);
    expect(lifecycle.getSnapshot()).toEqual({
      isBootstrapping: false,
      isBootstrapped: true,
      isAuthenticated: false,
    });
  });

  it("attempts both cleanups and clears access memory when user cleanup throws", () => {
    let accessToken: string | null = "access-token";
    const dependencies = createDependencies();
    dependencies.clearAccessToken.mockImplementation(() => {
      accessToken = null;
    });
    dependencies.clearUserSnapshot.mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    const lifecycle = createAuthSessionLifecycle(dependencies);

    expect(() => lifecycle.clear()).not.toThrow();

    expect(accessToken).toBeNull();
    expect(dependencies.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(dependencies.clearUserSnapshot).toHaveBeenCalledTimes(1);
    expect(lifecycle.getSnapshot()).toEqual({
      isBootstrapping: false,
      isBootstrapped: true,
      isAuthenticated: false,
    });
  });

  it("fails closed when saving the user snapshot throws", async () => {
    let accessToken: string | null = null;
    const dependencies = createDependencies();
    dependencies.refreshAccessToken.mockResolvedValue("access-token");
    dependencies.setAccessToken.mockImplementation((value) => {
      accessToken = value;
    });
    dependencies.getCurrentUser.mockResolvedValue(user);
    dependencies.setUser.mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    dependencies.clearAccessToken.mockImplementation(() => {
      accessToken = null;
    });
    const lifecycle = createAuthSessionLifecycle(dependencies);

    await expect(lifecycle.bootstrap()).resolves.toBe(false);

    expect(accessToken).toBeNull();
    expect(dependencies.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(dependencies.clearUserSnapshot).toHaveBeenCalledTimes(1);
    expect(lifecycle.getSnapshot()).toEqual({
      isBootstrapping: false,
      isBootstrapped: true,
      isAuthenticated: false,
    });
  });
});
