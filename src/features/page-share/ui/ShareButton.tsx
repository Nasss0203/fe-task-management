"use client";

import { SquareArrowOutUpRight } from "lucide-react";

import {
	useUpdatePageShareAccess,
	useUpdatePageShareSetting,
} from "@/entities/page-share/model/page-share.mutations";

import {
	usePageAccess,
	usePageShares,
	usePageShareSetting,
} from "@/entities/page-share/model/page-share.queries";

import type {
	PageShareCandidate,
	PageShareMember,
} from "@/entities/page-share/model/page-share.types";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { GeneralAccessSection } from "./GeneralAccessSection";
import { PeopleWithAccess } from "./PeopleWithAccess";
import { ShareInviteForm } from "./ShareInviteForm";
import { SharePopoverFooter } from "./SharePopoverFooter";
import { SharePopoverHeader } from "./SharePopoverHeader";

/**
 * Mapping giữa access level của backend
 * và AccessLevelMenu trên frontend.
 */

const selectStyle = "border-[#414141] bg-[#2b2b2b] text-white";

const emptyShares: PageShareMember[] = [];

const userName = (user: PageShareCandidate) =>
	user.displayName?.trim() || user.username?.trim() || user.email;

interface ShareButtonProps {
	pageId: string;
}

export default function ShareButton({ pageId }: ShareButtonProps) {
	const { data: pageAccess, isError: isAccessError } = usePageAccess(pageId);

	const effectiveAccessLevel = pageAccess?.effectiveAccessLevel ?? null;

	const canReadShares =
		effectiveAccessLevel === "EDITOR" ||
		effectiveAccessLevel === "FULL_ACCESS";

	const canAddShares = canReadShares;

	const canManageShares = effectiveAccessLevel === "FULL_ACCESS";

	const {
		data: pageShares = emptyShares,
		isPending: isSharesPending,
		isError: isSharesError,
	} = usePageShares(pageId, canReadShares);

	const {
		data: shareSetting,
		isPending: isSettingPending,
		isError: isSettingError,
	} = usePageShareSetting(pageId, canReadShares);

	const updateShareAccess = useUpdatePageShareAccess(pageId);

	const updateSetting = useUpdatePageShareSetting(pageId);

	/**
	 * VIEWER / COMMENTER
	 * không có PAGE_SHARE_READ.
	 */
	if (!canReadShares) {
		return isAccessError ? (
			<span className='text-xs text-red-400'>Sharing unavailable</span>
		) : null;
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type='button'
					className='flex cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-2 py-1.5 text-xs text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900 hover:text-white'
				>
					<SquareArrowOutUpRight className='size-3.5' />
					Share
				</button>
			</PopoverTrigger>

			<PopoverContent
				align='end'
				side='bottom'
				sideOffset={8}
				className='w-[calc(100vw-2rem)] overflow-visible rounded-xl border-[#3d3d3d] bg-[#252525] p-0 text-[#f1f1f1] shadow-xl sm:w-[500px]'
			>
				{/* Header */}
				<SharePopoverHeader />

				<div className='space-y-4 px-4 py-4'>
					{/* Direct Share */}
					<ShareInviteForm
						pageId={pageId}
						shares={pageShares}
						canAdd={canAddShares}
						canGrantFullAccess={canManageShares}
					/>

					{/* People with access */}
					<PeopleWithAccess
						shares={pageShares}
						effectiveAccessLevel={effectiveAccessLevel}
						canManage={canManageShares}
						isPending={isSharesPending}
						isError={isSharesError}
						isUpdating={updateShareAccess.isPending}
						isUpdateError={updateShareAccess.isError}
						onChangeAccess={(shareId, accessLevel) => {
							updateShareAccess.mutate({
								shareId,
								accessLevel,
							});
						}}
					/>
					{/* General Access */}
					<GeneralAccessSection
						setting={shareSetting}
						canManage={canManageShares}
						isPending={isSettingPending}
						isError={isSettingError}
						isUpdating={updateSetting.isPending}
						isUpdateError={updateSetting.isError}
						onUpdate={(payload) => {
							updateSetting.mutate(payload);
						}}
					/>
				</div>

				{/* Footer */}
				<SharePopoverFooter pageId={pageId} />
			</PopoverContent>
		</Popover>
	);
}
