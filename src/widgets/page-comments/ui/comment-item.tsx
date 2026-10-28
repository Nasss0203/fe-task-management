"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import type { Comment } from "@/entities/comment/model/comment.types";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

import { CommentComposer } from "./comment-composer";

interface CommentItemProps {
	comment: Comment;
	isOwn: boolean;
	onEdit: (body: string) => Promise<unknown>;
	onDelete: () => void;
	/** Có thì hiện nút Reply cạnh thời gian khi hover (chỉ comment gốc). */
	onReply?: () => void;
}

export function CommentItem({
	comment,
	isOwn,
	onEdit,
	onDelete,
	onReply,
}: CommentItemProps) {
	const [editing, setEditing] = useState(false);

	const name = comment.author?.username ?? "Deleted user";

	return (
		<div className='group/comment flex gap-2.5'>
			<Avatar className='mt-0.5 size-6 shrink-0'>
				<AvatarFallback className='bg-primary/15 text-[11px] font-medium text-primary'>
					{name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>

			<div className='min-w-0 flex-1'>
				<div className='flex items-center gap-2'>
					<span className='truncate text-sm font-medium'>{name}</span>

					<span className='shrink-0 text-xs text-muted-foreground'>
						{formatRelativeTime(comment.created_at)}
						{comment.edited_at && " · edited"}
					</span>

					{onReply && !editing && (
						<button
							type='button'
							onClick={onReply}
							className='rounded px-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/comment:opacity-100 [@media(hover:none)]:opacity-100'
						>
							Reply
						</button>
					)}

					{isOwn && !editing && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									type='button'
									variant='ghost'
									size='icon'
									aria-label='Comment actions'
									className='ml-auto size-6 opacity-0 transition-opacity group-hover/comment:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100'
								>
									<MoreHorizontal className='size-3.5' />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align='end' className='w-36'>
								<DropdownMenuItem onSelect={() => setEditing(true)}>
									<Pencil className='size-3.5' />
									Edit
								</DropdownMenuItem>

								<DropdownMenuItem
									variant='destructive'
									onSelect={onDelete}
								>
									<Trash2 className='size-3.5' />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>

				{editing ? (
					<CommentComposer
						className='mt-1.5'
						autoFocus
						initialValue={comment.body}
						placeholder='Edit comment'
						submitLabel='Save'
						onCancel={() => setEditing(false)}
						onSubmit={async (body) => {
							await onEdit(body);
							setEditing(false);
						}}
					/>
				) : (
					<p className='whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90'>
						{comment.body}
					</p>
				)}
			</div>
		</div>
	);
}
