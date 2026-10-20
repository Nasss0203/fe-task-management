"use client";

import { FileText } from "lucide-react";

import type { ReactNode } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

interface EntityEditorDialogProps {
	open: boolean;

	onOpenChange: (open: boolean) => void;

	title: string;

	breadcrumbLabel?: string;

	icon?: ReactNode;

	location?: ReactNode;

	children: ReactNode;

	headerActions?: ReactNode;
}

export function EntityEditorDialog({
	open,
	onOpenChange,
	title,
	breadcrumbLabel,
	icon,
	location,
	children,
	headerActions,
}: EntityEditorDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className='
                    flex
                    h-[min(680px,calc(100vh-64px))]
                    w-[calc(100vw-64px)]
                    max-w-[1000px]
                    flex-col
                    gap-0
                    overflow-hidden
                    rounded-xl
                    border
                    bg-background
                    p-0
                    shadow-2xl
                    sm:max-w-[1000px]
                '
			>
				<DialogHeader className='sr-only'>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>

				<header className='flex h-12 shrink-0 items-center justify-between gap-2 px-4'>
					<div className='flex min-w-0 items-center gap-2'>
						{location ?? (
							<>
								{icon ?? (
									<FileText className='size-4 shrink-0 text-muted-foreground' />
								)}

								<span className='truncate text-sm font-medium'>
									{breadcrumbLabel ?? title}
								</span>
							</>
						)}
					</div>

					{headerActions && (
						<div className='flex shrink-0 items-center gap-1'>
							{headerActions}
						</div>
					)}
				</header>

				<div className='min-h-0 flex-1 overflow-y-auto'>
					<main
						className='
                            mx-auto
                            w-full
                            max-w-[720px]
                            px-8
                            pb-24
                            pt-20
                        '
					>
						{children}
					</main>
				</div>
			</DialogContent>
		</Dialog>
	);
}
