import { describe, expect, it } from "vitest";

import {
	getActiveCreatorNavItem,
	isCreatorNavActive,
} from "@/widgets/creator-layout/model/creator-nav";

describe("creator nav", () => {
	it("matches Overview only on the exact /creator route", () => {
		expect(isCreatorNavActive("/creator", "/creator")).toBe(true);
		expect(isCreatorNavActive("/creator/templates", "/creator")).toBe(false);
	});

	it("matches nested routes for section items", () => {
		expect(
			isCreatorNavActive("/creator/templates/t-1", "/creator/templates"),
		).toBe(true);
		expect(
			isCreatorNavActive("/creator/templatesx", "/creator/templates"),
		).toBe(false);
	});

	it("resolves the active nav item from the pathname", () => {
		expect(getActiveCreatorNavItem("/creator")?.title).toBe("Overview");
		expect(getActiveCreatorNavItem("/creator/templates/t-1")?.href).toBe(
			"/creator/templates",
		);
		expect(getActiveCreatorNavItem("/creator/analytics")?.title).toBe(
			"Analytics",
		);
		expect(getActiveCreatorNavItem("/creator/unknown")).toBeUndefined();
	});
});
