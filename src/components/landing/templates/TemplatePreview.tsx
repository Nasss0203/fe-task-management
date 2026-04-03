import { cn } from "@/lib/utils";
import React from "react";

type TemplatePreviewProps = {
	variant:
		| "kanban"
		| "mindmap"
		| "checklist"
		| "timeline"
		| "planner"
		| "meeting";
};

const Pill = ({ className }: { className?: string }) => (
	<div className={cn("h-3 rounded-md", className)} />
);

const CardBox = ({
	className,
	children,
}: {
	className?: string;
	children?: React.ReactNode;
}) => (
	<div
		className={cn(
			"rounded-lg border border-white/10 bg-white/[0.04]",
			className,
		)}
	>
		{children}
	</div>
);

export default function TemplatePreview({ variant }: TemplatePreviewProps) {
	if (variant === "mindmap") {
		return (
			<div className='relative h-full w-full rounded-xl border border-white/10 bg-[#0d0f14] p-4'>
				<div className='absolute left-1/2 top-1/2 h-3 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500' />
				<div className='absolute left-[18%] top-[30%] h-3 w-14 rounded-full bg-red-500' />
				<div className='absolute right-[18%] top-[28%] h-3 w-14 rounded-full bg-blue-500' />
				<div className='absolute left-[22%] bottom-[26%] h-3 w-14 rounded-full bg-red-400' />
				<div className='absolute right-[22%] bottom-[24%] h-3 w-14 rounded-full bg-emerald-500' />
				<div className='absolute left-[34%] top-[18%] h-3 w-12 rounded-full bg-amber-400' />
				<div className='absolute right-[34%] bottom-[16%] h-3 w-12 rounded-full bg-cyan-400' />
			</div>
		);
	}

	if (variant === "checklist") {
		return (
			<div className='h-full w-full rounded-xl border border-white/10 bg-[#0d0f14] p-4'>
				<div className='mb-4 flex items-center justify-between'>
					<div className='h-3 w-20 rounded bg-white/10' />
					<div className='h-3 w-10 rounded bg-violet-500/80' />
				</div>

				<div className='space-y-3'>
					<div className='flex items-center gap-3'>
						<div className='h-4 w-4 rounded border border-white/20 bg-white/5' />
						<div className='h-3 flex-1 rounded bg-white/10' />
						<div className='h-3 w-14 rounded bg-blue-500/80' />
					</div>
					<div className='flex items-center gap-3'>
						<div className='h-4 w-4 rounded border border-white/20 bg-white/5' />
						<div className='h-3 flex-1 rounded bg-white/10' />
						<div className='h-3 w-12 rounded bg-red-500/80' />
					</div>
					<div className='flex items-center gap-3'>
						<div className='h-4 w-4 rounded border border-white/20 bg-white/5' />
						<div className='h-3 flex-1 rounded bg-white/10' />
						<div className='h-3 w-16 rounded bg-emerald-500/80' />
					</div>
				</div>
			</div>
		);
	}

	if (variant === "timeline") {
		return (
			<div className='h-full w-full rounded-xl border border-white/10 bg-[#0d0f14] p-4'>
				<div className='mb-4 flex items-center gap-2'>
					<div className='h-3 w-16 rounded bg-white/10' />
					<div className='h-3 w-10 rounded bg-white/5' />
				</div>

				<div className='grid grid-cols-5 gap-2'>
					{Array.from({ length: 10 }).map((_, i) => (
						<div key={i} className='h-3 rounded bg-white/[0.05]' />
					))}
				</div>

				<div className='mt-4 space-y-3'>
					<div className='grid grid-cols-5 gap-2'>
						<div className='col-span-2 h-4 rounded bg-violet-500' />
						<div className='col-span-2 h-4 rounded bg-blue-500' />
					</div>
					<div className='grid grid-cols-5 gap-2'>
						<div className='col-span-3 h-4 rounded bg-red-500' />
						<div className='col-span-1 h-4 rounded bg-white/10' />
					</div>
					<div className='grid grid-cols-5 gap-2'>
						<div className='col-span-1 h-4 rounded bg-emerald-500' />
						<div className='col-span-3 h-4 rounded bg-violet-500' />
					</div>
				</div>
			</div>
		);
	}

	if (variant === "planner") {
		return (
			<div className='h-full w-full rounded-xl border border-white/10 bg-[#0d0f14] p-4'>
				<div className='mb-4 flex items-center justify-between'>
					<div className='h-3 w-24 rounded bg-white/10' />
					<div className='h-3 w-12 rounded bg-white/5' />
				</div>

				<div className='space-y-3'>
					<CardBox className='p-3'>
						<div className='mb-2 h-3 w-20 rounded bg-white/10' />
						<Pill className='mb-2 w-full bg-violet-500' />
						<Pill className='w-2/3 bg-red-500' />
					</CardBox>

					<CardBox className='p-3'>
						<div className='mb-2 h-3 w-16 rounded bg-white/10' />
						<Pill className='mb-2 w-3/4 bg-blue-500' />
						<Pill className='w-1/2 bg-emerald-500' />
					</CardBox>
				</div>
			</div>
		);
	}

	if (variant === "meeting") {
		return (
			<div className='h-full w-full rounded-xl border border-white/10 bg-[#0d0f14] p-4'>
				<div className='mb-4 flex items-center justify-between'>
					<div className='h-3 w-28 rounded bg-white/10' />
					<div className='h-3 w-10 rounded bg-violet-500/80' />
				</div>

				<div className='grid h-[calc(100%-28px)] grid-cols-2 gap-3'>
					<CardBox className='p-3'>
						<div className='mb-3 h-3 w-16 rounded bg-white/10' />
						<div className='space-y-2'>
							<Pill className='w-full bg-white/10' />
							<Pill className='w-4/5 bg-white/10' />
							<Pill className='w-2/3 bg-white/10' />
						</div>
					</CardBox>

					<div className='space-y-3'>
						<CardBox className='p-3'>
							<div className='mb-2 h-3 w-14 rounded bg-white/10' />
							<Pill className='w-full bg-blue-500' />
						</CardBox>
						<CardBox className='p-3'>
							<div className='mb-2 h-3 w-14 rounded bg-white/10' />
							<Pill className='w-5/6 bg-red-500' />
						</CardBox>
						<CardBox className='p-3'>
							<div className='mb-2 h-3 w-14 rounded bg-white/10' />
							<Pill className='w-2/3 bg-emerald-500' />
						</CardBox>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='h-full w-full rounded-xl border border-white/10 bg-[#0d0f14] p-4'>
			<div className='mb-4 flex items-center justify-between'>
				<div className='h-3 w-20 rounded bg-white/10' />
				<div className='h-3 w-10 rounded bg-violet-500/80' />
			</div>

			<div className='grid h-[calc(100%-28px)] grid-cols-3 gap-3'>
				<CardBox className='p-3'>
					<div className='mb-3 h-3 w-14 rounded bg-white/10' />
					<div className='space-y-2'>
						<Pill className='w-full bg-violet-500' />
						<Pill className='w-5/6 bg-red-500' />
						<Pill className='w-2/3 bg-emerald-500' />
					</div>
				</CardBox>

				<CardBox className='p-3'>
					<div className='mb-3 h-3 w-12 rounded bg-white/10' />
					<div className='space-y-2'>
						<Pill className='w-full bg-amber-400' />
						<Pill className='w-4/5 bg-blue-500' />
						<Pill className='w-3/5 bg-cyan-400' />
					</div>
				</CardBox>

				<CardBox className='p-3'>
					<div className='mb-3 h-3 w-16 rounded bg-white/10' />
					<div className='space-y-2'>
						<Pill className='w-full bg-rose-500' />
						<Pill className='w-5/6 bg-violet-500' />
						<Pill className='w-2/3 bg-emerald-500' />
					</div>
				</CardBox>
			</div>
		</div>
	);
}
