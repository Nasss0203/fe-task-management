"use client";

import { useSettingsDialog } from "@/features/workspace-settings/model/use-settings-dialog";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";

import { useBillingDialog } from "../model/use-billing-dialog";
import { usePlanLimitDialog } from "../model/use-plan-limit-dialog";

export function PlanLimitDialog() {
	const notice = usePlanLimitDialog((state) => state.notice);
	const close = usePlanLimitDialog((state) => state.close);

	if (!notice) return null;

	const runAction = () => {
		close();
		if (notice.action === "upgrade") {
			useBillingDialog.getState().setOpen(true);
		} else if (notice.action === "manage-storage") {
			const settings = useSettingsDialog.getState();
			settings.setSection("storage");
			settings.setOpen(true);
		}
	};

	return (
		<Dialog open onOpenChange={(open) => !open && close()}>
			<DialogContent className='gap-6 sm:max-w-[420px]'>
				<DialogHeader className='text-left'>
					<DialogTitle className='text-base'>{notice.title}</DialogTitle>
					<DialogDescription className='leading-6'>{notice.description}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					{notice.action ? (
						<>
							<Button type='button' variant='ghost' onClick={close}>
								Not now
							</Button>
							<Button type='button' onClick={runAction}>
								{notice.actionLabel}
							</Button>
						</>
					) : (
						<Button type='button' onClick={close}>
							Got it
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
