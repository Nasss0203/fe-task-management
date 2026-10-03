"use client";

import {
	AuthCard,
	authInputClassName,
	authSubmitButtonClassName,
} from "./auth-card";
import { Button } from "@/shared/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/shared/ui/field";
import { PasswordInput } from "@/shared/ui/password-input";
import { useResetPassword } from "../model/use-auth";
import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z
	.object({
		password: z
			.string()
			.min(6, "Mật khẩu phải chứa ít nhất 6 ký tự.")
			.max(100),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu không khớp",
		path: ["confirmPassword"],
	});

function ResetPasswordContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const { mutate, isPending } = useResetPassword();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		if (!token) return;
		mutate(
			{ token, newPassword: data.password },
			{
				onSuccess: () => setStatus("success"),
				onError: (err: unknown) => {
					setStatus("error");
					setErrorMsg(
						getFriendlyApiErrorMessage(
							err,
							"Không thể đặt lại mật khẩu. Vui lòng thử lại.",
						),
					);
				},
			},
		);
	}

	// Invalid token state
	if (!token) {
		return (
			<AuthCard
				icon={
					<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive'>
						<XCircle className='h-5 w-5' />
					</div>
				}
				title='Liên kết không hợp lệ'
				description='Liên kết đặt lại mật khẩu không tồn tại hoặc đã hết hạn.'
				footer={
					<div className='flex justify-center w-full'>
						<Link
							href='/sign-in'
							className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
						>
							<ArrowLeft className='h-3.5 w-3.5' />
							Quay lại đăng nhập
						</Link>
					</div>
				}
			>
				<div className='pt-2'>
					<Button asChild className={authSubmitButtonClassName}>
						<Link href='/forgot-password'>Gửi lại yêu cầu</Link>
					</Button>
				</div>
			</AuthCard>
		);
	}

	if (status === "success") {
		return (
			<AuthCard
				icon={
					<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
						<CheckCircle2 className='h-5 w-5' />
					</div>
				}
				title='Mật khẩu đã được cập nhật!'
				description='Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.'
			>
				<div className='pt-2'>
					<Button asChild className={authSubmitButtonClassName}>
						<Link href='/sign-in'>Đăng nhập ngay</Link>
					</Button>
				</div>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			title='Đặt lại mật khẩu'
			description='Tạo mật khẩu mới cho tài khoản của bạn.'
			footer={
				<div className='flex justify-center w-full'>
					<Link
						href='/sign-in'
						className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
					>
						<ArrowLeft className='h-3.5 w-3.5' />
						Quay lại đăng nhập
					</Link>
				</div>
			}
		>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-3.5'
			>
				<FieldGroup className='gap-3.5'>
					<Controller
						name='password'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className='gap-1.5'>
								<FieldLabel htmlFor='reset-password-new' className='text-xs sm:text-sm font-medium text-foreground'>
									Mật khẩu mới
								</FieldLabel>
								<PasswordInput
									{...field}
									id='reset-password-new'
									aria-invalid={fieldState.invalid}
									className={authInputClassName}
									placeholder='Nhập mật khẩu mới'
									autoComplete='new-password'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<Controller
						name='confirmPassword'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className='gap-1.5'>
								<FieldLabel htmlFor='reset-password-confirm' className='text-xs sm:text-sm font-medium text-foreground'>
									Xác nhận mật khẩu
								</FieldLabel>
								<PasswordInput
									{...field}
									id='reset-password-confirm'
									aria-invalid={fieldState.invalid}
									className={authInputClassName}
									placeholder='Nhập lại mật khẩu'
									autoComplete='new-password'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</FieldGroup>

				{status === "error" && (
					<p className='rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-xs sm:text-sm text-destructive dark:border-destructive/30 dark:bg-destructive/10'>
						{errorMsg}
					</p>
				)}

				<div className='pt-1.5'>
					<Button
						type='submit'
						className={authSubmitButtonClassName}
						disabled={isPending}
					>
						{isPending ? (
							<div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground' />
						) : (
							<span>Cập nhật mật khẩu</span>
						)}
					</Button>
				</div>
			</form>
		</AuthCard>
	);
}

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className='flex min-h-[200px] w-full items-center justify-center'>
					<div className='h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent' />
				</div>
			}
		>
			<ResetPasswordContent />
		</Suspense>
	);
}
