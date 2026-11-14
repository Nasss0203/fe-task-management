import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { slackApi } from "@/entities/notification/api/slack.api";
import type { SlackConnectionStatus } from "@/entities/notification/model/slack.types";
import ConnectionsSection from "@/features/workspace-settings/ui/sections/ConnectionsSection";

import { renderWithClient } from "../utils/test-utils";

vi.mock("@/entities/notification/api/slack.api", () => ({
	slackApi: { getStatus: vi.fn(), getAuthorizeUrl: vi.fn(), disconnect: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const slack = vi.mocked(slackApi);
const status = (overrides: Partial<SlackConnectionStatus> = {}): SlackConnectionStatus => ({
	connected: true,
	slackTeamName: "Acme",
	connectionError: null,
	lastDeliveredAt: null,
	lastDeliveryFailedAt: null,
	lastDeliveryError: null,
	...overrides,
});

describe("ConnectionsSection", () => {
	const assign = vi.fn();
	const originalLocation = window.location;

	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(window, "location", {
			configurable: true,
			value: { ...originalLocation, pathname: "/page/page-1", search: "?view=board", assign },
		});
	});

	it("sends the user to Slack and back to the current page", async () => {
		slack.getStatus.mockResolvedValue(status({ connected: false, slackTeamName: null }));
		slack.getAuthorizeUrl.mockResolvedValue("https://slack.com/oauth/v2/authorize?x=1");
		renderWithClient(<ConnectionsSection />);

		const connect = await screen.findByRole("button", { name: "Connect" });
		await waitFor(() => expect(connect).toBeEnabled());
		fireEvent.click(connect);

		await waitFor(() =>
			expect(assign).toHaveBeenCalledWith("https://slack.com/oauth/v2/authorize?x=1"),
		);
		expect(slack.getAuthorizeUrl).toHaveBeenCalledWith("/page/page-1?view=board");
	});

	it("shows the connected Slack and disconnects it", async () => {
		slack.getStatus.mockResolvedValue(status());
		slack.disconnect.mockResolvedValue();
		renderWithClient(<ConnectionsSection />);

		expect(await screen.findByText("Sending notifications to Acme.")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Connect" })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Disconnect" }));

		expect(await screen.findByRole("button", { name: "Connect" })).toBeInTheDocument();
		expect(slack.disconnect).toHaveBeenCalled();
	});

	it("shows when the last message reached Slack", async () => {
		slack.getStatus.mockResolvedValue(
			status({ lastDeliveredAt: new Date(Date.now() - 5 * 60_000).toISOString() }),
		);
		renderWithClient(<ConnectionsSection />);

		expect(
			await screen.findByText("Sending notifications to Acme. Last message sent 5 minutes ago."),
		).toBeInTheDocument();
	});

	it("warns when the last message failed after the last delivery", async () => {
		slack.getStatus.mockResolvedValue(
			status({
				lastDeliveredAt: "2026-11-14T08:00:00.000Z",
				lastDeliveryFailedAt: "2026-11-14T09:00:00.000Z",
				lastDeliveryError: "RATE_LIMITED",
			}),
		);
		renderWithClient(<ConnectionsSection />);

		expect(
			await screen.findByText(/Couldn't deliver the last message: Slack is limiting requests/),
		).toBeInTheDocument();
		expect(screen.queryByText(/Last message sent/)).not.toBeInTheDocument();
	});

	it("keeps showing the delivery once a later message went through", async () => {
		slack.getStatus.mockResolvedValue(
			status({
				lastDeliveredAt: new Date().toISOString(),
				lastDeliveryFailedAt: new Date(Date.now() - 60 * 60_000).toISOString(),
				lastDeliveryError: "DELIVERY_FAILED",
			}),
		);
		renderWithClient(<ConnectionsSection />);

		expect(await screen.findByText(/Last message sent/)).toBeInTheDocument();
		expect(screen.queryByText(/Couldn't deliver/)).not.toBeInTheDocument();
	});

	it("asks to reconnect when Slack access was revoked", async () => {
		slack.getStatus.mockResolvedValue(status({ connectionError: "ACCESS_REVOKED" }));
		renderWithClient(<ConnectionsSection />);

		expect(await screen.findByRole("button", { name: "Reconnect" })).toBeInTheDocument();
		expect(screen.getByText(/Slack access was revoked/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Disconnect" })).toBeInTheDocument();
	});
});
