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
import { useRegister } from "../model/use-auth";
import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
	email: z
		.string()
		.email("Email không hợp lệ.")
		.min(5, "Email phải có ít nhất 5 ký tự.")
		.max(32, "Email không được vượt quá 32 ký tự."),
	username: z
		.string()
		.min(5, "Tên đăng nhập phải có ít nhất 5 ký tự.")
		.max(32, "Tên đăng nhập không được vượt quá 32 ký tự."),
	password: z
		.string()
		.min(6, "Mật khẩu phải có ít nhất 6 ký tự.")
		.max(100, "Mật khẩu không được vượt quá 100 ký tự."),
});

export default function SignUp() {
	const router = useRouter();
	const { mutate, isPending } = useRegister();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			username: "",
			password: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutate(data, {
			onSuccess: () => {
				toast.success("Đăng ký thành công!", {
					description:
						"Vui lòng kiểm tra email của bạn để xác minh tài khoản.",
				});
				router.push("/verify-email");
			},
			onError: (err: unknown) => {
				toast.error("Đăng ký thất bại", {
					description: getFriendlyApiErrorMessage(
						err,
						"Không thể đăng ký tài khoản. Vui lòng kiểm tra lại thông tin.",
					),
				});
			},
		});
	}

	return (
		<AuthCard
			title='Tạo tài khoản mới'
			description='Nhập thông tin bên dưới để bắt đầu workspace của bạn.'
			alternateText='Đã có tài khoản?'
			alternateHref='/sign-in'
			alternateLabel='Đăng nhập'
			googleLabel='Tiếp tục với Google'
		>
			<form
				id='sign-up-form'
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-3.5'
			>
				<FieldGroup className='gap-3.5'>
					<Controller
						name='email'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className='gap-1.5'>
								<FieldLabel htmlFor='sign-up-email' className='text-xs sm:text-sm font-medium text-foreground'>
									Email
								</FieldLabel>
								<Input
									{...field}
									id='sign-up-email'
									type='email'
									aria-invalid={fieldState.invalid}
									className={authInputClassName}
									placeholder='VD: user@example.com'
									autoComplete='email'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>

					<Controller
						name='username'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className='gap-1.5'>
								<FieldLabel htmlFor='sign-up-username' className='text-xs sm:text-sm font-medium text-foreground'>
									Tên đăng nhập
								</FieldLabel>
								<Input
									{...field}
									id='sign-up-username'
									aria-invalid={fieldState.invalid}
									className={authInputClassName}
									placeholder='VD: username123'
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
								<FieldLabel htmlFor='sign-up-password' className='text-xs sm:text-sm font-medium text-foreground'>
									Mật khẩu
								</FieldLabel>
								<PasswordInput
									{...field}
									id='sign-up-password'
									aria-invalid={fieldState.invalid}
									className={authInputClassName}
									placeholder='Nhập mật khẩu (tối thiểu 6 ký tự)'
									autoComplete='new-password'
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
						form='sign-up-form'
						className={authSubmitButtonClassName}
						disabled={isPending}
					>
						{isPending ? (
							<div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground' />
						) : (
							<span>Đăng ký</span>
						)}
					</Button>
				</div>
			</form>
		</AuthCard>
	);
}
