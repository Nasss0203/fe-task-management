"use client";

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
import { useRegister } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
	email: z
		.string()
		.min(5, "Bug title must be at least 5 characters.")
		.max(32, "Bug title must be at most 32 characters."),
	username: z
		.string()
		.min(5, "Bug title must be at least 5 characters.")
		.max(32, "Bug title must be at most 32 characters."),
	password: z
		.string()
		// .min(20, "Description must be at least 20 characters.")
		.max(100, "Description must be at most 100 characters."),
});
const SignUp = () => {
	const { mutate } = useRegister();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			username: "",
			password: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		toast("You submitted the following values:", {
			description: (
				<pre className='bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4'>
					<code>{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
			position: "bottom-right",
			classNames: {
				content: "flex flex-col gap-2",
			},
			style: {
				"--border-radius": "calc(var(--radius)  + 4px)",
			} as React.CSSProperties,
		});
		mutate(data);
	}
	return (
		<div className='w-125  flex items-center'>
			<Card className='w-full sm:max-w-md '>
				<CardHeader className='mt-10'>
					<CardTitle className='text-2xl'>
						Create your account
					</CardTitle>
					<CardDescription>
						Enter your details below to create your account
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
								name='username'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor='form-rhf-demo-title'>
											Username
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

						<Field orientation='horizontal'>
							<Button
								type='submit'
								form='form-rhf-demo'
								className='w-full'
							>
								Đăng ký
							</Button>
						</Field>
					</form>
					<div className='flex items-center gap-1 justify-center mt-6 text-xs'>
						<div className='text-neutral-500'>{`Already have an account?`}</div>
						<Link href={"/sign-in"} className='hover:underline'>
							Sign In
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
								Sign up with Apple
							</Button>
							<Button className='flex items-center gap-1.5 flex-1 text-xs'>
								<FcGoogle size={16} />
								Sign up with Google
							</Button>
						</div>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default SignUp;
