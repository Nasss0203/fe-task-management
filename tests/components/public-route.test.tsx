import { Suspense } from "react";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PublicSiteRoute from "@/app/(public)/public/[subdomain]/[[...path]]/page";
import { usePublicPage } from "@/entities/public-site/model/public-site.queries";

vi.mock("@/entities/public-site/model/public-site.queries", () => ({ usePublicPage: vi.fn() }));
vi.mock("@/widgets/public-page/ui/PublicPage", () => ({ PublicPage: ({ publicSite }: { publicSite: { page: { title: string } } }) => <h1>{publicSite.page.title}</h1>, PublicPageSkeleton: () => <div>Loading</div> }));

describe("public route", () => {
	it("passes the nested path with its leading slash and renders an empty-block page", async () => {
		vi.mocked(usePublicPage).mockReturnValue({ isPending: false, isError: false, data: { page: { title: "About" }, blocks: [] } } as unknown as ReturnType<typeof usePublicPage>);
		await act(async () => { render(<Suspense fallback='Loading'><PublicSiteRoute params={Promise.resolve({ subdomain: "asss", path: ["about"] })} /></Suspense>); });
		expect(await screen.findByRole("heading", { name: "About" })).toBeInTheDocument();
		expect(usePublicPage).toHaveBeenCalledWith("asss", "/about");
	});
});
