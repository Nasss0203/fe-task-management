import { StrictMode } from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AuthCallbackPage from "@/features/auth/ui/auth-callback-page";
import { AuthBootstrap } from "@/features/auth/ui/auth-bootstrap";

const mocks = vi.hoisted(() => ({
  bootstrap: vi.fn(),
  clear: vi.fn(),
  replace: vi.fn(),
  toastError: vi.fn(),
}));

let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  usePathname: () => "/callback",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/features/auth/model/auth-session", () => ({
  authSessionLifecycle: {
    bootstrap: mocks.bootstrap,
    clear: mocks.clear,
  },
  useAuthSessionSnapshot: () => ({
    isBootstrapping: false,
    isBootstrapped: false,
    isAuthenticated: false,
  }),
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError },
}));

describe("Google auth callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams = new URLSearchParams();
    mocks.bootstrap.mockResolvedValue(true);
  });

  it("uses one callback bootstrap while root skips the callback route", async () => {
    searchParams = new URLSearchParams(
      "access_token=ignored&refresh_token=ignored",
    );

    render(
      <StrictMode>
        <AuthBootstrap>
          <AuthCallbackPage />
        </AuthBootstrap>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/");
    });

    expect(mocks.bootstrap).toHaveBeenCalledTimes(1);
    expect(mocks.bootstrap).toHaveBeenCalledWith();
  });

  it("does not bootstrap when the callback contains an error", async () => {
    searchParams = new URLSearchParams("error=google_auth_failed");

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/sign-in");
    });

    expect(mocks.bootstrap).not.toHaveBeenCalled();
    expect(mocks.clear).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith("Google sign-in failed");
  });

  it("clears local auth and returns to sign-in when bootstrap fails", async () => {
    mocks.bootstrap.mockResolvedValue(false);

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/sign-in");
    });

    expect(mocks.bootstrap).toHaveBeenCalledTimes(1);
    expect(mocks.toastError).toHaveBeenCalledWith("Google sign-in failed");
  });
});
