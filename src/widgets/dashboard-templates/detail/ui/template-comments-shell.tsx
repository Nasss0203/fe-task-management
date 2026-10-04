"use client";

import React from "react";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import type { PageTemplate } from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";

interface TemplateCommentsShellProps {
	template: PageTemplate;
}

export function TemplateCommentsShell({ template }: TemplateCommentsShellProps) {
	return (
		<div className='w-full space-y-6'>
			{/* Tab Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-lg font-semibold tracking-tight text-foreground'>
						Comments
					</h2>
					<p className='text-xs text-muted-foreground mt-0.5'>
						Feedback, suggestions, and team discussions about &ldquo;{template.name}&rdquo;.
					</p>
				</div>
				<Badge
					variant='outline'
					className='bg-muted/30 text-muted-foreground border-border/70 text-[11px] gap-1 font-medium'
				>
					<Sparkles className='size-3 text-muted-foreground/70' />
					Design Preview
				</Badge>
			</div>

			{/* Discussion Thread Container */}
			<div className='max-w-4xl space-y-6'>
				{/* Write Comment Box */}
				<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs'>
					<label htmlFor='template-comment-input' className='text-xs font-semibold text-foreground'>
						Leave a comment
					</label>

					<textarea
						id='template-comment-input'
						rows={3}
						disabled
						placeholder='Write a comment, share feedback, or ask a question...'
						className='w-full rounded-xl border border-border/60 bg-muted/15 px-3.5 py-2.5 text-xs text-muted-foreground placeholder:text-muted-foreground/60 shadow-xs focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 resize-none'
					/>

					<div className='flex items-center justify-between pt-1'>
						<span className='text-[11px] text-muted-foreground'>
							Markdown formatting supported when live
						</span>

						<Button
							size='sm'
							disabled
							className='h-8 text-xs gap-1.5 opacity-60 cursor-not-allowed'
						>
							<Send className='size-3' />
							Post comment
							<Badge variant='secondary' className='text-[9px] px-1.5 py-0 ml-1'>
								Coming soon
							</Badge>
						</Button>
					</div>
				</div>

				{/* Discussion Thread Section */}
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<h3 className='text-sm font-semibold text-foreground'>
							Discussion (0)
						</h3>
					</div>

					<Separator className='border-border/60' />

					{/* Clean Empty State without fake comments or mock reviews */}
					<div className='rounded-2xl border border-border/70 bg-card/50 p-12 text-center text-muted-foreground'>
						<div className='flex size-12 items-center justify-center rounded-full bg-muted/40 mx-auto mb-3 text-muted-foreground'>
							<MessageSquare className='size-5 text-muted-foreground/70' />
						</div>
						<p className='text-sm font-medium text-foreground'>
							No comments yet
						</p>
						<p className='text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed'>
							Comments and discussion threads will appear here when collaborative commenting is enabled for this template.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
