"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/shared/ui/tooltip";

interface ThemeToggleProps {
	className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div
				className={cn(
					"h-9 w-9 rounded-xl border border-border/80 bg-background/50 flex items-center justify-center shrink-0",
					className
				)}
				aria-hidden='true'
			/>
		);
	}

	const isDark = resolvedTheme === "dark";
	const label = isDark ? "Switch to light mode" : "Switch to dark mode";

	const toggleTheme = () => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<TooltipProvider delayDuration={150}>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant='outline'
						size='icon'
						onClick={toggleTheme}
						aria-label={label}
						className={cn(
							"h-9 w-9 rounded-xl border-border/80 bg-background/80 hover:bg-muted/70 text-foreground transition-all duration-200 shadow-2xs hover:border-border active:scale-95 shrink-0",
							className
						)}
					>
						{isDark ? (
							<Sun className='h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45' />
						) : (
							<Moon className='h-4 w-4 text-neutral-700 transition-transform duration-200 hover:-rotate-12' />
						)}
						<span className='sr-only'>{label}</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent side='bottom' sideOffset={6} className='text-xs'>
					{label}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default ThemeToggle;
