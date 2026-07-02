"use client";

import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { useWorkspaceNameDraftStore } from "@/stores/use-workspace-name-draft";
import { Share2, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WorkspaceMenu } from "./WorkspaceMenu";
import { toast } from "sonner";

type WorkspaceTopHeaderProps = {
	workspaceName?: string;
	workspaceId: string;
};

export const WorkspaceTopHeader = ({
	workspaceName = "Task management",
	workspaceId,
}: WorkspaceTopHeaderProps) => {
	const { updateWorkspace } = useWorkspace();
	const [isEditingName, setIsEditingName] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const skipBlurRef = useRef(false);
	const ignoreBlurUntilRef = useRef(0);
	const isNameComposingRef = useRef(false);
	const draftName = useWorkspaceNameDraftStore(
		(state) => state.drafts[workspaceId],
	);
	const setDraft = useWorkspaceNameDraftStore((state) => state.setDraft);
	const clearDraft = useWorkspaceNameDraftStore((state) => state.clearDraft);
	const value = draftName ?? workspaceName;
	const workspaceInitial = value.trim().charAt(0).toUpperCase() || "W";

	useEffect(() => {
		if (!isEditingName) return;

		const frame = window.requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		});

		return () => window.cancelAnimationFrame(frame);
	}, [isEditingName]);

	const startEditingName = () => {
		skipBlurRef.current = false;
		ignoreBlurUntilRef.current = Date.now() + 250;
		setDraft(workspaceId, value);
		setIsEditingName(true);
	};

	const cancelEditingName = () => {
		skipBlurRef.current = true;
		setDraft(workspaceId, workspaceName);
		setIsEditingName(false);
	};

	const commitName = async () => {
		const name = value.trim();

		if (!name) {
			toast.error("Ten workspace khong duoc de trong.");
			setDraft(workspaceId, workspaceName);
			inputRef.current?.focus();
			return;
		}

		if (name === workspaceName) {
			clearDraft(workspaceId);
			setIsEditingName(false);
			return;
		}

		try {
			await updateWorkspace.mutateAsync({
				workspaceId,
				data: {
					name,
				},
			});
			clearDraft(workspaceId);
			setIsEditingName(false);
			toast.success("Workspace da duoc doi ten.");
		} catch (error) {
			console.error("renameWorkspaceFromHeader failed", error);
			toast.error("Khong the doi ten workspace.");
		}
	};

	return (
		<div className='shrink-0 pt-4'>
			<div className='mb-3 flex items-center justify-between'>
				<div className='flex flex-col gap-2'>
					<div className='text-sm text-muted-foreground'>
						Workspaces
					</div>

					<div className='flex items-center gap-2'>
						<div className='flex size-6 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white'>
							{workspaceInitial}
						</div>

						{isEditingName ? (
							<input
								ref={inputRef}
								value={value}
								disabled={updateWorkspace.isPending}
								onChange={(event) =>
									setDraft(workspaceId, event.target.value)
								}
								onCompositionStart={() => {
									isNameComposingRef.current = true;
								}}
								onCompositionEnd={(event) => {
									isNameComposingRef.current = false;
									setDraft(workspaceId, event.currentTarget.value);
								}}
								onBlur={() => {
									if (isNameComposingRef.current) {
										return;
									}

									if (Date.now() < ignoreBlurUntilRef.current) {
										window.requestAnimationFrame(() => {
											inputRef.current?.focus();
										});
										return;
									}

									if (skipBlurRef.current) {
										skipBlurRef.current = false;
										return;
									}

									void commitName();
								}}
								onKeyDown={(event) => {
									if (
										event.nativeEvent.isComposing ||
										isNameComposingRef.current
									) {
										return;
									}

									if (event.key === "Enter") {
										event.preventDefault();
										event.currentTarget.blur();
									}

									if (event.key === "Escape") {
										event.preventDefault();
										cancelEditingName();
									}
								}}
								className='min-w-0 max-w-[min(560px,60vw)] rounded border border-blue-500/60 bg-background px-1 text-2xl font-semibold text-foreground outline-none ring-2 ring-blue-500/20'
							/>
						) : (
							<h1 className='min-w-0 max-w-[min(560px,60vw)] truncate px-1 text-2xl font-semibold text-foreground'>
								{value}
							</h1>
						)}

						<WorkspaceMenu
							workspaceId={workspaceId}
							workspaceName={value}
							onStartRename={startEditingName}
						></WorkspaceMenu>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<button className='rounded-md border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground'>
						<Share2 size={16} />
					</button>

					<button className='rounded-md border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground'>
						<Zap size={16} />
					</button>
				</div>
			</div>
		</div>
	);
};
