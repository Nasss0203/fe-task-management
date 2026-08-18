import { AppProviders } from "@/providers/providers";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/shared/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { JetBrains_Mono, Montserrat } from "next/font/google";
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
	description:
		"The optimal solution for collaborative tasks across diverse functions.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			suppressHydrationWarning
			className={`${montserrat.variable} ${jetbrainsMono.variable}`}
		>
			<body className='font-sans antialiased'>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<AppProviders>{children}</AppProviders>
					<Toaster position='top-right' />
					<SpeedInsights />
				</ThemeProvider>
			</body>
		</html>
	);
}
