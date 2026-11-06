import { useQuery } from "@tanstack/react-query";

import { slackApi } from "../api/slack.api";

export const slackKeys = {
	status: () => ["integrations", "slack"] as const,
};

export function useSlackStatus(enabled = true) {
	return useQuery({
		queryKey: slackKeys.status(),
		queryFn: () => slackApi.getStatus(),
		enabled,
	});
}
