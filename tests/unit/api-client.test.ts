import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const requestUse = vi.fn();
  const handlers: {
    responseError?: (error: unknown) => Promise<unknown>;
  } = {};
  const responseUse = vi.fn(
    (_onSuccess: unknown, onError: (error: unknown) => Promise<unknown>) => {
      handlers.responseError = onError;
    },
  );
  const apiInstance = Object.assign(vi.fn(), {
    interceptors: {
      request: { use: requestUse },
      response: { use: responseUse },
    },
  });
  const refreshClient = { post: vi.fn() };
  const create = vi
    .fn()
    .mockReturnValueOnce(apiInstance)
    .mockReturnValueOnce(refreshClient);

  return {
    apiInstance,
    create,
    handlers,
    refreshClient,
    requestUse,
    responseUse,
  };
});

vi.mock("axios", () => ({
  default: {
    create: mocks.create,
  },
}));

import {
  configureApiClientAuth,
  refreshAccessToken,
} from "@/shared/api/api-client";

describe("API client refresh", () => {
  beforeEach(() => {
    mocks.apiInstance.mockClear();
    mocks.refreshClient.post.mockReset();
  });

  it("uses a credentialed raw backend client with an empty body", async () => {
    mocks.refreshClient.post.mockResolvedValue({
      data: { data: { access_token: "new-access-token" } },
    });

    await expect(refreshAccessToken()).resolves.toBe("new-access-token");

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ withCredentials: true }),
    );
    expect(mocks.refreshClient.post).toHaveBeenCalledWith("/auth/refresh", {});
  });

  it("shares one refresh request between concurrent callers", async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    mocks.refreshClient.post.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    const first = refreshAccessToken();
    const second = refreshAccessToken();

    expect(first).toBe(second);
    expect(mocks.refreshClient.post).toHaveBeenCalledTimes(1);

    resolveRequest?.({
      data: { data: { access_token: "shared-access-token" } },
    });

    await expect(first).resolves.toBe("shared-access-token");
    await expect(second).resolves.toBe("shared-access-token");
  });

  it("does not intercept a 401 from the refresh endpoint", async () => {
    const responseErrorHandler = mocks.handlers.responseError;
    const refreshError = {
      config: { url: "/auth/refresh", headers: {} },
      response: { status: 401 },
    };

    if (!responseErrorHandler) {
      throw new Error("Response interceptor was not registered");
    }
    await expect(responseErrorHandler(refreshError)).rejects.toBe(refreshError);
    expect(mocks.refreshClient.post).not.toHaveBeenCalled();
  });

  it("stops after one raw refresh attempt when refresh returns 401", async () => {
    window.history.replaceState({}, "", "/sign-in");
    const clearAuth = vi.fn();
    configureApiClientAuth({
      getAccessToken: () => null,
      setAccessToken: vi.fn(),
      clearAuth,
    });
    const refreshError = {
      config: { url: "/auth/refresh", headers: {} },
      response: { status: 401 },
    };
    mocks.refreshClient.post.mockRejectedValue(refreshError);
    const responseErrorHandler = mocks.handlers.responseError;

    if (!responseErrorHandler) {
      throw new Error("Response interceptor was not registered");
    }

    await expect(
      responseErrorHandler({
        config: { url: "/projects", headers: {} },
        response: { status: 401 },
      }),
    ).rejects.toBe(refreshError);

    expect(mocks.refreshClient.post).toHaveBeenCalledTimes(1);
    expect(clearAuth).toHaveBeenCalledTimes(1);
    expect(mocks.apiInstance).not.toHaveBeenCalled();
  });

  it("updates memory and retries the original request after refresh", async () => {
    const setAccessToken = vi.fn();
    configureApiClientAuth({
      getAccessToken: () => null,
      setAccessToken,
      clearAuth: vi.fn(),
    });
    mocks.refreshClient.post.mockResolvedValue({
      data: { data: { access_token: "retried-access-token" } },
    });
    mocks.apiInstance.mockResolvedValue({ data: { ok: true } });
    const responseErrorHandler = mocks.handlers.responseError;
    const originalRequest = { url: "/projects", headers: {} };

    if (!responseErrorHandler) {
      throw new Error("Response interceptor was not registered");
    }
    await responseErrorHandler({
      config: originalRequest,
      response: { status: 401 },
    });

    expect(setAccessToken).toHaveBeenCalledWith("retried-access-token");
    expect(originalRequest.headers).toEqual({
      Authorization: "Bearer retried-access-token",
    });
    expect(mocks.apiInstance).toHaveBeenCalledWith(originalRequest);
  });
});
