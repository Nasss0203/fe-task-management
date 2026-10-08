import { afterEach, describe, it, expect, vi } from "vitest";
import instance from "@/shared/api/api-client";
import { templateApi } from "@/entities/template/api/template.api";
import { publicTemplate } from "../fixtures/public-template";
afterEach(() => {
  vi.restoreAllMocks();
});
describe("public template detail API", () => {
  it("calls the dedicated public endpoint, unwraps data and forwards cancellation", async () => {
    const get = vi
      .spyOn(instance, "get")
      .mockResolvedValue({
        data: { statusCode: 200, message: "", data: publicTemplate },
      });
    const signal = new AbortController().signal;
    expect(await templateApi.getPublicById(publicTemplate.id, signal)).toBe(
      publicTemplate,
    );
    expect(get).toHaveBeenCalledExactlyOnceWith(
      "/public/templates/public-template",
      { signal },
    );
  });
  it("supports the existing unwrapped response convention", async () => {
    vi.spyOn(instance, "get").mockResolvedValue({ data: publicTemplate });
    expect(await templateApi.getPublicById(publicTemplate.id)).toBe(
      publicTemplate,
    );
  });
  it("propagates a not-found error without falling back to the list", async () => {
    const error = new Error("not found");
    const get = vi.spyOn(instance, "get").mockRejectedValue(error);
    await expect(templateApi.getPublicById("unknown")).rejects.toBe(error);
    expect(get).toHaveBeenCalledExactlyOnceWith("/public/templates/unknown", {
      signal: undefined,
    });
  });
});
