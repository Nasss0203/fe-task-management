import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClaimedTemplateCard } from "@/widgets/workspace-template-gallery/ui/claimed-template-card";
import { toClaimedTemplateCard } from "@/widgets/workspace-template-gallery/model/claimed-template-card.model";
import type { ClaimedTemplateDto } from "@/entities/template";
import { claimedTemplate } from "../fixtures/claimed-template";

function setup(changes: Partial<ClaimedTemplateDto> = {}) {
	const onDetails = vi.fn(),
		onUse = vi.fn();
	const view = render(
		<ClaimedTemplateCard
			template={toClaimedTemplateCard({ ...claimedTemplate, ...changes })}
			onDetails={onDetails}
			onUse={onUse}
		/>,
	);
	return { ...view, onDetails, onUse };
}

describe("Claimed template card presentation", () => {
	it("shows a single name, icon, badges, claim date and supplied version without loading bars", async () => {
		const { container, onDetails, onUse } = setup();
		expect(screen.getAllByText(claimedTemplate.name!)).toHaveLength(1);
		expect(screen.getByText(claimedTemplate.icon!)).toBeInTheDocument();
		expect(screen.getByText("Claimed", { selector: '[data-slot="badge"]' })).toBeInTheDocument();
		expect(screen.getByText("FREE")).toBeInTheDocument();
		expect(container.querySelector("time")).toHaveAttribute(
			"datetime",
			claimedTemplate.claimed_at,
		);
		expect(screen.getByText("Latest v1")).toBeInTheDocument();
		expect(
			container.querySelector(
				'[data-slot="skeleton"], .animate-pulse, .bg-foreground\\/20',
			),
		).not.toBeInTheDocument();
		await userEvent.click(screen.getByRole("button", { name: "Details" }));
		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		expect(onDetails).toHaveBeenCalledOnce();
		expect(onUse).toHaveBeenCalledOnce();
	});

	it("renders the allowed cover and falls back to the icon when loading fails", () => {
		const { container } = setup({ cover_url: "https://example.com/cover.png" });
		const image = container.querySelector("img")!;
		expect(image).toHaveAttribute("src", "https://example.com/cover.png");
		fireEvent.error(image);
		expect(container.querySelector("img")).not.toBeInTheDocument();
		expect(screen.getByText(claimedTemplate.icon!)).toBeInTheDocument();
	});

	it.each([null, "", "http://[invalid", "javascript:alert(1)"])(
		"uses the placeholder for absent/invalid cover %s",
		(cover_url) => {
			const { container } = setup({ cover_url });
			expect(container.querySelector("img")).not.toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: claimedTemplate.name! }),
			).toBeInTheDocument();
		},
	);

	it.each(["PRIVATE", "WORKSPACE"] as const)(
		"keeps %s redacted and disables actions",
		(visibility) => {
			const { container } = setup({
				visibility,
				name: null,
				description: "Hidden description",
				icon: "Hidden icon",
				cover_url: "https://example.com/hidden.png",
			});
			expect(screen.getAllByText("Restricted template")).toHaveLength(1);
			expect(screen.queryByText("Hidden description")).not.toBeInTheDocument();
			expect(screen.queryByText("Hidden icon")).not.toBeInTheDocument();
			expect(container.querySelector("img")).not.toBeInTheDocument();
			expect(screen.queryByText("Latest v1")).not.toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Details" })).toBeDisabled();
			expect(
				screen.getByRole("button", { name: "Use template" }),
			).toBeDisabled();
		},
	);

	it("retains the unpublished status and Use attempt", () => {
		setup({ listing_status: "DRAFT" });
		expect(
			screen.getByText("Unpublished · In your library"),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Use template" })).toBeEnabled();
	});

	it("shows archived state without enabling actions", () => {
		setup({ status: "ARCHIVED" });
		expect(screen.getByText("Archived · Unavailable")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Use template" })).toBeDisabled();
	});

	it("contains long names and descriptions and exposes the full title on hover", () => {
		const name = "LongTemplateName".repeat(25);
		const { container } = setup({
			name,
			description: "Long description ".repeat(50),
		});
		expect(screen.getAllByText(name)).toHaveLength(1);
		expect(screen.getByText(name)).toHaveAttribute("title", name);
		expect(container.firstChild).toHaveClass("min-w-0", "overflow-hidden");
	});

	it("renders Next.js links to consumer detail for public published templates", () => {
		const { container } = setup();
		const titleLink = screen.getByRole("link", { name: claimedTemplate.name! });
		expect(titleLink).toHaveAttribute("href", `/dashboard/templates/${claimedTemplate.template_id}`);
		const coverLink = container.querySelector('a[href="/dashboard/templates/template-a"][tabindex="-1"]');
		expect(coverLink).toBeInTheDocument();
	});

	it("does not render consumer detail links for unpublished templates", () => {
		const { container } = setup({ listing_status: "DRAFT" });
		expect(
			screen.queryByRole("link", { name: claimedTemplate.name! }),
		).not.toBeInTheDocument();
		expect(container.querySelector('a[href^="/dashboard/templates/"]')).not.toBeInTheDocument();
	});

	it("triggers onDetails on card click and stops propagation on button clicks", async () => {
		const { container, onDetails, onUse } = setup();
		// Clicking whitespace on card shell calls onDetails
		await userEvent.click(container.firstChild as HTMLElement);
		expect(onDetails).toHaveBeenCalledOnce();
		expect(onUse).not.toHaveBeenCalled();

		// Clicking Use template calls onUse and does not trigger onDetails again
		await userEvent.click(screen.getByRole("button", { name: "Use template" }));
		expect(onUse).toHaveBeenCalledOnce();
		expect(onDetails).toHaveBeenCalledOnce();
	});
});
