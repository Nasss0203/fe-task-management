import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/config/theme-provider";
import { RealtimeProviderWrapper } from "@/providers/RealtimeProviderWrapper";
import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import Providers from "../config/providers";
import "./globals.css";

const montserrat = Montserrat({
	variable: "--font-geist-sans", // Keeping variable name same to prevent breakage in tailwind config if hardcoded somewhere, though CSS maps it.
	subsets: ["latin"],
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
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
				className={`antialiased ${montserrat.variable} ${jetbrainsMono.variable} font-sans`}
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
