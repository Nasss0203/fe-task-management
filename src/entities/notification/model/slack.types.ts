export type SlackConnectionError = "ACCESS_REVOKED";

export interface SlackConnectionStatus {
	connected: boolean;
	slackTeamName: string | null;
	connectionError: SlackConnectionError | null;
}
