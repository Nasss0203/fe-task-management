"use client";

import { X } from "lucide-react";
import * as React from "react";
import { DrawerClose } from "../../ui/drawer";

type TaskDetailHeaderProps = {
	taskLabel: string;
	title?: string | null;
	isUpdating?: boolean;
	onTitleSave?: (title: string) => Promise<void> | void;
};

const getDisplayTitle = (title?: string | null) => title?.trim() || "Untitled";

export function TaskDetailHeader({
	taskLabel,
	title,
	isUpdating = false,
	onTitleSave,
}: TaskDetailHeaderProps) {
	const [isEditing, setIsEditing] = React.useState(false);
	const [draftTitle, setDraftTitle] = React.useState(title ?? "");
	const [currentTitle, setCurrentTitle] = React.useState(title ?? "");
	const inputRef = React.useRef<HTMLInputElement>(null);
	const displayTitle = getDisplayTitle(currentTitle);
	const isUntitled = !currentTitle.trim();

	React.useEffect(() => {
		setCurrentTitle(title ?? "");
		setDraftTitle(title ?? "");
		setIsEditing(false);
	}, [title]);

	React.useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus();
			inputRef.current?.select();
		}
	}, [isEditing]);

	const handleCancel = () => {
		setDraftTitle(currentTitle);
		setIsEditing(false);
	};

	const handleSave = async () => {
		const nextTitle = draftTitle.trim();

		if (nextTitle === currentTitle.trim()) {
			setDraftTitle(currentTitle);
			setIsEditing(false);
			return;
		}

		const previousTitle = currentTitle;
		setCurrentTitle(nextTitle);
		setDraftTitle(nextTitle);
		setIsEditing(false);

		try {
			await onTitleSave?.(nextTitle);
		} catch {
			setCurrentTitle(previousTitle);
			setDraftTitle(previousTitle);
		}
	};

	return (
		<div className='border-b border-border bg-background px-5 py-5 sm:px-6'>
			<div className='flex items-start justify-between gap-4'>
				<div className='min-w-0'>
					<div className='text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
						{taskLabel}
					</div>

					{isEditing ? (
						<input
							ref={inputRef}
							value={draftTitle}
							disabled={isUpdating}
							placeholder='Untitled'
							onChange={(event) =>
								setDraftTitle(event.target.value)
							}
							onBlur={() => {
								void handleSave();
							}}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									event.currentTarget.blur();
								}

								if (event.key === "Escape") {
									event.preventDefault();
									handleCancel();
								}
							}}
							className='mt-3 w-full min-w-0 rounded-md border border-border bg-background px-2 py-1 text-3xl font-bold tracking-tight text-foreground outline-none transition focus:border-blue-500 disabled:opacity-60 sm:text-[2.25rem]'
						/>
					) : (
						<button
							type='button'
							disabled={isUpdating}
							onClick={() => setIsEditing(true)}
							className='mt-3 block max-w-full truncate rounded-md px-1 py-1 text-left text-3xl font-bold tracking-tight text-foreground transition hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[2.25rem]'
						>
							<span
								className={
									isUntitled
										? "italic text-muted-foreground"
										: undefined
								}
							>
								{displayTitle}
							</span>
						</button>
					)}
				</div>

				<div className='flex items-center gap-2'>
					<DrawerClose asChild>
						<button
							type='button'
							aria-label='Close task details'
							className='inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
						>
							<X className='size-4' />
						</button>
					</DrawerClose>
				</div>
			</div>
		</div>
	);
}
