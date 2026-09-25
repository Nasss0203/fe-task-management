import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearAccessToken: vi.fn(),
  clearUserSnapshot: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  setUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/sign-in",
}));

vi.mock("@/shared/api/api-client", () => ({
  refreshAccessToken: mocks.refreshAccessToken,
}));

vi.mock("@/features/auth/api/auth.api", () => ({
  getMeApi: mocks.getCurrentUser,
}));

vi.mock("@/features/auth/lib/auth-storage", () => ({
  clearStoredAccessToken: mocks.clearAccessToken,
  clearStoredUser: mocks.clearUserSnapshot,
  setStoredAccessToken: mocks.setAccessToken,
  setStoredUser: mocks.setUser,
}));

import { AuthBootstrap } from "@/features/auth/ui/auth-bootstrap";

describe("AuthBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refreshAccessToken.mockRejectedValue(new Error("refresh failed"));
    mocks.clearAccessToken.mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
    mocks.clearUserSnapshot.mockImplementation(() => {
      throw new DOMException("Access denied", "SecurityError");
    });
  });

  it("renders public content after bootstrap and storage cleanup fail", async () => {
    render(
      <AuthBootstrap>
        <div>Public content</div>
      </AuthBootstrap>,
    );

    await waitFor(() => {
      expect(screen.getByText("Public content")).toBeInTheDocument();
    });

    expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(mocks.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(mocks.clearUserSnapshot).toHaveBeenCalledTimes(1);
  });
});
