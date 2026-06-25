import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriorityBadge } from "@/components/shared/priority-badge";

describe("PriorityBadge Component", () => {
	it("1. Render đúng với priority none (mặc định nếu không truyền props)", () => {
		render(<PriorityBadge />);
		
		const badgeText = screen.getByText("No priority");
		expect(badgeText).toBeInTheDocument();
		expect(badgeText.parentElement).toHaveClass("bg-slate-500/10", "border-slate-700", "text-slate-300");
	});

	it("2. Render đúng với priority low", () => {
		render(<PriorityBadge priorityName="Thấp" />);
		
		const badgeText = screen.getByText("Thấp");
		expect(badgeText).toBeInTheDocument();
		expect(badgeText.parentElement).toHaveClass("bg-emerald-500/10", "border-emerald-500/20", "text-emerald-400");
	});

	it("3. Render đúng với priority high", () => {
		render(<PriorityBadge priorityName="Cao" />);
		
		const badgeText = screen.getByText("Cao");
		expect(badgeText).toBeInTheDocument();
		expect(badgeText.parentElement).toHaveClass("bg-rose-500/10", "border-rose-500/20", "text-rose-400");
	});

	it("4. Render đúng với priority medium", () => {
		render(<PriorityBadge priorityName="Trung bình" />);
		
		const badgeText = screen.getByText("Trung bình");
		expect(badgeText).toBeInTheDocument();
		expect(badgeText.parentElement).toHaveClass("bg-amber-500/10", "border-amber-500/20", "text-amber-400");
	});

	it("5. Áp dụng custom className từ props", () => {
		render(<PriorityBadge className="my-custom-class" />);
		
		const badgeText = screen.getByText("No priority");
		expect(badgeText.parentElement).toHaveClass("my-custom-class");
	});
});
