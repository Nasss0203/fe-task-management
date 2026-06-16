"use client";

import {
	CheckCircle2,
	CircleAlert,
	CircleCheck,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";

type TaskStatusItem = {
	id: string;
	name: string;
};

type SubmitChangeStatusPayload = {
	taskIds: string[];
	statusId: string;
	sendNotification: boolean;
};

type TaskBulkActionBarProps = {
	selectedCount: number;
	totalCount: number;
	selectedTaskIds?: string[];

	taskStatus?: TaskStatusItem[];
	isChangeStatusPending?: boolean;

	onClear: () => void;
	onSelectAll: () => void;
	onMoveToSprint?: () => void;
	onAssign?: () => void;
	onChangeStatus?: () => void;
	onSubmitChangeStatus?: (
		payload: SubmitChangeStatusPayload,
	) => void | Promise<void>;
	onDelete?: () => void;
};

export function TaskBulkActionBar({
	selectedCount,
	totalCount,
	selectedTaskIds = [],
	taskStatus = [],
	isChangeStatusPending = false,
	onClear,
	onSelectAll,
	onMoveToSprint,
	onAssign,
	onChangeStatus,
	onSubmitChangeStatus,
	onDelete,
}: TaskBulkActionBarProps) {
	const [changeStatusOpen, setChangeStatusOpen] = useState(false);
	const [statusId, setStatusId] = useState<string>("");
	const [sendNotification, setSendNotification] = useState(false);

	if (selectedCount <= 0) return null;

	const isAllSelected = selectedCount === totalCount;
	const isStatusRequired = !statusId;

	const handleOpenChangeStatus = () => {
		onChangeStatus?.();
		setChangeStatusOpen(true);
	};

	const handleCloseDialog = () => {
		setChangeStatusOpen(false);
		setStatusId("");
		setSendNotification(false);
	};

	const handleSubmitChangeStatus = async () => {
		if (!statusId || selectedTaskIds.length === 0) return;

		await onSubmitChangeStatus?.({
			taskIds: selectedTaskIds,
			statusId,
			sendNotification,
		});

		handleCloseDialog();
	};

	return (
		<>
			<div className='fixed inset-x-0 bottom-6 z-50 flex justify-center px-4'>
				<Card className='flex w-full max-w-4xl items-center justify-between gap-3 rounded-2xl border bg-background/95 px-4 py-3 shadow-2xl backdrop-blur'>
					<div className='flex items-center justify-between gap-5'>
						<span className='flex items-center gap-1 text-sm font-medium'>
							<Badge>{selectedCount}</Badge>
							<span>task đã chọn</span>
						</span>

						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={onSelectAll}
							disabled={isAllSelected}
						>
							<CircleCheck className='size-4' />
							Chọn tất cả
						</Button>

						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={handleOpenChangeStatus}
						>
							<CheckCircle2 className='size-4' />
							Status
						</Button>

						{onMoveToSprint && (
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={onMoveToSprint}
							>
								Thêm vào sprint
							</Button>
						)}

						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={onDelete}
						>
							<Trash2 className='size-4' />
							Delete
						</Button>

						<Separator orientation='vertical' className='h-6' />

						<Button
							type='button'
							variant='ghost'
							size='icon'
							onClick={onClear}
						>
							<X className='size-4' />
						</Button>
					</div>
				</Card>
			</div>

			<Dialog open={changeStatusOpen} onOpenChange={setChangeStatusOpen}>
				<DialogContent className='sm:max-w-[360px]'>
					<DialogHeader>
						<DialogTitle>Change status</DialogTitle>
					</DialogHeader>

					<div className='flex flex-col gap-4'>
						<div className='flex flex-col gap-2'>
							<Select
								value={statusId}
								onValueChange={setStatusId}
								disabled={isChangeStatusPending}
							>
								<SelectTrigger
									className={
										isStatusRequired
											? "h-9 w-full border-destructive"
											: "h-9 w-full"
									}
								>
									<SelectValue placeholder='Select status' />
								</SelectTrigger>

								<SelectContent className='z-[100]'>
									{taskStatus.map((item) => (
										<SelectItem
											key={item.id}
											value={item.id}
										>
											{item.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{isStatusRequired && (
								<p className='flex items-center gap-1 text-xs text-destructive'>
									<CircleAlert className='size-3.5' />
									This field is required
								</p>
							)}
						</div>

						<label className='flex items-start gap-2 text-sm text-muted-foreground'>
							<Checkbox
								checked={sendNotification}
								onCheckedChange={(checked) =>
									setSendNotification(checked === true)
								}
								disabled={isChangeStatusPending}
							/>

							<span>
								Send a notification for work items that are
								affected by this bulk action.
							</span>
						</label>

						<div className='flex justify-end gap-2'>
							<Button
								type='button'
								variant='outline'
								onClick={handleCloseDialog}
								disabled={isChangeStatusPending}
							>
								Cancel
							</Button>

							<Button
								type='button'
								onClick={handleSubmitChangeStatus}
								disabled={
									isStatusRequired ||
									isChangeStatusPending ||
									selectedTaskIds.length === 0
								}
							>
								{isChangeStatusPending
									? "Submitting..."
									: "Submit"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
