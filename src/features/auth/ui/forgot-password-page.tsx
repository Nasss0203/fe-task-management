"use client";

import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
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

const authInputClassName =
	"h-12 rounded-xl border-slate-200 bg-white/85 px-4 shadow-sm focus-visible:border-primary/70 focus-visible:ring-primary/15 dark:border-white/10 dark:bg-white/5";

const submitButtonClassName =
	"h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30";

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
		<div className='mx-auto w-full max-w-md'>
			<Card className='relative w-full overflow-hidden border-white/70 bg-white/[0.92] py-0 shadow-[0_36px_90px_-48px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/[0.72]'>
				<div
					aria-hidden='true'
					className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-cyan-300'
				/>

				<CardHeader className='gap-3 px-6 pb-0 pt-8 sm:px-8'>
					<div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'>
						<Mail className='h-5 w-5' />
					</div>
					<CardTitle className='text-[1.75rem] font-semibold tracking-tight text-slate-950 dark:text-white'>
						Quên mật khẩu
					</CardTitle>
					<CardDescription className='text-[14.5px] leading-6 text-slate-500 dark:text-slate-300'>
						Nhập email để nhận liên kết đặt lại mật khẩu.
					</CardDescription>
				</CardHeader>

				<CardContent className='px-6 pb-8 pt-6 sm:px-8'>
					{isSubmitted ? (
						<div className='space-y-5'>
							<div className='rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-5 dark:border-emerald-500/25 dark:bg-emerald-500/10'>
								<div className='flex items-start gap-4'>
									<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300'>
										<CheckCircle2 className='h-5 w-5' />
									</div>
									<div>
										<h2 className='text-sm font-semibold text-slate-900 dark:text-white'>
											Yêu cầu đã được ghi nhận
										</h2>
										<p className='mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300'>
											Nếu email tồn tại, bạn sẽ nhận được liên kết đặt lại mật khẩu trong vài phút.
										</p>
									</div>
								</div>
							</div>

							<div className='grid gap-3 sm:grid-cols-2'>
								<Button
									type='button'
									variant='outline'
									className='h-11 rounded-xl border-slate-200 bg-white/85 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10'
									onClick={() => {
										form.reset();
										setIsSubmitted(false);
									}}
								>
									Thử email khác
								</Button>
								<Button asChild size='lg' className='h-11 rounded-xl text-sm font-semibold'>
									<Link href='/sign-in'>Quay lại đăng nhập</Link>
								</Button>
							</div>
						</div>
					) : (
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='flex flex-col gap-5'
						>
							<FieldGroup>
								<Controller
									name='email'
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor='forgot-password-email'>
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

							<Field orientation='horizontal' className='pt-1'>
								<Button
									type='submit'
									size='lg'
									className={submitButtonClassName}
									disabled={isPending}
								>
									{isPending ? (
										<div className='h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/35 border-t-white' />
									) : (
										<span>Gửi yêu cầu</span>
									)}
								</Button>
							</Field>

							<div className='flex justify-center'>
								<Link
									href='/sign-in'
									className='inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-300 dark:hover:text-white'
								>
									<ArrowLeft className='h-4 w-4' />
									Quay lại đăng nhập
								</Link>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
