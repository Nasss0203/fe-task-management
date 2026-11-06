import { LogIn, Unlink } from "lucide-react";
import { toast } from "sonner";

import { useConnectSlack, useDisconnectSlack } from "@/entities/notification/model/slack.mutations";
import { useSlackStatus } from "@/entities/notification/model/slack.queries";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";

import { SettingsGroup, SettingsHeader, SettingsRow } from "./settings-layout";

const ConnectionsSection = () => {
	const { data: status, isLoading } = useSlackStatus();
	const connectSlack = useConnectSlack();
	const disconnectSlack = useDisconnectSlack();

	const busy = isLoading || connectSlack.isPending || disconnectSlack.isPending;
	const revoked = status?.connectionError === "ACCESS_REVOKED";

	const connect = () =>
		connectSlack.mutate(`${window.location.pathname}${window.location.search}`, {
			onSuccess: (url) => window.location.assign(url),
			onError: (error) =>
				toast.error(getApiErrorMessage(error, "Couldn't open Slack sign-in")),
		});

	const disconnect = () =>
		disconnectSlack.mutate(undefined, {
			onSuccess: () => toast.success("Slack disconnected"),
			onError: (error) =>
				toast.error(getApiErrorMessage(error, "Couldn't disconnect Slack")),
		});

	const description = !status?.connected
		? "Get your Taskmanly notifications as direct messages in Slack."
		: revoked
			? "Slack access was revoked. Reconnect to keep receiving messages."
			: `Sending notifications to ${status.slackTeamName ?? "Slack"}.`;

	return (
		<div>
			<SettingsHeader
				title='Connections'
				description='Connect other apps to your Taskmanly account.'
			/>

			<SettingsGroup title='Notifications'>
				<SettingsRow label='Slack' description={description}>
					<div className='flex gap-2'>
						{(!status?.connected || revoked) && (
							<Button variant='outline' disabled={busy} onClick={connect}>
								<LogIn className='size-3.5' />
								{status?.connected ? "Reconnect" : "Connect"}
							</Button>
						)}
						{status?.connected && (
							<Button variant='outline' disabled={busy} onClick={disconnect}>
								<Unlink className='size-3.5' />
								Disconnect
							</Button>
						)}
					</div>
				</SettingsRow>
			</SettingsGroup>
		</div>
	);
};

export default ConnectionsSection;
