import { AppProviders } from "@/providers/providers";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/shared/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin", "vietnamese"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Taskmanly - The connected workspace",
	description:
		"Docs, databases, tasks & AI in one unified workspace.",
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
			className={inter.variable}
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
