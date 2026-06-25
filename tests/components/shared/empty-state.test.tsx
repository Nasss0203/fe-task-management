import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/shared/EmptyState";

describe("EmptyState Component", () => {
	it("1. Render children content đúng cách", () => {
		render(
			<EmptyState>
				<span>Không có dữ liệu</span>
			</EmptyState>
		);
		
		const childrenText = screen.getByText("Không có dữ liệu");
		expect(childrenText).toBeInTheDocument();
		expect(childrenText.parentElement).toHaveClass("rounded-lg", "border", "border-dashed", "bg-muted/20");
	});
});
