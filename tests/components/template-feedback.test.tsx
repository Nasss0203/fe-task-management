import React, { type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { templateApi } from "@/entities/template/api/template.api";
import type { TemplateReviewsResponse } from "@/entities/template/model/template.types";
import {
	TemplateFeedbackSummary,
	TemplateReviewsSection,
} from "@/features/template-feedback";

vi.mock("next/navigation", () => ({
	usePathname: () => "/templates/t-1",
}));

let mockUser: { id: string } | null = null;
vi.mock("@/features/auth", () => ({
	useUser: () => ({ user: mockUser }),
}));

function response(
	viewer: TemplateReviewsResponse["viewer"],
): TemplateReviewsResponse {
	return {
		rating_average: 4.5,
		rating_count: 2,
		like_count: 7,
		distribution: [0, 0, 0, 1, 1],
		items: [
			{
				id: "r-1",
				rating: 5,
				body: "Saved me hours",
				version_number: 2,
				is_owner: true,
				author: { username: "alice", avatar_url: null },
				created_at: "2026-10-18T03:00:00.000Z",
				updated_at: "2026-10-18T03:00:00.000Z",
			},
		],
		total: 1,
		page: 1,
		limit: 10,
		total_pages: 1,
		viewer,
	};
}

function renderWithClient(children: React.ReactNode) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: 0 } },
	});
	const Wrapper = ({ children: inner }: PropsWithChildren) => (
		<QueryClientProvider client={client}>{inner}</QueryClientProvider>
	);
	return render(children, { wrapper: Wrapper });
}

afterEach(() => {
	vi.restoreAllMocks();
	mockUser = null;
});

describe("template feedback", () => {
	it("shows the rating summary and asks guests to sign in", async () => {
		vi.spyOn(templateApi, "getPublicReviews").mockResolvedValue(response(null));

		renderWithClient(
			<>
				<TemplateFeedbackSummary templateId='t-1' />
				<TemplateReviewsSection templateId='t-1' />
			</>,
		);

		expect(await screen.findAllByText("4.5 (2)")).not.toHaveLength(0);
		expect(screen.getByRole("link", { name: /7 likes/ })).toHaveAttribute(
			"href",
			"/sign-in?next=%2Ftemplates%2Ft-1",
		);
		expect(screen.getByText(/to rate this template/)).toBeInTheDocument();
		expect(screen.getByText("Saved me hours")).toBeInTheDocument();
		expect(screen.getByText("Verified")).toBeInTheDocument();
	});

	it("lets a non-owner rate but not write a review", async () => {
		mockUser = { id: "u-2" };
		vi.spyOn(templateApi, "getPublicReviews").mockResolvedValue(
			response({ liked: false, review: null, is_creator: false, can_comment: false }),
		);
		const upsert = vi.spyOn(templateApi, "upsertReview").mockResolvedValue();
		const user = userEvent.setup();

		renderWithClient(<TemplateReviewsSection templateId='t-1' />);

		await user.click(await screen.findByRole("radio", { name: "4 stars" }));
		expect(screen.queryByLabelText(/Your review/)).toBeNull();
		await user.click(screen.getByRole("button", { name: "Submit" }));

		await waitFor(() =>
			expect(upsert).toHaveBeenCalledWith("t-1", { rating: 4, body: null }),
		);
	});

	it("lets an owner write a review and toggles the like", async () => {
		mockUser = { id: "u-3" };
		vi.spyOn(templateApi, "getPublicReviews").mockResolvedValue(
			response({ liked: false, review: null, is_creator: false, can_comment: true }),
		);
		const upsert = vi.spyOn(templateApi, "upsertReview").mockResolvedValue();
		const like = vi
			.spyOn(templateApi, "setLike")
			.mockResolvedValue({ liked: true, like_count: 8 });
		const user = userEvent.setup();

		renderWithClient(
			<>
				<TemplateFeedbackSummary templateId='t-1' />
				<TemplateReviewsSection templateId='t-1' />
			</>,
		);

		await user.click(await screen.findByRole("radio", { name: "5 stars" }));
		await user.type(screen.getByLabelText(/Your review/), "  Great  ");
		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() =>
			expect(upsert).toHaveBeenCalledWith("t-1", { rating: 5, body: "Great" }),
		);

		await user.click(screen.getByRole("button", { name: /7 likes/ }));
		await waitFor(() => expect(like).toHaveBeenCalledWith("t-1", true));
	});

	it("does not let the creator rate or like their own template", async () => {
		mockUser = { id: "creator" };
		vi.spyOn(templateApi, "getPublicReviews").mockResolvedValue(
			response({ liked: false, review: null, is_creator: true, can_comment: false }),
		);

		renderWithClient(
			<>
				<TemplateFeedbackSummary templateId='t-1' />
				<TemplateReviewsSection templateId='t-1' />
			</>,
		);

		expect(await screen.findByText(/cannot rate it/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /7 likes/ })).toBeDisabled();
	});
});
