// components/tasks/TaskBulkActionBar.tsx

import {
	ArrowRight,
	CheckCircle2,
	CircleCheck,
	Trash2,
	UserPlus,
	X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "../ui/badge";

type TaskBulkActionBarProps = {
	selectedCount: number;
	totalCount: number;

	onClear: () => void;
	onSelectAll: () => void;
	onMoveToSprint?: () => void;
	onAssign?: () => void;
	onChangeStatus?: () => void;
	onDelete?: () => void;
};

export function TaskBulkActionBar({
	selectedCount,
	totalCount,
	onClear,
	onSelectAll,
	onMoveToSprint,
	onAssign,
	onChangeStatus,
	onDelete,
}: TaskBulkActionBarProps) {
	if (selectedCount <= 0) return null;

	const isAllSelected = selectedCount === totalCount;

	return (
		<div className='fixed inset-x-0 bottom-6 z-50 flex justify-center px-4'>
			<Card className='flex w-full max-w-4xl items-center justify-between gap-3 rounded-2xl border bg-background/95 px-4 py-3 shadow-2xl backdrop-blur'>
				<div className='flex items-center gap-5 justify-between '>
					<span className='text-sm font-medium flex items-center gap-1'>
						<Badge>{selectedCount}</Badge> <span>task đã chọn</span>
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
						onClick={onMoveToSprint}
					>
						<ArrowRight className='size-4' />
						Move sprint
					</Button>

					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={onAssign}
					>
						<UserPlus className='size-4' />
						Assign
					</Button>

					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={onChangeStatus}
					>
						<CheckCircle2 className='size-4' />
						Status
					</Button>

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
	);
}
