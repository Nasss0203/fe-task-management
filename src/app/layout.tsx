import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/config/theme-provider";
import { RealtimeProviderWrapper } from "@/providers/RealtimeProviderWrapper";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "../config/providers";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Taskmanly - Smarter project execution",
	description: "The optimal solution for collaborative tasks across diverse functions.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`antialiased ${geistSans.variable} ${geistMono.variable} font-sans`}
			>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<Providers>
						<RealtimeProviderWrapper>
							{children}
						</RealtimeProviderWrapper>
					</Providers>

					<Toaster richColors position='top-right' />
				</ThemeProvider>
			</body>
		</html>
	);
}
