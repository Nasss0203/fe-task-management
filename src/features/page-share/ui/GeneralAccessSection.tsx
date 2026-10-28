"use client";

import { Link2, LockKeyhole, Users } from "lucide-react";

import {
	AccessLevelMenu,
	type AccessLevel,
} from "@/entities/access/ui/AccessLevelMenu";

import type {
	PageShareAccessLevel,
	PageShareLinkAccessLevel,
	PageShareSetting,
	UpdatePageShareSettingPayload,
} from "@/entities/page-share/model/page-share.types";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

type GeneralAccessChoice = "RESTRICTED" | "WORKSPACE" | "LINK";

interface GeneralAccessSectionProps {
	setting?: PageShareSetting;

	canManage: boolean;

	isPending: boolean;

	isError: boolean;

	isUpdating: boolean;

	isUpdateError: boolean;

	onUpdate: (payload: UpdatePageShareSettingPayload) => void;
}

const selectStyle = "border-border bg-popover text-popover-foreground";

const menuLevel: Record<PageShareAccessLevel, AccessLevel> = {
	VIEWER: "view",
	COMMENTER: "comment",
	EDITOR: "edit",
	FULL_ACCESS: "full",
};

const apiLevel: Record<AccessLevel, PageShareAccessLevel> = {
	view: "VIEWER",
	comment: "COMMENTER",
	edit: "EDITOR",
	full: "FULL_ACCESS",
};

const linkApiLevel: Record<"view" | "edit", PageShareLinkAccessLevel> = {
	view: "VIEWER",
	edit: "EDITOR",
};

const accessLabel: Record<PageShareAccessLevel, string> = {
	VIEWER: "Can view",
	COMMENTER: "Can comment",
	EDITOR: "Can edit",
	FULL_ACCESS: "Full access",
};

export function GeneralAccessSection({
	setting,
	canManage,
	isPending,
	isError,
	isUpdating,
	isUpdateError,
	onUpdate,
}: GeneralAccessSectionProps) {
	const workspaceEnabled = setting?.workspaceAccessLevel != null;

	const linkEnabled = setting?.linkAccessLevel != null;

	const generalAccess: GeneralAccessChoice = linkEnabled
		? "LINK"
		: workspaceEnabled
			? "WORKSPACE"
			: "RESTRICTED";

	const handleGeneralAccessChange = (value: string) => {
		if (!canManage || isUpdating || value === generalAccess) {
			return;
		}

		const nextValue = value as GeneralAccessChoice;

		if (nextValue === "RESTRICTED") {
			onUpdate({
				workspace_access_level: null,
				link_access_level: null,
			});

			return;
		}

		if (nextValue === "WORKSPACE") {
			onUpdate({
				workspace_access_level:
					setting?.workspaceAccessLevel ?? "VIEWER",

				link_access_level: null,
			});

			return;
		}

		if (nextValue === "LINK") {
			onUpdate({
				workspace_access_level: null,

				link_access_level: setting?.linkAccessLevel ?? "VIEWER",
			});
		}
	};

	const icon =
		generalAccess === "LINK" ? (
			<Link2 className='size-3.5' />
		) : generalAccess === "WORKSPACE" ? (
			<Users className='size-3.5' />
		) : (
			<LockKeyhole className='size-3.5' />
		);

	return (
		<section className='space-y-2'>
			<h2 className='text-[11px] font-semibold text-muted-foreground'>
				General access
			</h2>

			{isPending ? (
				<p className='text-xs text-muted-foreground'>
					Loading general access...
				</p>
			) : isError ? (
				<p className='text-xs text-red-400'>
					Unable to load general access.
				</p>
			) : (
				<>
					<div className='flex min-w-0 items-center gap-2.5'>
						<div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
							{icon}
						</div>

						<div className='min-w-0 flex-1'>
							<Select
								value={generalAccess}
								disabled={!canManage || isUpdating}
								onValueChange={handleGeneralAccessChange}
							>
								<SelectTrigger
									size='sm'
									aria-label='General access'
									className='max-w-full min-w-0 border-0 bg-transparent px-1 text-xs text-foreground'
								>
									<SelectValue />
								</SelectTrigger>

								<SelectContent className={selectStyle}>
									<SelectItem value='RESTRICTED'>
										Only people invited
									</SelectItem>

									<SelectItem value='WORKSPACE'>
										Everyone in workspace
									</SelectItem>

									<SelectItem value='LINK'>
										Anyone with the link
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Everyone in workspace */}
						{generalAccess === "WORKSPACE" &&
							setting?.workspaceAccessLevel && (
								<div className='ml-auto shrink-0 text-xs text-muted-foreground'>
									{canManage ? (
										<AccessLevelMenu
											currentLevel={
												menuLevel[
													setting.workspaceAccessLevel
												]
											}
											allowedLevels={[
												"view",
												"comment",
												"edit",
												"full",
											]}
											disabled={isUpdating}
											onChange={(level) => {
												onUpdate({
													workspace_access_level:
														apiLevel[level],
												});
											}}
										/>
									) : (
										<span>
											{
												accessLabel[
													setting.workspaceAccessLevel
												]
											}
										</span>
									)}
								</div>
							)}

						{/* Anyone with the link */}
						{generalAccess === "LINK" &&
							setting?.linkAccessLevel && (
								<div className='ml-auto shrink-0 text-xs text-muted-foreground'>
									{canManage ? (
										<AccessLevelMenu
											currentLevel={
												menuLevel[
													setting.linkAccessLevel
												]
											}
											allowedLevels={["view", "edit"]}
											disabled={isUpdating}
											onChange={(level) => {
												if (
													level !== "view" &&
													level !== "edit"
												) {
													return;
												}

												onUpdate({
													link_access_level:
														linkApiLevel[level],
												});
											}}
										/>
									) : (
										<span>
											{
												accessLabel[
													setting.linkAccessLevel
												]
											}
										</span>
									)}
								</div>
							)}
					</div>

					{isUpdateError && (
						<p role='alert' className='text-xs text-red-400'>
							Unable to update general access.
						</p>
					)}
				</>
			)}
		</section>
	);
}
