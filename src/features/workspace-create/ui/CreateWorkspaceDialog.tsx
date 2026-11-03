"use client";

import axios from "axios";
import { Check, Loader2, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import {
	useCreateWorkspace,
	useSelectWorkspace,
} from "@/entities/workspace/model/workspace.mutations";
import { useWorkspaceStarters } from "@/entities/workspace/model/workspace.queries";
import type {
	WorkspaceStarter,
	WorkspaceStarterDefinition,
} from "@/entities/workspace/model/workspace.types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Skeleton } from "@/shared/ui/skeleton";

import { StarterPreview } from "./StarterPreview";

interface CreateWorkspaceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({
	open,
	onOpenChange,
}: CreateWorkspaceDialogProps) {
	const router = useRouter();
	const [name, setName] = React.useState("");
	const [starterKey, setStarterKey] = React.useState<WorkspaceStarter>("blank");
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const starters = useWorkspaceStarters(open);
	const createWorkspace = useCreateWorkspace();
	const selectWorkspace = useSelectWorkspace();

	const selectedStarter = starters.data?.find(
		(item) => item.key === starterKey,
	);

	React.useEffect(() => {
		if (!open) return;
		setName("");
		setStarterKey("blank");
		setErrorMessage(null);
	}, [open]);

	const handleCreate = async (event: React.FormEvent) => {
		event.preventDefault();
		if (isSubmitting) return;

		setErrorMessage(null);
		setIsSubmitting(true);

		try {
			const workspace = await createWorkspace.mutateAsync({
				name: name.trim() || undefined,
				starter: starterKey,
			});

			toast.success(`Workspace "${workspace.name}" created.`);
			onOpenChange(false);
			await selectWorkspace.mutateAsync(workspace.id);
			router.push("/dashboard");
		} catch (error: unknown) {
			let message = "Unable to create workspace. Please try again.";
			if (axios.isAxiosError(error)) {
				const data = error.response?.data as
					| { message?: string | string[] }
					| undefined;
				if (data?.message) {
					message = Array.isArray(data.message)
						? data.message.join(", ")
						: data.message;
				}
			}
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => !isSubmitting && onOpenChange(value)}
		>
			<DialogContent className='gap-0 overflow-hidden rounded-xl border bg-background p-0 shadow-[0_24px_56px_-12px_rgba(0,0,0,0.28)] sm:max-w-[960px]'>
				<div className='grid md:h-[600px] md:grid-cols-[340px_1fr]'>
					<form
						onSubmit={handleCreate}
						className='flex min-h-0 flex-col border-border md:border-r'
					>
						<div className='space-y-1 px-6 pb-2 pt-5'>
							<DialogTitle className='text-base font-semibold leading-6'>
								Create a new workspace
							</DialogTitle>
							<DialogDescription className='text-[13px] leading-5 text-muted-foreground'>
								Pick a starting point. You can change everything later.
							</DialogDescription>
						</div>

						<div className='min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4 pt-3'>
							{errorMessage && (
								<div
									role='alert'
									className='rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive'
								>
									{errorMessage}
								</div>
							)}

							<div className='space-y-1.5'>
								<Label htmlFor='workspace-name' className='text-[13px] font-medium leading-5 text-foreground'>
									Workspace name{" "}
									<span className='text-xs font-normal text-faint'>
										(optional)
									</span>
								</Label>
								<Input
									id='workspace-name'
									maxLength={255}
									placeholder={selectedStarter?.defaultName ?? "New workspace"}
									value={name}
									disabled={isSubmitting}
									onChange={(event) => setName(event.target.value)}
									className='h-9 md:text-[13.5px]'
								/>
							</div>

							<div className='space-y-2'>
								<Label className='text-[13px] font-medium leading-5 text-foreground'>Start with</Label>
								<StarterList
									starters={starters.data}
									isPending={starters.isPending}
									isError={starters.isError}
									onRetry={() => starters.refetch()}
									selectedKey={starterKey}
									disabled={isSubmitting}
									onSelect={setStarterKey}
								/>
							</div>
						</div>

						<div className='flex justify-end gap-2 border-t px-6 py-3'>
							<Button
								type='button'
								variant='outline'
								disabled={isSubmitting}
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isSubmitting || !selectedStarter}
							>
								{isSubmitting ? (
									<>
										<Loader2 className='mr-1.5 size-3.5 animate-spin' />
										Creating...
									</>
								) : (
									"Create workspace"
								)}
							</Button>
						</div>
					</form>

					<div className='hidden min-h-0 bg-muted/30 md:flex'>
						{selectedStarter ? (
							<StarterPreview
								key={selectedStarter.key}
								starter={selectedStarter}
								workspaceName={name.trim() || selectedStarter.defaultName}
							/>
						) : (
							<Skeleton className='m-8 flex-1 rounded-xl' />
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function StarterList({
	starters,
	isPending,
	isError,
	onRetry,
	selectedKey,
	disabled,
	onSelect,
}: {
	starters?: WorkspaceStarterDefinition[];
	isPending: boolean;
	isError: boolean;
	onRetry: () => void;
	selectedKey: WorkspaceStarter;
	disabled: boolean;
	onSelect: (key: WorkspaceStarter) => void;
}) {
	if (isPending) {
		return (
			<div className='space-y-2'>
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className='h-[60px] rounded-lg' />
				))}
			</div>
		);
	}

	if (isError || !starters) {
		return (
			<div
				role='alert'
				className='flex flex-col items-start gap-2 text-xs text-muted-foreground'
			>
				Unable to load starters.
				<Button type='button' variant='outline' size='sm' onClick={onRetry}>
					<RotateCw className='size-3.5' />
					Try again
				</Button>
			</div>
		);
	}

	return (
		<div role='radiogroup' aria-label='Start with' className='space-y-2'>
			{starters.map((starter) => {
				const selected = starter.key === selectedKey;

				return (
					<button
						key={starter.key}
						type='button'
						role='radio'
						aria-checked={selected}
						disabled={disabled}
						onClick={() => onSelect(starter.key)}
						className={cn(
							"flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors disabled:opacity-60",
							selected
								? "border-[1.5px] border-ring bg-accent-soft"
								: "border border-border hover:bg-muted/40",
						)}
					>
						<span className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-base'>
							{starter.icon}
						</span>
						<span className='min-w-0 flex-1'>
							<span className='block truncate text-[13.5px] font-medium leading-5 text-foreground'>
								{starter.title}
							</span>
							<span className='line-clamp-2 text-[12.5px] leading-[19px] text-muted-foreground'>
								{starter.description}
							</span>
						</span>
						{selected && <Check className='mt-0.5 size-4 shrink-0 text-ring' />}
					</button>
				);
			})}
		</div>
	);
}
