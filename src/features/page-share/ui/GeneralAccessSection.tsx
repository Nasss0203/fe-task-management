"use client";

import { Link2, LockKeyhole } from "lucide-react";

import {
	AccessLevelMenu,
	type AccessLevel,
} from "@/entities/access/ui/AccessLevelMenu";

import type {
	PageShareAccessLevel,
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

type GeneralAccessChoice = "RESTRICTED" | "LINK";

interface GeneralAccessSectionProps {
	setting?: PageShareSetting;
	canManage: boolean;

	isPending: boolean;
	isError: boolean;

	isUpdating: boolean;
	isUpdateError: boolean;

	onUpdate: (payload: UpdatePageShareSettingPayload) => void;
}

const selectStyle = "border-[#414141] bg-[#2b2b2b] text-white";

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
	const linkEnabled = setting?.linkAccessLevel != null;

	const generalAccess: GeneralAccessChoice = linkEnabled
		? "LINK"
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

		if (nextValue === "LINK") {
			onUpdate({
				workspace_access_level: null,

				link_access_level: setting?.linkAccessLevel ?? "VIEWER",
			});
		}
	};

	return (
		<section className='space-y-2'>
			<h2 className='text-[11px] font-semibold text-[#aaa]'>
				General access
			</h2>

			{isPending ? (
				<p className='text-xs text-[#8f8f8f]'>
					Loading general access...
				</p>
			) : isError ? (
				<p className='text-xs text-red-400'>
					Unable to load general access.
				</p>
			) : (
				<>
					<div className='flex min-w-0 items-center gap-2.5'>
						<div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#3b3b3b] text-[#aaa]'>
							{linkEnabled ? (
								<Link2 className='size-3.5' />
							) : (
								<LockKeyhole className='size-3.5' />
							)}
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
									className='max-w-full min-w-0 border-0 bg-transparent px-1 text-xs text-[#e6e6e6]'
								>
									<SelectValue />
								</SelectTrigger>

								<SelectContent className={selectStyle}>
									<SelectItem value='RESTRICTED'>
										Only people invited
									</SelectItem>

									<SelectItem value='LINK'>
										Anyone with the link
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{setting?.linkAccessLevel && (
							<div className='ml-auto shrink-0 text-xs text-[#aaa]'>
								{canManage ? (
									<AccessLevelMenu
										currentLevel={
											menuLevel[setting.linkAccessLevel]
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
												link_access_level: apiLevel[level],
											});
										}}
									/>
								) : (
									<span>
										{accessLabel[setting.linkAccessLevel]}
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
