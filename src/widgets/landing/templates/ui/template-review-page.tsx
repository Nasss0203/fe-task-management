"use client";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/ui/dialog";
import { ArrowLeft, Loader2, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLandingTemplate } from "../model/use-templates";
import TemplatePreview from "./template-preview";

export default function TemplateReviewPage() {
	const params = useParams();
	const templateId = params.templateId as string;

	const { landingTemplateQuery } = useLandingTemplate(templateId);
	const { data, isLoading, error } = landingTemplateQuery;
	const template = data?.data; // Unpack the Axios response

	if (isLoading) {
		return (
			<div className="flex justify-center items-center py-40">
				<Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error || !template) {
		return (
			<div className="py-40 text-center">
				<h1 className="text-2xl font-bold">Không tìm thấy template</h1>
				<p className="mt-2 text-muted-foreground">Template bạn đang tìm không tồn tại hoặc ở chế độ riêng tư.</p>
				<Link href="/#templates" className="mt-6 inline-block">
					<Button variant="outline">Trở về Trang chủ</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="py-10 md:py-16 max-w-5xl mx-auto">
			<Link href="/#templates" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8">
				<ArrowLeft className="mr-2 h-4 w-4" />
				Quay lại Templates
			</Link>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
				{/* Left Column: Details */}
				<div className="flex flex-col gap-6">
					<div>
						<div className="flex items-center gap-3 mb-4">
							<Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
								{template.category || "Chung"}
							</Badge>
						</div>
						<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
							{template.name}
						</h1>
						<p className="mt-4 text-lg text-muted-foreground leading-relaxed">
							{template.description || "Một mẫu không gian làm việc toàn diện được thiết kế để khởi động năng suất của nhóm bạn và tối ưu hóa các luồng công việc."}
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 mt-4">
						<Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-base font-semibold">
							Sử dụng Template
						</Button>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline" className="h-12 px-8 rounded-xl border-border bg-background/50 hover:bg-secondary text-base font-medium">
									<PlayCircle className="mr-2 h-5 w-5" />
									Xem trước
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-[95vw] md:max-w-[85vw] h-[85vh] border-border bg-background p-0 overflow-hidden rounded-2xl flex flex-col">
								<DialogHeader className="p-6 pb-2 shrink-0">
									<DialogTitle className="text-xl flex items-center gap-2">
										<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Chế độ thử nghiệm</Badge>
										{template.name}
									</DialogTitle>
									<DialogDescription>
										Đây là môi trường thử nghiệm tương tác trực tiếp. Kéo thả các tác vụ để thử luồng công việc. Mọi thay đổi sẽ được đặt lại khi bạn đóng cửa sổ này.
									</DialogDescription>
								</DialogHeader>
								<div className="flex-1 w-full bg-muted/10 overflow-hidden relative">
									<TemplatePreview variant="kanban" />
								</div>
							</DialogContent>
						</Dialog>
					</div>

					<div className="mt-8 border-t border-border pt-8">
						<h3 className="font-semibold text-foreground mb-4">Template này bao gồm:</h3>
						<ul className="space-y-3">
							{[
								"Các bảng tác vụ và trạng thái đã được cấu hình sẵn",
								"Nhãn dán tùy chỉnh và thẻ độ ưu tiên",
								"Dữ liệu mẫu giúp bạn bắt đầu nhanh chóng",
								"Được tối ưu hóa để cộng tác nhóm",
							].map((feature, i) => (
								<li key={i} className="flex items-center gap-3 text-muted-foreground">
									<div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
									{feature}
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Right Column: Visual Preview */}
				<div className="relative rounded-2xl border border-border bg-card shadow-sm overflow-hidden aspect-[4/3] group">
					<TemplatePreview variant="kanban" />
					<div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/0 to-background/0" />
				</div>
			</div>
		</div>
	);
}
