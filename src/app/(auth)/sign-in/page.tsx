"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLogin, useResendVerification } from "@/features/auth/hooks/useAuth";
import {
	getApiErrorCode,
	getFriendlyApiErrorMessage,
} from "@/lib/api-error-message";
import { SystemRole } from "@/services/auth/type";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { formSchema } from "@/features/auth/schemas/sign-in.schema";
import z from "zod";

const authInputClassName =
	"h-12 rounded-xl border-slate-200 bg-white/85 px-4 shadow-sm focus-visible:border-primary/70 focus-visible:ring-primary/15 dark:border-white/10 dark:bg-white/5";

const submitButtonClassName =
	"h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30";

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
			onSuccess: (userData) => {
				if (userData.systemRole === SystemRole.USER) {
					router.push("/dashboard");
				} else if (
					userData.systemRole === SystemRole.SYSTEM_ADMIN ||
					userData.systemRole === SystemRole.SUPER_ADMIN
				) {
					router.push("/admin");
				} else {
					router.push("/dashboard");
				}
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
			title='Đăng nhập vào tài khoản'
			description='Chào mừng trở lại! Vui lòng nhập thông tin để tiếp tục với workspace của bạn.'
			alternateText='Bạn chưa có tài khoản?'
			alternateHref='/sign-up'
			alternateLabel='Đăng ký'
			googleLabel='Tiếp tục với Google'
		>
			<form
				id='sign-in-form'
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-4'
			>
				<FieldGroup>
					<Controller
						name='email'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor='sign-in-email'>
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
				</FieldGroup>

				<FieldGroup>
					<Controller
						name='password'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor='sign-in-password'>
									Mật khẩu
								</FieldLabel>
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

				<Field
					orientation='horizontal'
					className='justify-end pt-1'
				>
					<Link
						href='/forgot-password'
						className='text-sm font-medium text-primary hover:text-primary/80 hover:underline'
					>
						Quên mật khẩu?
					</Link>
				</Field>

				<Field orientation='horizontal' className='pt-2'>
					<Button
						type='submit'
						form='sign-in-form'
						size='lg'
						className={submitButtonClassName}
						disabled={isPending}
					>
						{isPending ? (
							<div className='h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/35 border-t-white' />
						) : (
							<span>Đăng nhập</span>
						)}
					</Button>
				</Field>
			</form>
		</AuthCard>
	);
}
