"use client";

import { cn } from "@/lib/utils";
import { TaskActivityFeed } from "./task-activity-feed";
import { ActivityResponseDto } from "@/services/activity/type";
import {
	AtSign,
	Check,
	Link2,
	MessageSquareText,
	Paperclip,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import type { LocalComment, LocalSubtask } from "./task-detail-types";
import { getInitials } from "./task-detail-utils";

type TaskDetailTabsProps = {
	comments: LocalComment[];
	currentUsername: string;
	currentUserAvatar?: string | null;
	commentDraft: string;
	composerOpen: boolean;
	onComposerFocus: () => void;
	onCommentDraftChange: (value: string) => void;
	onCancelComment: () => void;
	onSaveComment: () => void;
	activities?: ActivityResponseDto[];
	isLoadingActivities?: boolean;
};

function SubtaskCard({ item }: { item: LocalSubtask }) {
	return (
		<div className='rounded-2xl border border-border bg-card px-4 py-4 shadow-xs'>
			<div className='flex items-start gap-3'>
				<div
					className={cn(
						"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
						item.done
							? "border-primary bg-primary text-primary-foreground"
							: "border-input bg-background text-transparent",
					)}
				>
					<Check className='size-3.5' />
				</div>
				<div className='min-w-0 flex-1'>
					<div
						className={cn(
							"text-sm font-semibold text-foreground",
							item.done && "text-muted-foreground line-through",
						)}
					>
						{item.title}
					</div>
					<div className='mt-3 rounded-xl border border-border bg-muted/50 px-3 py-3 text-sm leading-6 text-muted-foreground'>
						{item.note}
					</div>
				</div>
			</div>
		</div>
	);
}

export function TaskDetailTabs({
	comments,
	currentUsername,
	currentUserAvatar,
	commentDraft,
	composerOpen,
	onComposerFocus,
	onCommentDraftChange,
	onCancelComment,
	onSaveComment,
	activities = [],
	isLoadingActivities = false,
}: TaskDetailTabsProps) {
	return (
		<Tabs defaultValue='subtasks' className='gap-0'>
			<TabsList
				variant='line'
				className='w-full justify-start gap-8 rounded-none  p-0 text-muted-foreground'
			>
				<TabsTrigger
					value='subtasks'
					className='h-12 rounded-none px-0 pb-4 pt-3 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-foreground after:bg-foreground'
				>
					Subtasks
				</TabsTrigger>
				<TabsTrigger
					value='comments'
					className='h-12 rounded-none px-0 pb-4 pt-3 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-foreground after:bg-foreground'
				>
					Comments
					<span className='inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground'>
						{comments.length}
					</span>
				</TabsTrigger>
				<TabsTrigger
					value='activities'
					className='h-12 rounded-none px-0 pb-4 pt-3 text-base font-medium data-[state=active]:bg-transparent data-[state=active]:text-foreground after:bg-foreground'
				>
					Activities
					{activities.length > 0 && (
						<span className='ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground'>
							{activities.length}
						</span>
					)}
				</TabsTrigger>
			</TabsList>

			<TabsContent value='subtasks' className='pt-6'></TabsContent>

			<TabsContent value='comments' className='pt-6'>
				<div className='space-y-5'>
					<div className='text-2xl font-bold tracking-tight text-foreground'>
						Comments
					</div>

					{comments.length ? (
						<div className='space-y-4'>
							{comments.map((comment) => (
								<div key={comment.id} className='flex gap-3'>
									<Avatar className='size-10 border border-border'>
										<AvatarImage
											src={
												comment.authorAvatar ??
												undefined
											}
											alt={comment.authorName}
										/>
										<AvatarFallback className='bg-muted text-xs font-semibold text-foreground'>
											{getInitials(comment.authorName)}
										</AvatarFallback>
									</Avatar>

									<div className='min-w-0 flex-1 rounded-2xl border border-border bg-card px-4 py-4 shadow-xs'>
										<div className='flex flex-wrap items-center gap-2 text-sm'>
											<span className='font-semibold text-foreground'>
												{comment.authorName}
											</span>
											<span className='text-muted-foreground'>
												{comment.createdAt}
											</span>
										</div>
										<p className='mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground'>
											{comment.body}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='rounded-2xl border border-dashed border-border bg-card/60 px-4 py-6 text-sm text-muted-foreground'>
							No comments yet. Add one below to preview the
							comment state.
						</div>
					)}

					<div className='flex gap-3'>
						<Avatar className='size-10 border border-border'>
							<AvatarImage
								src={currentUserAvatar ?? undefined}
								alt={currentUsername}
							/>
							<AvatarFallback className='bg-muted text-xs font-semibold text-foreground'>
								{getInitials(currentUsername)}
							</AvatarFallback>
						</Avatar>

						<div className='min-w-0 flex-1 rounded-2xl border border-border bg-card shadow-xs'>
							{composerOpen ? (
								<div className='flex items-center gap-1 border-b border-border px-3 py-2'>
									<Button
										type='button'
										variant='ghost'
										size='icon-xs'
										className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									>
										<Paperclip className='size-3.5' />
									</Button>
									<Button
										type='button'
										variant='ghost'
										size='icon-xs'
										className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									>
										<AtSign className='size-3.5' />
									</Button>
									<Button
										type='button'
										variant='ghost'
										size='icon-xs'
										className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									>
										<Link2 className='size-3.5' />
									</Button>
									<Button
										type='button'
										variant='ghost'
										size='icon-xs'
										className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
									>
										<MessageSquareText className='size-3.5' />
									</Button>
								</div>
							) : null}

							<Textarea
								value={commentDraft}
								onFocus={onComposerFocus}
								onChange={(event) =>
									onCommentDraftChange(event.target.value)
								}
								placeholder='Type a quick update or blocker note here...'
								className='min-h-[120px] resize-none border-0 bg-transparent px-4 py-4 text-sm text-foreground shadow-none focus-visible:ring-0'
							/>

							{composerOpen ? (
								<div className='flex items-center justify-between gap-3 border-t border-border px-4 py-3'>
									<div className='text-xs text-muted-foreground'>
										Comments are still stored locally in the
										UI preview.
									</div>
									<div className='flex items-center gap-2'>
										<Button
											type='button'
											variant='ghost'
											size='sm'
											onClick={onCancelComment}
											className='text-muted-foreground hover:bg-accent hover:text-accent-foreground'
										>
											Cancel
										</Button>
										<Button
											type='button'
											size='sm'
											onClick={onSaveComment}
											disabled={!commentDraft.trim()}
											className='rounded-xl'
										>
											Save
										</Button>
									</div>
								</div>
							) : null}
						</div>
					</div>
				</div>
			</TabsContent>

			<TabsContent value='activities' className='pt-6'>
				<TaskActivityFeed activities={activities} isLoading={isLoadingActivities} />
			</TabsContent>
		</Tabs>
	);
}
