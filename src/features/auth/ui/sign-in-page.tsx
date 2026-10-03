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
import { PasswordInput } from "@/shared/ui/password-input";
import { useLogin, useResendVerification } from "../model/use-auth";
import {
	getApiErrorCode,
	getFriendlyApiErrorMessage,
} from "@/shared/lib/api-error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { formSchema } from "../model/sign-in.schema";
import z from "zod";

export default function SignIn() {
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { mutate, isPending } = useLogin();
	const { mutate: resendVerify } = useResendVerification();

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutate(data, {
			onSuccess: () => {
				router.push("/");
			},
			onError: (err: unknown) => {
				const errorCode = getApiErrorCode(err);

				if (errorCode === "EMAIL_NOT_VERIFIED") {
					toast.error("Tài khoản chưa được xác minh", {
						description:
							"Vui lòng kiểm tra email của bạn để xác minh tài khoản.",
						action: {
							label: "Gửi lại email",
							onClick: () => {
								resendVerify(
									{ email: data.email },
									{
										onSuccess: () =>
											toast.success("Đã gửi lại email xác nhận", {
												description:
													"Vui lòng kiểm tra hộp thư của bạn.",
											}),
										onError: () =>
											toast.error(
												"Có lỗi xảy ra khi gửi lại email"
											),
									}
								);
							},
						},
					});
					return;
				}

				toast.error("Đăng nhập thất bại", {
					description: getFriendlyApiErrorMessage(
						err,
						"Sai email hoặc mật khẩu.",
					),
				});
			},
		});
	}

	return (
		<AuthCard
			title='Đăng nhập'
			description='Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục với workspace của bạn.'
			alternateText='Bạn chưa có tài khoản?'
			alternateHref='/sign-up'
			alternateLabel='Đăng ký'
			googleLabel='Tiếp tục với Google'
		>
			<form
				id='sign-in-form'
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-3.5'
			>
				<FieldGroup className='gap-3.5'>
					<Controller
						name='email'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className='gap-1.5'>
								<FieldLabel htmlFor='sign-in-email' className='text-xs sm:text-sm font-medium text-foreground'>
									Email hoặc tên đăng nhập
								</FieldLabel>
								<Input
									{...field}
									id='sign-in-email'
									aria-invalid={fieldState.invalid}
									className={authInputClassName}
									placeholder='VD: member6 hoặc member6@gmail.com'
									autoComplete='username'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<Controller
						name='password'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className='gap-1.5'>
								<div className='flex items-center justify-between'>
									<FieldLabel htmlFor='sign-in-password' className='text-xs sm:text-sm font-medium text-foreground'>
										Mật khẩu
									</FieldLabel>
									<Link
										href='/forgot-password'
										className='text-xs font-semibold text-primary hover:text-primary/90 hover:underline'
									>
										Quên mật khẩu?
									</Link>
								</div>
								<PasswordInput
									{...field}
									id='sign-in-password'
									aria-invalid={fieldState.invalid}
									className={authInputClassName}
									placeholder='Nhập mật khẩu'
									autoComplete='current-password'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</FieldGroup>

				<div className='pt-1.5'>
					<Button
						type='submit'
						form='sign-in-form'
						className={authSubmitButtonClassName}
						disabled={isPending}
					>
						{isPending ? (
							<div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground' />
						) : (
							<span>Đăng nhập</span>
						)}
					</Button>
				</div>
			</form>
		</AuthCard>
	);
}
