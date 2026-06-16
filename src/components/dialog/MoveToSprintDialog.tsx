"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSprints } from "@/features/sprint/hooks/useSprint";
import { useState } from "react";

type MoveToSprintDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	workspaceId: string;
	projectId: string;
	onConfirm: (sprintId: string) => Promise<void> | void;
	isPending?: boolean;
};

export default function MoveToSprintDialog({
	open,
	onOpenChange,
	workspaceId,
	projectId,
	onConfirm,
	isPending,
}: MoveToSprintDialogProps) {
	const { sprintsQuery } = useSprints({ workspaceId, projectId });
	const [selectedSprintId, setSelectedSprintId] = useState<string>("");

	// Filter to only show sprints that are not completed
	const availableSprints = (sprintsQuery.data?.data || []).filter(
		(sprint: any) => sprint.status !== "COMPLETED"
	);

	const handleConfirm = async () => {
		if (!selectedSprintId) return;
		await onConfirm(selectedSprintId);
		setSelectedSprintId("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>Thêm vào sprint</DialogTitle>
				</DialogHeader>
				
				<div className="flex flex-col gap-4 py-4">
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium">Chọn sprint</label>
						<Select
							value={selectedSprintId}
							onValueChange={setSelectedSprintId}
							disabled={isPending || sprintsQuery.isLoading}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn sprint..." />
							</SelectTrigger>
							<SelectContent>
								{availableSprints.length === 0 && (
									<div className="p-2 text-sm text-muted-foreground text-center">
										Không có sprint khả dụng
									</div>
								)}
								{availableSprints.map((sprint: any) => (
									<SelectItem key={sprint.id} value={sprint.id}>
										{sprint.name} {sprint.status === "ACTIVE" ? "(Đang chạy)" : ""}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isPending}
					>
						Hủy
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={!selectedSprintId || isPending}
					>
						{isPending ? "Đang xử lý..." : "Xác nhận"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
