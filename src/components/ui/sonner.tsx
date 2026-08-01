"use client";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const isAdminPath = (pathname: string | null) =>
	pathname === "/admin" || pathname?.startsWith("/admin/");

const defaultToastClassNames = {
	toast:
		"w-[360px]! rounded-md! border! border-border! bg-card! px-4! py-3! text-card-foreground! shadow-[0_14px_34px_rgba(15,23,42,0.18)]! dark:border-white/10! dark:bg-[#111318]! dark:shadow-[0_16px_36px_rgba(0,0,0,0.45)]!",
	title: "text-sm! font-semibold! text-foreground!",
	description:
		"mt-1! text-[13px]! leading-5! text-muted-foreground!",
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

const adminToastClassNames = {
	toast:
		"w-[360px]! rounded-lg! border! border-[#E2E8F0]! bg-white! px-4! py-3! text-[#0F172A]! shadow-[0_18px_38px_rgba(15,23,42,0.16)]!",
	title: "text-sm! font-semibold! text-[#0F172A]!",
	description:
		"mt-1! text-[13px]! leading-5! text-[#475569]!",
	icon: "mt-0.5! size-4!",
	closeButton:
		"left-auto! right-2.5! top-2.5! size-6! transform-none! rounded-full! border-0! bg-transparent! p-0! text-[#64748B]! opacity-70! shadow-none! transition-colors hover:bg-white/70! hover:text-[#0F172A]! hover:opacity-100! [&>svg]:size-3.5!",
	success:
		"border-emerald-200! bg-emerald-50! text-emerald-950! [&_[data-icon]]:text-emerald-600! [&_[data-title]]:text-emerald-950! [&_[data-description]]:text-emerald-700!",
	error:
		"border-rose-200! bg-rose-50! text-rose-950! [&_[data-icon]]:text-rose-600! [&_[data-title]]:text-rose-950! [&_[data-description]]:text-rose-700!",
	warning:
		"border-amber-200! bg-amber-50! text-amber-950! [&_[data-icon]]:text-amber-600! [&_[data-title]]:text-amber-950! [&_[data-description]]:text-amber-700!",
	info:
		"border-sky-200! bg-sky-50! text-sky-950! [&_[data-icon]]:text-sky-600! [&_[data-title]]:text-sky-950! [&_[data-description]]:text-sky-700!",
	actionButton:
		"rounded-md! border! border-[#2563EB]! bg-[#2563EB]! px-3! py-1.5! text-[12px]! font-semibold! text-white! transition-colors hover:bg-[#1D4ED8]!",
	cancelButton:
		"rounded-md! border! border-[#CBD5E1]! bg-white! px-3! py-1.5! text-[12px]! font-semibold! text-[#334155]! transition-colors hover:bg-[#F8FAFC]! hover:text-[#0F172A]!",
};

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();
	const pathname = usePathname();
	const isAdminRoute = isAdminPath(pathname);

	return (
		<Sonner
			theme={
				isAdminRoute ? "light" : (theme as ToasterProps["theme"])
			}
			className={`toaster group${isAdminRoute ? " admin-light-theme" : ""}`}
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
				classNames: {
					...(isAdminRoute
						? adminToastClassNames
						: defaultToastClassNames),
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
