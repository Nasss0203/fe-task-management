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
import { useRegister } from "@/features/auth/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
	email: z
		.string()
		.min(5, "Email phải có ít nhất 5 ký tự.")
		.max(32, "Email không được vượt quá 32 ký tự."),
	username: z
		.string()
		.min(5, "Tên đăng nhập phải có ít nhất 5 ký tự.")
		.max(32, "Tên đăng nhập không được vượt quá 32 ký tự."),
	password: z.string().max(100, "Mật khẩu không được vượt quá 100 ký tự."),
});

const authInputClassName =
	"h-12 rounded-xl border-slate-200 bg-white/85 px-4 shadow-sm focus-visible:border-primary/70 focus-visible:ring-primary/15 dark:border-white/10 dark:bg-white/5";

const submitButtonClassName =
	"h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30";

type ApiErrorResponse = {
	message?: string;
};

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
					position: "bottom-right",
				});
				router.push("/verify-email");
			},
			onError: (err: unknown) => {
				const responseData = (err as AxiosError<ApiErrorResponse>).response
					?.data;

				toast.error("Đăng ký thất bại", {
					description: responseData?.message || "Đã xảy ra lỗi.",
					position: "bottom-right",
				});
			},
		});
	}

	return (
		<AuthCard
			title='Tạo tài khoản mới'
			description='Nhập thông tin của bạn bên dưới để bắt đầu workspace đầu tiên một cách gọn gàng hơn.'
			alternateText='Đã có tài khoản?'
			alternateHref='/sign-in'
			alternateLabel='Đăng nhập'
			googleLabel='Tiếp tục với Google'
		>
			<form
				id='sign-up-form'
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-4'
			>
				<FieldGroup>
					<Controller
						name='email'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor='sign-up-email'>Email</FieldLabel>
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
				</FieldGroup>

				<FieldGroup>
					<Controller
						name='username'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor='sign-up-username'>
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
				</FieldGroup>

				<FieldGroup>
					<Controller
						name='password'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel htmlFor='sign-up-password'>
									Mật khẩu
								</FieldLabel>
								<PasswordInput
									{...field}
									id='sign-up-password'
									aria-invalid={fieldState.invalid}
									className={authInputClassName}
									placeholder='Nhập mật khẩu'
									autoComplete='new-password'
								/>
								{fieldState.invalid && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
				</FieldGroup>

				<Field orientation='horizontal' className='pt-2'>
					<Button
						type='submit'
						form='sign-up-form'
						size='lg'
						className={submitButtonClassName}
						disabled={isPending}
					>
						{isPending ? (
							<div className='h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/35 border-t-white' />
						) : (
							<span>Đăng ký</span>
						)}
					</Button>
				</Field>
			</form>
		</AuthCard>
	);
}
