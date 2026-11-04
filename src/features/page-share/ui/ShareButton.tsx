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

import type { PageShareMember } from "@/entities/page-share/model/page-share.types";

import { PagePublishTab } from "@/features/page-publish/ui/PagePublishTab";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Tabs, TabsContent } from "@/shared/ui/tabs";

import { GeneralAccessSection } from "./GeneralAccessSection";
import { PeopleWithAccess } from "./PeopleWithAccess";
import { ShareInviteForm } from "./ShareInviteForm";
import { SharePopoverFooter } from "./SharePopoverFooter";
import { SharePopoverHeader } from "./SharePopoverHeader";

const emptyShares: PageShareMember[] = [];

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

	const canPublish = pageAccess?.canPublish ?? false;

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
					className='flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
				>
					<SquareArrowOutUpRight className='size-3.5' />
					Share
				</button>
			</PopoverTrigger>

			<PopoverContent
				align='end'
				side='bottom'
				sideOffset={8}
				className='w-[calc(100vw-2rem)] overflow-visible rounded-[12px] border-border bg-popover p-0 text-foreground shadow-[0_8px_24px_-6px_rgba(0,0,0,0.14)] sm:w-[440px]'
			>
				<Tabs defaultValue='share' className='gap-0'>
					<SharePopoverHeader showPublish={canPublish} />

					<TabsContent value='share'>
						<div className='space-y-3.5 p-4'>
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
					</TabsContent>

					{canPublish && (
						<TabsContent value='publish'>
							<PagePublishTab pageId={pageId} />
						</TabsContent>
					)}
				</Tabs>
			</PopoverContent>
		</Popover>
	);
}
