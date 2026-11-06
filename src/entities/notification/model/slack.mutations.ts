import { useMutation, useQueryClient } from "@tanstack/react-query";

import { slackApi } from "../api/slack.api";
import { slackKeys } from "./slack.queries";
import type { SlackConnectionStatus } from "./slack.types";

export function useConnectSlack() {
	return useMutation({
		mutationFn: (returnTo: string) => slackApi.getAuthorizeUrl(returnTo),
	});
}

export function useDisconnectSlack() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => slackApi.disconnect(),

		onSuccess: () => {
			queryClient.setQueryData<SlackConnectionStatus>(slackKeys.status(), {
				connected: false,
				slackTeamName: null,
				connectionError: null,
			});
		},
	});
}
