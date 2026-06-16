import { Button } from "@/components/ui/button";
import { LayoutGrid, Mail } from "lucide-react";
import Link from "next/link";

const footerColumns = [
	{
		title: "Sản phẩm",
		links: [
			"Trang chủ",
			"Bảng giá",
			"Doanh nghiệp",
			"Bảo mật & Tin cậy",
			"Tích hợp",
			"Mẫu",
		],
	},
	{
		title: "Giải pháp",
		links: [
			"Quản lý Tác vụ",
			"Trình soạn thảo",
			"Wiki Kỹ thuật",
			"Ghi chú họp",
			"Quy trình Agile",
		],
	},
	{
		title: "Tài nguyên",
		links: [
			"Trung tâm Trợ giúp",
			"Blog",
			"Cộng đồng",
			"API cho Lập trình viên",
			"Trợ năng",
		],
	},
	{
		title: "Công ty",
		links: ["Về chúng tôi", "Tuyển dụng", "Báo chí", "Khách hàng", "Liên hệ"],
	},
];

const Footer = () => {
	return (
		<footer className='mx-auto mt-32 max-w-6xl rounded-t-[48px] border border-border border-b-0 bg-card'>
			<div className='border-b border-border px-8 py-20 lg:px-16'>
				<div className='mx-auto max-w-3xl text-center'>
					<h2 className='text-4xl font-semibold tracking-tight text-foreground sm:text-5xl'>
						Sẵn sàng tối ưu hóa?
					</h2>

					<p className='mx-auto mt-6 max-w-xl text-lg text-muted-foreground'>
						Tham gia cùng hơn 40.000 đội ngũ kiến tạo tương lai với
						Taskmanly. Bắt đầu dùng thử miễn phí ngay hôm nay.
					</p>

					<div className='mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row'>
						<div className='flex flex-1 items-center gap-3 rounded-full border border-border bg-background px-6 py-3 transition-focus-within focus-within:border-primary/50'>
							<Mail className='h-4 w-4 text-muted-foreground' />
							<input
								type='email'
								placeholder='Nhập email của bạn'
								className='w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground'
							/>
						</div>

						<Button className='h-12 rounded-full bg-foreground px-8 font-semibold text-background hover:bg-foreground/90 active:scale-[0.98]'>
							Bắt đầu ngay
						</Button>
					</div>
				</div>
			</div>

			<div className='px-8 py-16 lg:px-16'>
				<div className='grid gap-12 lg:grid-cols-6'>
					<div className='lg:col-span-2'>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground ring-1 ring-border'>
								<LayoutGrid className='h-5 w-5' />
							</div>
							<span className='text-2xl font-semibold tracking-tight text-foreground'>
								Taskmanly
							</span>
						</div>

						<p className='mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground'>
							Giải pháp tối ưu cho cộng tác trên nhiều bộ phận.
							Được xây dựng cho các nhóm làm việc hiện đại.
						</p>
					</div>

					{footerColumns.map((column) => (
						<div key={column.title}>
							<h3 className='text-sm font-semibold text-foreground'>
								{column.title}
							</h3>

							<div className='mt-6 space-y-4'>
								{column.links.map((link) => (
									<Link
										key={link}
										href='#'
										className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
									>
										{link}
									</Link>
								))}
							</div>
						</div>
					))}
				</div>

				<div className='mt-20 flex flex-col gap-6 border-t border-border pt-8 lg:flex-row lg:items-center lg:justify-between'>
					<p className='text-xs text-muted-foreground font-mono'>
						© 2024 Taskmanly Inc. All rights reserved.
					</p>
					<div className='flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-muted-foreground'>
						<Link href='#' className='hover:text-foreground transition-colors'>
							Chính sách bảo mật
						</Link>
						<Link href='#' className='hover:text-foreground transition-colors'>
							Điều khoản dịch vụ
						</Link>
						<Link href='#' className='hover:text-foreground transition-colors'>
							Bảo mật
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
