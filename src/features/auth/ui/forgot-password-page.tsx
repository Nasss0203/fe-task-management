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
import { Input } from "@/shared/ui/input";
import { useForgotPassword } from "../model/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
	email: z.string().email("Email không hợp lệ").min(5).max(100),
});

export default function ForgotPasswordPage() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { mutate, isPending } = useForgotPassword();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutate(data, {
			onSuccess: () => setIsSubmitted(true),
			onError: () => setIsSubmitted(true),
		});
	}

	return (
		<AuthCard
			icon={
				<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
					<Mail className='h-5 w-5' />
				</div>
			}
			title='Quên mật khẩu'
			description='Nhập email để nhận liên kết đặt lại mật khẩu cho tài khoản của bạn.'
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
			{isSubmitted ? (
				<div className='flex flex-col gap-4 py-1'>
					<div className='rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4'>
						<div className='flex items-start gap-3'>
							<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'>
								<CheckCircle2 className='h-5 w-5' />
							</div>
							<div>
								<h2 className='text-sm font-semibold text-foreground'>
									Yêu cầu đã được ghi nhận
								</h2>
								<p className='mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed'>
									Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu trong vài phút.
								</p>
							</div>
						</div>
					</div>

					<div className='grid gap-2.5 sm:grid-cols-2 pt-1'>
						<Button
							type='button'
							variant='outline'
							className='h-11 rounded-xl border border-border/80 text-sm font-medium hover:bg-muted/60 transition-colors'
							onClick={() => {
								form.reset();
								setIsSubmitted(false);
							}}
						>
							Thử email khác
						</Button>
						<Button asChild className={authSubmitButtonClassName}>
							<Link href='/sign-in'>Đăng nhập</Link>
						</Button>
					</div>
				</div>
			) : (
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='flex flex-col gap-3.5'
				>
					<FieldGroup className='gap-3.5'>
						<Controller
							name='email'
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid} className='gap-1.5'>
									<FieldLabel htmlFor='forgot-password-email' className='text-xs sm:text-sm font-medium text-foreground'>
										Email
									</FieldLabel>
									<Input
										{...field}
										id='forgot-password-email'
										type='email'
										aria-invalid={fieldState.invalid}
										className={authInputClassName}
										placeholder='Nhập email của bạn'
										autoComplete='email'
									/>
									{fieldState.invalid && (
										<FieldError
											errors={[fieldState.error]}
										/>
									)}
								</Field>
							)}
						/>
					</FieldGroup>

					<div className='pt-1.5'>
						<Button
							type='submit'
							className={authSubmitButtonClassName}
							disabled={isPending}
						>
							{isPending ? (
								<div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground' />
							) : (
								<span>Gửi yêu cầu</span>
							)}
						</Button>
					</div>
				</form>
			)}
		</AuthCard>
	);
}
