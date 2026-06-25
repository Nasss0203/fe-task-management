import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge Component", () => {
	it("1. Render đúng với status todo (mặc định nếu không truyền props)", () => {
		render(<StatusBadge />);
		
		const badgeText = screen.getByText("Todo");
		expect(badgeText).toBeInTheDocument();
		// The parent div should have the todo badge classes
		expect(badgeText.parentElement).toHaveClass("bg-slate-500/10", "border-slate-700", "text-slate-300");
	});

	it("2. Render đúng với status in progress", () => {
		render(<StatusBadge statusName="Đang thực hiện" />);
		
		const badgeText = screen.getByText("Đang thực hiện");
		expect(badgeText).toBeInTheDocument();
		expect(badgeText.parentElement).toHaveClass("bg-blue-500/10", "border-blue-500/20", "text-blue-400");
	});

	it("3. Render đúng với status done khi isDone = true", () => {
		render(<StatusBadge statusName="Bất kỳ" isDone={true} />);
		
		const badgeText = screen.getByText("Bất kỳ");
		expect(badgeText).toBeInTheDocument();
		expect(badgeText.parentElement).toHaveClass("bg-emerald-500/10", "border-emerald-500/20", "text-emerald-400");
	});

	it("4. Áp dụng custom className từ props", () => {
		render(<StatusBadge className="my-custom-class" />);
		
		const badgeText = screen.getByText("Todo");
		expect(badgeText.parentElement).toHaveClass("my-custom-class");
	});
});
