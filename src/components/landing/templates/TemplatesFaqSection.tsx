"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	ChevronDown,
	FolderKanban,
	Github,
	Grid3X3,
	Slack,
} from "lucide-react";
import { useState } from "react";

const faqLeft = [
	{
		id: "item-1",
		question: "What is task management software, and why do I need it?",
		answer: "Task management software helps individuals and teams organize, prioritize, and track tasks to enhance productivity and collaboration. It ensures efficient workflow and successful project completion.",
	},
	{
		id: "item-2",
		question: "Is task management software suitable for remote teams?",
		answer: "Yes. It helps remote teams coordinate work, assign responsibilities, track progress, and communicate clearly across locations.",
	},
	{
		id: "item-3",
		question: "How does task management software improve collaboration?",
		answer: "It centralizes tasks, deadlines, comments, and updates so everyone can work from a shared source of truth.",
	},
	{
		id: "item-4",
		question: "How secure is my data in task management software?",
		answer: "Most platforms provide authentication, access control, encrypted connections, and permission-based sharing to protect your data.",
	},
];

const faqRight = [
	{
		id: "item-5",
		question: "Can I use task management software for personal tasks?",
		answer: "Absolutely. It can be used for daily planning, habits, study schedules, personal goals, and to-do tracking.",
	},
	{
		id: "item-6",
		question:
			"What features should I look for in task management software?",
		answer: "Look for task assignment, due dates, collaboration tools, views like kanban, calendar, timeline, reminders, and integrations.",
	},
	{
		id: "item-7",
		question:
			"How does task management software help with time management?",
		answer: "It helps you prioritize work, visualize deadlines, reduce missed tasks, and allocate time more effectively.",
	},
];

function FaqCard({
	question,
	answer,
	open,
	onClick,
}: {
	question: string;
	answer: string;
	open: boolean;
	onClick: () => void;
}) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-2xl border transition-all duration-300",
				open
					? "border-white/20 text-white bg-[rgba(255,255,255,0.08)]"
					: "border-white/10 text-white bg-[rgba(255,255,255,0.03)] hover:border-white/20 hover:bg-[rgba(255,255,255,0.05)]",
			)}
		>
			<button
				type='button'
				onClick={onClick}
				className='flex w-full items-start justify-between gap-4 px-5 py-5 text-left'
			>
				<span className='text-[15px] font-semibold leading-8 text-white'>
					{question}
				</span>

				<ChevronDown
					className={cn(
						"mt-1 h-4 w-4 shrink-0 transition-transform duration-300",
						open ? "rotate-180 text-white/80" : "text-white/60",
					)}
				/>
			</button>

			<div
				className={cn(
					"overflow-hidden transition-all duration-300 ease-in-out",
					open ? "max-h-60 opacity-100" : "max-h-0 opacity-0",
				)}
			>
				<div className='border-t border-white/10 px-5 pb-5 pt-4'>
					<p className='text-sm leading-8 text-white/70'>{answer}</p>
				</div>
			</div>
		</div>
	);
}

function ToolBubble({
	className,
	children,
}: {
	className: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"absolute flex h-[58px] w-[58px] items-center justify-center rounded-full",
				"border border-white/10 bg-black/75 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
				className,
			)}
		>
			{children}
		</div>
	);
}

function ToolsMockup() {
	return (
		<div className='relative h-[340px] w-[560px] rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))]'>
			<div className='absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_58%)]' />

			<ToolBubble className='left-8 top-8'>
				<Slack className='h-5 w-5 text-white' />
			</ToolBubble>

			<ToolBubble className='left-[170px] top-8'>
				<FolderKanban className='h-5 w-5 text-white' />
			</ToolBubble>

			<ToolBubble className='right-8 top-8'>
				<Grid3X3 className='h-5 w-5 text-white' />
			</ToolBubble>

			<ToolBubble className='left-8 top-[160px]'>
				<Github className='h-5 w-5 text-white' />
			</ToolBubble>

			<ToolBubble className='left-[170px] bottom-8'>
				<div className='h-5 w-5 rounded-full border border-white/20 bg-blue-500' />
			</ToolBubble>

			<ToolBubble className='left-[290px] bottom-8'>
				<div className='h-5 w-5 rounded-full border border-white/20 bg-amber-400' />
			</ToolBubble>

			<ToolBubble className='right-8 bottom-8'>
				<div className='h-5 w-5 rounded-full border border-white/20 bg-emerald-500' />
			</ToolBubble>

			<div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4'>
				<div className='h-5 w-5 rotate-45 bg-white' />
				<span className='text-[32px] font-semibold text-white'>
					Taskmanly
				</span>
			</div>

			<div className='absolute bottom-5 right-5 h-3 w-3 rounded-full bg-black/70' />
		</div>
	);
}

export default function TemplatesFaqSection() {
	const [openId, setOpenId] = useState<string>("item-1");

	const toggleItem = (id: string) => {
		setOpenId((prev) => (prev === id ? "" : id));
	};

	return (
		<section className='py-16 md:py-20'>
			<div className='mx-auto max-w-5xl'>
				<h2 className='mb-10 text-center text-3xl font-semibold tracking-tight text-white md:text-4xl'>
					Frequently Asked Questions
				</h2>

				<div className='grid gap-5 md:grid-cols-2'>
					<div className='space-y-5'>
						{faqLeft.map((item) => (
							<FaqCard
								key={item.id}
								question={item.question}
								answer={item.answer}
								open={openId === item.id}
								onClick={() => toggleItem(item.id)}
							/>
						))}
					</div>

					<div className='space-y-5'>
						{faqRight.map((item) => (
							<FaqCard
								key={item.id}
								question={item.question}
								answer={item.answer}
								open={openId === item.id}
								onClick={() => toggleItem(item.id)}
							/>
						))}
					</div>
				</div>
			</div>

			<div className='mx-auto mt-24 grid max-w-7xl gap-16 md:grid-cols-[560px_minmax(0,430px)] md:items-center md:justify-center'>
				<div className='flex justify-center md:justify-end'>
					<ToolsMockup />
				</div>

				<div className='max-w-[430px] text-center md:text-left'>
					<h3 className='text-3xl font-semibold leading-[1.12] text-white md:text-[48px]'>
						Connect Your Tools to
						<br />
						Taskmanly
					</h3>

					<p className='mt-5 text-sm leading-8 text-white/60'>
						We have more than 200+ integrations, so you can use your
						favorite work tools to communicate, collaborate, and
						coordinate work in one place, from start to finish.
					</p>

					<Button
						variant='outline'
						className='mt-6 h-11 rounded-md border-white/15 bg-black px-6 text-sm font-medium text-white hover:bg-white hover:text-black'
					>
						Learn More
					</Button>
				</div>
			</div>
		</section>
	);
}
