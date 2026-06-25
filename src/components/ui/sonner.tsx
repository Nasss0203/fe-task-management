"use client";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className='toaster group'
			icons={{
				success: <CircleCheckIcon className='size-4' />,
				info: <InfoIcon className='size-4' />,
				warning: <TriangleAlertIcon className='size-4' />,
				error: <OctagonXIcon className='size-4' />,
				loading: <Loader2Icon className='size-4 animate-spin' />,
			}}
			style={{ "--border-radius": "var(--radius)" } as CSSProperties}
			toastOptions={{
				classNames: {
					toast: "border border-border bg-card text-card-foreground shadow-lg",
					success: "border-success/25! [&_[data-icon]]:text-success!",
					error: "border-danger/25! [&_[data-icon]]:text-danger!",
					warning: "border-warning/25! [&_[data-icon]]:text-warning!",
					info: "border-info/25! [&_[data-icon]]:text-info!",
					description: "text-[13px]! text-muted-foreground!",
					actionButton:
						"rounded-md! border! border-border! bg-background/75! px-3! py-1! text-[12px]! font-semibold! text-foreground! transition-colors hover:bg-accent! hover:text-accent-foreground!",
					cancelButton:
						"rounded-md! px-2! py-1! text-[12px]! text-muted-foreground! hover:text-foreground!",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
