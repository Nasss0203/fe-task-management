import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageUnavailable } from "@/entities/page/ui/page-unavailable";

describe("PageUnavailable", () => {
	it("explains missing access without claiming the page exists", () => {
		render(<PageUnavailable reason='no-access' />);

		expect(
			screen.getByRole("heading", { name: "You don't have access to this page" }),
		).toBeInTheDocument();
		expect(screen.getByText(/may have been deleted/)).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
			"href",
			"/dashboard",
		);
	});

	it("shows not found for other errors", () => {
		render(<PageUnavailable reason='not-found' />);

		expect(
			screen.getByRole("heading", { name: "Page not found" }),
		).toBeInTheDocument();
	});
});
