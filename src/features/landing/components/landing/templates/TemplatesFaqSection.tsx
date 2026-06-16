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
		question: "Phần mềm quản lý tác vụ là gì và tại sao tôi cần nó?",
		answer: "Phần mềm quản lý tác vụ giúp cá nhân và đội ngũ tổ chức, ưu tiên và theo dõi các tác vụ để nâng cao năng suất và hiệu quả cộng tác. Nó đảm bảo quy trình làm việc trôi chảy và hoàn thành dự án thành công.",
	},
	{
		id: "item-2",
		question: "Phần mềm quản lý tác vụ có phù hợp với các đội ngũ làm việc từ xa không?",
		answer: "Có. Nó giúp các đội ngũ làm việc từ xa điều phối công việc, phân công trách nhiệm, theo dõi tiến độ và giao tiếp rõ ràng giữa các vị trí địa lý khác nhau.",
	},
	{
		id: "item-3",
		question: "Phần mềm quản lý tác vụ cải thiện sự cộng tác như thế nào?",
		answer: "Nó tập trung các tác vụ, ngày đến hạn, bình luận và cập nhật để mọi người có thể làm việc trên một nguồn thông tin duy nhất.",
	},
	{
		id: "item-4",
		question: "Dữ liệu của tôi trong phần mềm quản lý tác vụ an toàn đến mức nào?",
		answer: "Hầu hết các nền tảng đều cung cấp xác thực, kiểm soát truy cập, kết nối mã hóa và chia sẻ dựa trên quyền để bảo vệ dữ liệu của bạn.",
	},
];

const faqRight = [
	{
		id: "item-5",
		question: "Tôi có thể sử dụng phần mềm quản lý tác vụ cho công việc cá nhân không?",
		answer: "Chắc chắn rồi. Nó có thể được sử dụng cho việc lập kế hoạch hàng ngày, thói quen, lịch học, mục tiêu cá nhân và theo dõi danh sách việc cần làm.",
	},
	{
		id: "item-6",
		question:
			"Tôi nên tìm kiếm các tính năng nào trong phần mềm quản lý tác vụ?",
		answer: "Hãy tìm kiếm tính năng giao việc, ngày đến hạn, công cụ cộng tác, các chế độ xem như Kanban, Lịch, Tiến độ, nhắc nhở và tiện ích tích hợp.",
	},
	{
		id: "item-7",
		question:
			"Phần mềm quản lý tác vụ giúp ích thế nào cho việc quản lý thời gian?",
		answer: "Nó giúp bạn ưu tiên công việc, trực quan hóa ngày đến hạn, giảm thiểu các tác vụ bị bỏ sót và phân bổ thời gian hiệu quả hơn.",
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
					? "border-primary text-primary bg-primary/10"
					: "border-border text-foreground bg-card hover:border-primary/50 hover:bg-muted",
			)}
		>
			<button
				type='button'
				onClick={onClick}
				className='flex w-full items-start justify-between gap-4 px-5 py-5 text-left'
			>
				<span className='text-[15px] font-semibold leading-8 text-foreground'>
					{question}
				</span>

				<ChevronDown
					className={cn(
						"mt-1 h-4 w-4 shrink-0 transition-transform duration-300",
						open ? "rotate-180 text-primary" : "text-muted-foreground",
					)}
				/>
			</button>

			<div
				className={cn(
					"overflow-hidden transition-all duration-300 ease-in-out",
					open ? "max-h-60 opacity-100" : "max-h-0 opacity-0",
				)}
			>
				<div className='border-t border-border px-5 pb-5 pt-4'>
					<p className='text-sm leading-8 text-muted-foreground'>{answer}</p>
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
				"border border-border bg-card shadow-sm",
				className,
			)}
		>
			{children}
		</div>
	);
}

function ToolsMockup() {
	return (
		<div className='relative h-[340px] w-[560px] rounded-[18px] border border-border bg-gradient-to-b from-muted to-background'>
			<div className='absolute inset-0 rounded-[18px] bg-primary/5' />

			<ToolBubble className='left-8 top-8'>
				<Slack className='h-5 w-5 text-foreground' />
			</ToolBubble>

			<ToolBubble className='left-[170px] top-8'>
				<FolderKanban className='h-5 w-5 text-foreground' />
			</ToolBubble>

			<ToolBubble className='right-8 top-8'>
				<Grid3X3 className='h-5 w-5 text-foreground' />
			</ToolBubble>

			<ToolBubble className='left-8 top-[160px]'>
				<Github className='h-5 w-5 text-foreground' />
			</ToolBubble>

			<ToolBubble className='left-[170px] bottom-8'>
				<div className='h-5 w-5 rounded-full border border-border bg-blue-500' />
			</ToolBubble>

			<ToolBubble className='left-[290px] bottom-8'>
				<div className='h-5 w-5 rounded-full border border-border bg-amber-400' />
			</ToolBubble>

			<ToolBubble className='right-8 bottom-8'>
				<div className='h-5 w-5 rounded-full border border-border bg-emerald-500' />
			</ToolBubble>

			<div className='absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-4'>
				<div className='h-5 w-5 rotate-45 bg-white' />
				<span className='text-[32px] font-semibold text-foreground'>
					Taskmanly
				</span>
			</div>

			<div className='absolute bottom-5 right-5 h-3 w-3 rounded-full bg-foreground/50' />
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
				<h2 className='mb-10 text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl'>
					Các câu hỏi thường gặp
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
					<h3 className='text-3xl font-semibold leading-[1.12] text-foreground md:text-[48px]'>
						Kết nối các Công cụ của bạn với
						<br />
						Taskmanly
					</h3>

					<p className='mt-5 text-sm leading-8 text-muted-foreground'>
						Chúng tôi có hơn 200 tiện ích tích hợp, giúp bạn sử dụng các
						công cụ làm việc yêu thích để giao tiếp, cộng tác và
						điều phối công việc ở một nơi, từ đầu đến cuối.
					</p>

					<Button
						variant='outline'
						className='mt-6 h-11 rounded-md border-white/15 bg-black px-6 text-sm font-medium text-foreground hover:bg-white hover:text-black'
					>
						Tìm hiểu thêm
					</Button>
				</div>
			</div>
		</section>
	);
}
