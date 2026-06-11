"use client";

import { Check, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useProjectSelectionStore } from "@/stores/use-project-selection";

interface DialogUpgradePlanProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DialogUpgradePlan({ open, onOpenChange }: DialogUpgradePlanProps) {
	const router = useRouter();
	const { currentWorkspaceId } = useProjectSelectionStore();

	const upgradeHref = currentWorkspaceId
		? `/dashboard/billing/upgrade?workspaceId=${currentWorkspaceId}`
		: "/dashboard/billing/upgrade";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Crown className="w-5 h-5 text-yellow-500" />
						Nâng cấp gói cước
					</DialogTitle>
					<DialogDescription>
						Bạn đã đạt giới hạn của gói hiện tại. Nâng cấp lên gói Pro để mở khóa không giới hạn:
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-between flex-row">
					<Button variant="ghost" onClick={() => onOpenChange(false)}>
						Để sau
					</Button>
					<Button
						onClick={() => {
							onOpenChange(false);
							router.push(upgradeHref);
						}}
						className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
					>
						Nâng cấp ngay
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
