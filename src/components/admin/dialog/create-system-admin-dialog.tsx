"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import type { CreateSystemAdminDto } from "@/services/admin/user/type";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Vui lòng nhập tên tài khoản.")
		.max(64, "Tên tài khoản không được vượt quá 64 ký tự.")
		.regex(
			/^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?$/,
			"Chỉ dùng chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.",
		),
	recipientEmail: z
		.string()
		.trim()
		.email("Email người nhận không hợp lệ."),
});

type CreateSystemAdminDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: CreateSystemAdminDto) => Promise<void>;
	isPending: boolean;
};

type ApiErrorBody = {
	code?: string;
	message?: string | string[];
};

const lightDialogFieldLabelClass = "text-sm font-medium text-[#334155]";
const lightDialogFieldDescriptionClass = "text-sm leading-normal text-[#64748B]";
const lightDialogInputClass =
	"h-10 border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:border-[#2563EB] focus-visible:ring-[#2563EB]/20";
const lightDialogInputGroupClass =
	"h-10 border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] shadow-sm has-[[data-slot=input-group-control]:focus-visible]:border-[#2563EB] has-[[data-slot=input-group-control]:focus-visible]:ring-[#2563EB]/20";

export function CreateSystemAdminDialog({
	open,
	onOpenChange,
	onSubmit,
	isPending,
}: CreateSystemAdminDialogProps) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			recipientEmail: "",
		},
	});

	useEffect(() => {
		if (!open) form.reset();
	}, [form, open]);

	const handleSubmit = async (data: z.infer<typeof formSchema>) => {
		try {
			await onSubmit({
				name: data.name.toLowerCase(),
				recipientEmail: data.recipientEmail.toLowerCase(),
			});
			onOpenChange(false);
		} catch (error: unknown) {
			const apiError = axios.isAxiosError<ApiErrorBody>(error) ? error : null;
			const apiMessage = apiError?.response?.data?.message;
			let description = Array.isArray(apiMessage)
				? apiMessage.join(" ")
				: apiMessage || "Không thể tạo tài khoản. Vui lòng thử lại.";

			if (apiError?.response?.data?.code === "MAIL_SERVICE_NOT_CONFIGURED") {
				description =
					"Backend chưa cấu hình email gửi. Hãy thiết lập USER_EMAIL và PASSWORD_EMAIL rồi khởi động lại backend.";
			} else if (apiError?.response?.data?.code === "MAIL_AUTH_FAILED") {
				description =
					"Gmail từ chối đăng nhập SMTP. Hãy dùng Gmail App Password 16 ký tự trong PASSWORD_EMAIL, không dùng mật khẩu Gmail thông thường.";
			} else if (
				apiError?.response?.data?.code === "MAIL_CONNECTION_FAILED"
			) {
				description =
					"Không thể kết nối tới máy chủ SMTP. Vui lòng kiểm tra HOST_EMAIL, PORT_EMAIL và kết nối mạng.";
			} else if (apiError?.code === "ECONNABORTED") {
				description =
					"Máy chủ gửi email phản hồi quá lâu. Vui lòng kiểm tra cấu hình SMTP.";
			}

			toast.error("Tạo System Admin thất bại", { description });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='admin-light-theme border-[#E2E8F0] bg-white text-[#0F172A] shadow-[0_24px_60px_rgba(15,23,42,0.22)]'>
				<DialogHeader>
					<div className='flex items-center gap-2'>
						<ShieldCheck className='text-[#2563EB]' />
						<DialogTitle className='text-[#0F172A]'>
							Tạo tài khoản System Admin
						</DialogTitle>
					</div>
					<DialogDescription className='text-[#64748B]'>
						Hệ thống sẽ sinh mật khẩu tạm và gửi thông tin đăng nhập tới
						email người nhận.
					</DialogDescription>
				</DialogHeader>

				<form
					id='create-system-admin-form'
					onSubmit={form.handleSubmit(handleSubmit)}
					className='flex flex-col gap-5'
				>
					<FieldGroup>
						<Controller
							name='name'
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel
										htmlFor='system-admin-name'
										className={lightDialogFieldLabelClass}
									>
										Tên tài khoản
									</FieldLabel>
									<InputGroup className={lightDialogInputGroupClass}>
										<InputGroupInput
											{...field}
											id='system-admin-name'
											aria-invalid={fieldState.invalid}
											placeholder='VD: operations'
											autoComplete='off'
											className='text-[#0F172A] placeholder:text-[#94A3B8]'
										/>
										<InputGroupAddon
											align='inline-end'
											className='text-[#64748B]'
										>
											<InputGroupText className='text-[#475569]'>
												@systemadmin.com
											</InputGroupText>
										</InputGroupAddon>
									</InputGroup>
									<FieldDescription
										className={lightDialogFieldDescriptionClass}
									>
										Đây là email dùng để đăng nhập hệ thống.
									</FieldDescription>
									{fieldState.invalid ? (
										<FieldError
											errors={[fieldState.error]}
											className='text-[#B91C1C]'
										/>
									) : null}
								</Field>
							)}
						/>

						<Controller
							name='recipientEmail'
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel
										htmlFor='system-admin-recipient-email'
										className={lightDialogFieldLabelClass}
									>
										Email người nhận
									</FieldLabel>
									<Input
										{...field}
										id='system-admin-recipient-email'
										type='email'
										aria-invalid={fieldState.invalid}
										placeholder='VD: admin@example.com'
										autoComplete='email'
										className={lightDialogInputClass}
									/>
									<FieldDescription
										className={lightDialogFieldDescriptionClass}
									>
										Thông tin tài khoản và mật khẩu tạm sẽ được gửi tới email này.
									</FieldDescription>
									{fieldState.invalid ? (
										<FieldError
											errors={[fieldState.error]}
											className='text-[#B91C1C]'
										/>
									) : null}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>

				<DialogFooter>
					<DialogClose asChild>
						<Button
							type='button'
							variant='outline'
							disabled={isPending}
							className='border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:text-[#0F172A] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]'
						>
							Hủy
						</Button>
					</DialogClose>
					<Button
						type='submit'
						form='create-system-admin-form'
						disabled={isPending}
						className='bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:bg-[#93C5FD] disabled:text-white'
					>
						{isPending ? (
							<LoaderCircle className='animate-spin' data-icon='inline-start' />
						) : (
							<ShieldCheck data-icon='inline-start' />
						)}
						{isPending ? "Đang tạo..." : "Tạo và gửi email"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
