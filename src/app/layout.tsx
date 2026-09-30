import { AppProviders } from "@/providers/providers";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/shared/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
	variable: "--font-geist-sans", // Giữ nguyên tên biến để không ảnh hưởng tailwind config
	subsets: ["latin", "vietnamese"],
	weight: ["300", "400", "500", "700"],
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
			className={`${roboto.variable} `}
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
