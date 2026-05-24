"use client";

import {
	AUTH_TOKEN_CHANGED_EVENT,
	getStoredAccessToken,
} from "@/lib/auth-storage";
import { NotificationRealtimeProvider } from "@/providers/RealtimeProvider";
import { useEffect, useState } from "react";

export function RealtimeProviderWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const [accessToken, setAccessToken] = useState<string | null>(null);

	useEffect(() => {
		const syncAccessToken = () => {
			setAccessToken(getStoredAccessToken());
		};

		const handleTokenChanged = (event: Event) => {
			const customEvent = event as CustomEvent<string | null>;

			setAccessToken(customEvent.detail ?? getStoredAccessToken());
		};

		syncAccessToken();

		window.addEventListener("storage", syncAccessToken);
		window.addEventListener(
			AUTH_TOKEN_CHANGED_EVENT,
			handleTokenChanged as EventListener,
		);

		return () => {
			window.removeEventListener("storage", syncAccessToken);
			window.removeEventListener(
				AUTH_TOKEN_CHANGED_EVENT,
				handleTokenChanged as EventListener,
			);
		};
	}, []);

	return (
		<NotificationRealtimeProvider accessToken={accessToken}>
			{children}
		</NotificationRealtimeProvider>
	);
}
