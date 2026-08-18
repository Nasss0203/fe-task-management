"use client";

import { configureAuthClient } from "@/features/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

configureAuthClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}
