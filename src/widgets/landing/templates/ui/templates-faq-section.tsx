"use client";

import { useState } from "react";
import Link from "next/link";
import {
	ChevronDown,
	HelpCircle,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const faqs = [
	{
		id: "item-1",
		question: "What is Taskmanly and how does it help my team?",
		answer:
			"Taskmanly is an all-in-one collaborative workspace that unites flexible documents, structured databases, teamspaces, web publishing, and AI assistance into a single unified platform.",
	},
	{
		id: "item-2",
		question: "Is Taskmanly suitable for remote and distributed squads?",
		answer:
			"Yes. Taskmanly provides real-time collaborative editing, instant workspace invitations, granular role-based access control, and dedicated teamspaces for every department.",
	},
	{
		id: "item-3",
		question: "Can I use templates for personal and company workspaces?",
		answer:
			"Absolutely. Our curated template gallery includes ready-to-use setups for team wikis, meeting agendas, knowledge bases, content calendars, and personal planners.",
	},
	{
		id: "item-4",
		question: "How secure is my data in Taskmanly?",
		answer:
			"We utilize encryption in transit and at rest, strict workspace role isolation (Owner, Admin, Member, Viewer), and token-based authentication.",
	},
	{
		id: "item-5",
		question: "Can I publish pages to the public web?",
		answer:
			"Yes. With one click you can turn any document or nested subpage tree into a fast, public website hosted on a custom Taskmanly subdomain.",
	},
	{
		id: "item-6",
		question: "How does Taskmanly AI assist my daily workflow?",
		answer:
			"Taskmanly AI understands your workspace context, drafting technical specs, summarizing long docs, extracting actionable checklist items, and organizing unstructured ideas.",
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
					? "border-primary/50 bg-primary/5"
					: "border-border/80 bg-card hover:border-primary/30 hover:bg-muted/40",
			)}
		>
			<button
				type='button'
				onClick={onClick}
				className='flex w-full items-start justify-between gap-4 p-5 text-left'
			>
				<span className='text-sm font-semibold leading-relaxed text-foreground'>
					{question}
				</span>

				<ChevronDown
					className={cn(
						"mt-0.5 h-4 w-4 shrink-0 transition-transform duration-300 text-muted-foreground",
						open && "rotate-180 text-primary",
					)}
				/>
			</button>

			<div
				className={cn(
					"overflow-hidden transition-all duration-300 ease-in-out",
					open ? "max-h-60 opacity-100" : "max-h-0 opacity-0",
				)}
			>
				<div className='border-t border-border/50 px-5 pb-5 pt-3.5'>
					<p className='text-xs leading-relaxed text-muted-foreground'>{answer}</p>
				</div>
			</div>
		</div>
	);
}

export default function TemplatesFaqSection() {
	const [openId, setOpenId] = useState<string>("item-1");

	const toggleItem = (id: string) => {
		setOpenId((prev) => (prev === id ? "" : id));
	};

	const half = Math.ceil(faqs.length / 2);
	const col1 = faqs.slice(0, half);
	const col2 = faqs.slice(half);

	return (
		<section className='py-16 md:py-24 border-t border-border/60'>
			<div className='mx-auto max-w-5xl px-4 sm:px-6 lg:px-8'>
				<div className='text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-3'>
					<div className='inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary'>
						<HelpCircle className='h-3.5 w-3.5' />
						Common Questions
					</div>
					<h2 className='text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
						Frequently Asked Questions
					</h2>
					<p className='text-sm text-muted-foreground'>
						Everything you need to know about Taskmanly templates and workspaces.
					</p>
				</div>

				<div className='grid gap-4 md:grid-cols-2 items-start'>
					<div className='space-y-4'>
						{col1.map((item) => (
							<FaqCard
								key={item.id}
								question={item.question}
								answer={item.answer}
								open={openId === item.id}
								onClick={() => toggleItem(item.id)}
							/>
						))}
					</div>

					<div className='space-y-4'>
						{col2.map((item) => (
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

				{/* Connected Workspace Callout */}
				<div className='mt-20 rounded-3xl border border-border/80 bg-gradient-to-r from-primary/5 via-card to-secondary/20 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-xs'>
					<div className='space-y-2 max-w-xl'>
						<h3 className='text-2xl font-bold tracking-tight text-foreground'>
							Ready to build your workspace?
						</h3>
						<p className='text-xs sm:text-sm text-muted-foreground leading-relaxed'>
							Start with any template or build from scratch. Collaborate on docs, databases, and wikis with zero setup friction.
						</p>
					</div>

					<div className='flex items-center gap-3 shrink-0'>
						<Link href='/sign-up'>
							<Button size='lg' className='rounded-full bg-primary font-semibold text-primary-foreground shadow-xs px-6'>
								Get started free
							</Button>
						</Link>
						<Link href='/features'>
							<Button size='lg' variant='outline' className='rounded-full px-6'>
								Explore features
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
