import React, { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { creatorApi } from "@/entities/creator";
import type { MyCreatorProfile, PublicCreatorProfile } from "@/entities/creator";
import { templateApi } from "@/entities/template/api/template.api";
import { CreatorProfilePage } from "@/widgets/creator-profile";
import { PublicCreatorPage } from "@/widgets/landing/templates";

vi.mock("next/navigation", () => ({
	usePathname: () => "/creators/nam-design",
	useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
	useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/auth", () => ({
	useUser: () => ({ user: { id: "u-1" } }),
}));

const emptyLinks = {
	website: null,
	x: null,
	github: null,
	linkedin: null,
	youtube: null,
	facebook: null,
};

const draft: MyCreatorProfile = {
	has_profile: false,
	handle: "nganhnam0203",
	display_name: null,
	headline: null,
	bio: null,
	avatar_url: null,
	cover_url: null,
	links: emptyLinks,
};

function renderWithClient(children: React.ReactNode) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	});
	const Wrapper = ({ children: inner }: PropsWithChildren) => (
		<QueryClientProvider client={client}>{inner}</QueryClientProvider>
	);
	return render(children, { wrapper: Wrapper });
}

afterEach(() => vi.restoreAllMocks());

describe("CreatorProfilePage", () => {
	it("creates the profile with a suggested handle and normalized fields", async () => {
		vi.spyOn(creatorApi, "getMine").mockResolvedValue(draft);
		const upsert = vi
			.spyOn(creatorApi, "upsertMine")
			.mockResolvedValue({ ...draft, has_profile: true, handle: "nam-design" });
		const user = userEvent.setup();

		renderWithClient(<CreatorProfilePage />);

		const handle = await screen.findByLabelText("Handle");
		expect(handle).toHaveValue("nganhnam0203");
		expect(screen.getByText(/Save your profile below first/)).toBeInTheDocument();

		await user.clear(handle);
		await user.type(handle, "Nam-Design");
		await user.type(screen.getByLabelText("Display name"), "  Nam ");
		await user.type(screen.getByLabelText("GitHub"), "https://github.com/nam");
		await user.click(screen.getByRole("button", { name: "Create profile" }));

		await waitFor(() =>
			expect(upsert).toHaveBeenCalledWith({
				handle: "nam-design",
				display_name: "Nam",
				headline: null,
				bio: null,
				...emptyLinks,
				github: "https://github.com/nam",
			}),
		);
	});

	it("blocks an invalid handle and shows a taken handle error", async () => {
		vi.spyOn(creatorApi, "getMine").mockResolvedValue({
			...draft,
			has_profile: true,
			handle: "nam",
		});
		vi.spyOn(creatorApi, "upsertMine").mockRejectedValue(
			new AxiosError("Conflict", "ERR_BAD_REQUEST", undefined, undefined, {
				status: 409,
				statusText: "Conflict",
				data: { message: "This handle is already taken" },
				headers: {},
				config: { headers: new AxiosHeaders() },
			}),
		);
		const user = userEvent.setup();

		renderWithClient(<CreatorProfilePage />);

		const handle = await screen.findByLabelText("Handle");
		await user.clear(handle);
		await user.type(handle, "a");
		expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();

		await user.type(handle, "dmin");
		await user.click(screen.getByRole("button", { name: "Save changes" }));
		expect(await screen.findByText("This handle is already taken")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /View public profile/ })).toHaveAttribute(
			"href",
			"/creators/nam",
		);
	});
});

describe("PublicCreatorPage", () => {
	it("shows the creator, stats and only their templates", async () => {
		const creator: PublicCreatorProfile = {
			handle: "nam-design",
			display_name: "Nam",
			headline: "Templates for product teams",
			bio: null,
			avatar_url: null,
			cover_url: null,
			links: { ...emptyLinks, github: "https://github.com/nam" },
			stats: { template_count: 2, rating_average: 4.5, rating_count: 3, like_count: 9 },
			joined_at: "2026-09-01T00:00:00.000Z",
		};
		vi.spyOn(creatorApi, "getPublic").mockResolvedValue(creator);
		const list = vi
			.spyOn(templateApi, "listPublic")
			.mockResolvedValue({ items: [], nextCursor: null });

		renderWithClient(<PublicCreatorPage handle='nam-design' />);

		expect(await screen.findByRole("heading", { name: "Nam" })).toBeInTheDocument();
		expect(screen.getByText("@nam-design")).toBeInTheDocument();
		expect(screen.getByText("4.5 (3)")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
			"rel",
			"noopener noreferrer nofollow ugc",
		);
		await waitFor(() =>
			expect(list).toHaveBeenCalledWith(
				expect.objectContaining({ creator: "nam-design" }),
				expect.any(AbortSignal),
			),
		);
	});
});
