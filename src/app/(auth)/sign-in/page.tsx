"use client";

import GoogleLoginButton from "@/components/button/GoogleLoginButton";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLogin } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { FaApple } from "react-icons/fa";
import z from "zod";

const formSchema = z.object({
	email: z
		.string()
		.min(5, "Bug title must be at least 5 characters.")
		.max(32, "Bug title must be at most 32 characters."),
	password: z
		.string()
		// .min(20, "Description must be at least 20 characters.")
		.max(100, "Description must be at most 100 characters."),
});
const SignIn = () => {
	const { user, setUser } = useUser();
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "user11@gmail.com",
			password: "1234567890",
		},
	});

	const { mutate, isPending } = useLogin();

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutate(data, {
			onSuccess: (res) => {
				// if (user?.email && user.isActive && user.username) {
				// 	router.push(`/dashboard`);
				// }
			},
		});
	}
	return (
		<div className='w-125  flex items-center'>
			<Card className='w-full sm:max-w-md '>
				<CardHeader className='mt-10'>
					<CardTitle className='text-2xl'>
						Sign in to your account
					</CardTitle>
					<CardDescription>
						Welcome back! Please enter your details.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						id='form-rhf-demo'
						onSubmit={form.handleSubmit(onSubmit)}
						className='flex flex-col gap-5'
					>
						<FieldGroup>
							<Controller
								name='email'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor='form-rhf-demo-title'>
											Email
										</FieldLabel>
										<Input
											{...field}
											id='form-rhf-demo-title'
											aria-invalid={fieldState.invalid}
											placeholder='Login button not working on mobile'
											autoComplete='off'
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
						<FieldGroup>
							<Controller
								name='password'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor='form-rhf-demo-title'>
											Password
										</FieldLabel>
										<Input
											{...field}
											id='form-rhf-demo-title'
											aria-invalid={fieldState.invalid}
											placeholder='Login button not working on mobile'
											autoComplete='off'
											type='password'
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
						<Field
							orientation='horizontal'
							className='flex items-center justify-between'
						>
							<div></div>
							<div className='text-xs hover:underline cursor-pointer'>
								Forgot password?
							</div>
						</Field>
						<Field orientation='horizontal'>
							<Button
								type='submit'
								form='form-rhf-demo'
								className={`w-full ${isPending ? "disabled:bg-neutral-500" : ""}`}
								disabled={isPending ? true : false}
							>
								{isPending ? (
									<div className='h-6 w-6 border-[3px] border-neutral-600 border-t-black rounded-full animate-spin'></div>
								) : (
									<span>Đăng nhập</span>
								)}
							</Button>
						</Field>
					</form>
					<div className='flex items-center gap-1 justify-center mt-6 text-xs'>
						<div className='text-neutral-500'>{`You don't have account?`}</div>
						<Link href={"/sign-up"} className='hover:underline'>
							Sign up
						</Link>
					</div>
				</CardContent>
				<CardFooter className='flex-col gap-5 mb-5'>
					<div className='flex items-center gap-3 w-full'>
						<Separator className='flex-1' />
						<span className='text-xs text-neutral-400 whitespace-nowrap'>
							Or continue with
						</span>
						<Separator className='flex-1' />
					</div>
					<div className='w-full '>
						<div className='flex items-center gap-2 justify-between'>
							<Button className='flex items-center gap-1.5 flex-1 text-xs'>
								<FaApple />
								Sign in with Apple
							</Button>
							<GoogleLoginButton></GoogleLoginButton>
						</div>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default SignIn;
