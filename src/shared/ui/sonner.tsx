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

const toastClassNames = {
	toast:
		"w-[360px]! rounded-md! border! border-border! bg-card! px-4! py-3! text-card-foreground! shadow-[0_14px_34px_rgba(15,23,42,0.18)]! dark:border-white/10! dark:bg-[#111318]! dark:shadow-[0_16px_36px_rgba(0,0,0,0.45)]!",
	title: "text-sm! font-semibold! text-foreground!",
	description: "mt-1! text-[13px]! leading-5! text-muted-foreground!",
	icon: "mt-0.5! size-4!",
	closeButton:
		"left-auto! right-2.5! top-2.5! size-6! transform-none! rounded-full! border-0! bg-transparent! p-0! text-muted-foreground! opacity-70! shadow-none! transition-colors hover:bg-muted! hover:text-foreground! hover:opacity-100! [&>svg]:size-3.5!",
	success: "[&_[data-icon]]:text-success!",
	error: "[&_[data-icon]]:text-danger!",
	warning: "[&_[data-icon]]:text-warning!",
	info: "[&_[data-icon]]:text-info!",
	actionButton:
		"rounded-md! border! border-primary! bg-primary! px-3! py-1.5! text-[12px]! font-semibold! text-primary-foreground! transition-colors hover:bg-primary/90!",
	cancelButton:
		"rounded-md! border! border-border! bg-background! px-3! py-1.5! text-[12px]! font-semibold! text-foreground! transition-colors hover:bg-accent! hover:text-accent-foreground!",
};

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
			closeButton
			style={{ "--border-radius": "0.5rem" } as CSSProperties}
			toastOptions={{
				classNames: toastClassNames,
			}}
			{...props}
		/>
	);
};

export { Toaster };
