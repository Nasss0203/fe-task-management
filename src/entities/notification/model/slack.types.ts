export type SlackConnectionError = "ACCESS_REVOKED";

export type SlackDeliveryError = "RATE_LIMITED" | "DELIVERY_FAILED";

export interface SlackConnectionStatus {
	connected: boolean;
	slackTeamName: string | null;
	connectionError: SlackConnectionError | null;
	lastDeliveredAt: string | null;
	lastDeliveryFailedAt: string | null;
	lastDeliveryError: SlackDeliveryError | null;
}
