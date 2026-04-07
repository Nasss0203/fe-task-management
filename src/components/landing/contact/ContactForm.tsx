"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { companySizes } from "./contact-data";

export default function ContactForm() {
	const [agree, setAgree] = useState(false);

	return (
		<div className='rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-md md:p-8'>
			<div className='mb-8 space-y-2'>
				<h2 className='text-2xl font-bold leading-tight text-white'>
					Fill out this quick form and we&apos;ll get back to you
					shortly
				</h2>
			</div>

			<form className='space-y-6'>
				<div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-200'>
							First Name
						</label>
						<Input
							placeholder='ex: Robbi'
							className='h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-gray-400'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-200'>
							Last Name
						</label>
						<Input
							placeholder='ex: Darwis'
							className='h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-gray-400'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-200'>
							Company Email
						</label>
						<Input
							type='email'
							placeholder='ex: robbi@taskmanly.com'
							className='h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-gray-400'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-200'>
							Phone Number
						</label>
						<Input
							placeholder='ex: 085623726281'
							className='h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-gray-400'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-200'>
							Country
						</label>
						<Input
							placeholder='ex: Indonesia'
							className='h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-gray-400'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium text-gray-200'>
							Company Size
						</label>

						<div className='relative'>
							<select className='h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white outline-none transition focus:border-violet-500'>
								<option
									value=''
									className='bg-[#0b0b12] text-white'
								>
									Select
								</option>
								{companySizes.map((size) => (
									<option
										key={size}
										value={size}
										className='bg-[#0b0b12] text-white'
									>
										{size}
									</option>
								))}
							</select>

							<ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
						</div>
					</div>
				</div>

				<div className='space-y-2'>
					<label className='text-sm font-medium text-gray-200'>
						What topic are you interested in exploring?
					</label>
					<Textarea
						placeholder='Enter your message'
						className='min-h-[140px] resize-none rounded-xl border-white/10 bg-white/5 text-white placeholder:text-gray-400'
					/>
				</div>

				<div className='flex items-start gap-3'>
					<input
						id='terms'
						type='checkbox'
						checked={agree}
						onChange={(e) => setAgree(e.target.checked)}
						className='mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-violet-600'
					/>

					<label
						htmlFor='terms'
						className='text-sm leading-6 text-gray-300'
					>
						By checking the box you agree to our{" "}
						<span className='font-medium text-violet-400 underline underline-offset-2'>
							Terms of Service
						</span>{" "}
						and{" "}
						<span className='font-medium text-violet-400 underline underline-offset-2'>
							Privacy Policy
						</span>
						.
					</label>
				</div>

				<Button
					type='submit'
					className='h-12 w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700'
				>
					Submit
				</Button>
			</form>
		</div>
	);
}
