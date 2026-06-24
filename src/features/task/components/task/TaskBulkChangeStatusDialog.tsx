"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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

type TaskStatusItem = {
	id: string;
	name: string;
};

type TaskBulkChangeStatusDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	taskIds: string[];
	taskStatus: TaskStatusItem[];
	isPending?: boolean;
	onSubmit: (data: {
		taskIds: string[];
		statusId: string;
		sendNotification: boolean;
	}) => void;
};

export function TaskBulkChangeStatusDialog({
	open,
	onOpenChange,
	taskIds,
	taskStatus,
	isPending = false,
	onSubmit,
}: TaskBulkChangeStatusDialogProps) {
	const [statusId, setStatusId] = useState<string>("");
	const [sendNotification, setSendNotification] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const hasError = submitted && !statusId;

	const handleSubmit = () => {
		setSubmitted(true);

		if (!statusId) return;

		onSubmit({
			taskIds,
			statusId,
			sendNotification,
		});
	};

	const handleCancel = () => {
		setStatusId("");
		setSendNotification(false);
		setSubmitted(false);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[360px]'>
				<DialogHeader>
					<DialogTitle>Change status</DialogTitle>
				</DialogHeader>

				<div className='flex flex-col gap-4'>
					<div className='flex flex-col gap-2'>
						<Select value={statusId} onValueChange={setStatusId}>
							<SelectTrigger
								className={`h-9 w-full ${hasError ? "border-destructive text-destructive focus:ring-destructive" : ""
									}`}
							>
								<SelectValue placeholder='Select status' />
							</SelectTrigger>

							<SelectContent className='z-[60]'>
								{taskStatus.map((item) => (
									<SelectItem value={item.id} key={item.id}>
										{item.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{hasError && (
							<div className='flex items-center gap-1.5 text-xs text-destructive'>
								<AlertCircle className='h-3.5 w-3.5' />
								<p>This field is required</p>
							</div>
						)}
					</div>

					<label className='flex items-start gap-2 text-sm text-muted-foreground'>
						<Checkbox
							className='mt-0.5'
							checked={sendNotification}
							onCheckedChange={(checked) =>
								setSendNotification(checked === true)
							}
						/>
						<span className='leading-snug'>
							Send a notification for work items that are affected
							by this bulk action.
						</span>
					</label>

					<div className='flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={handleCancel}
							disabled={isPending}
						>
							Cancel
						</Button>

						<Button
							type='button'
							onClick={handleSubmit}
							disabled={isPending || taskIds.length === 0}
						>
							Submit
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
