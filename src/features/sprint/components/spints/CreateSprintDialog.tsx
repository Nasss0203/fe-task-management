"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateSprintDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	workspaceId: string;
	projectId: string;
	selectedTaskIds?: string[];
	selectedCount?: number;
	onSuccess?: () => void;
};

export function CreateSprintDialog({
	open,
	onOpenChange,
	workspaceId,
	projectId,
	selectedTaskIds = [],
	selectedCount = 0,
	onSuccess,
}: CreateSprintDialogProps) {
	const [name, setName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!name.trim()) return;

		try {
			setIsSubmitting(true);

			// 1. gọi API create sprint
			// const sprint = await createSprintApi(...)

			// 2. nếu có selected task thì move vào sprint vừa tạo
			// if (selectedTaskIds.length > 0) {
			// 	await moveTasksToSprintApi({
			// 		workspaceId,
			// 		projectId,
			// 		sprintId: sprint.data.id,
			// 		taskIds: selectedTaskIds,
			// 	});
			// }

			onSuccess?.();
			onOpenChange(false);
			setName("");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Tạo sprint</DialogTitle>
					</DialogHeader>

				<div className='space-y-4'>
					<div className='space-y-2'>
						<Label>Tên sprint</Label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='Sprint 1'
						/>
					</div>

					{selectedCount > 0 && (
						<div className='rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground'>
							Sprint này sẽ thêm{" "}
							<span className='font-medium text-foreground'>
								{selectedCount}
							</span>{" "}
							task đã chọn.
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
					>
						Hủy bỏ
					</Button>

					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || !name.trim()}
					>
						{isSubmitting ? "Đang tạo..." : "Tạo sprint"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
