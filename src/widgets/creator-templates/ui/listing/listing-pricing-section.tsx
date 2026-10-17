"use client";

import { Gift, Tag } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { formatVnd, type ListingFormValues } from "../../model/listing-form";
import { FieldMessage, ListingSection, OptionCard } from "./listing-primitives";

export function ListingPricingSection({ disabled }: { disabled?: boolean }) {
	const { control, setValue, register, formState } =
		useFormContext<ListingFormValues>();
	const offerType = useWatch({ control, name: "offer_type" });
	const price = useWatch({ control, name: "price" });
	const amount = Number(price);
	const priceField = register("price");

	return (
		<ListingSection
			id='listing-pricing'
			title='Pricing'
			description='Choose whether people get this template for free or pay for it.'
		>
			<div className='grid gap-3 sm:grid-cols-2'>
				<OptionCard
					name='offer_type'
					value='FREE'
					checked={offerType === "FREE"}
					onChange={() =>
						setValue("offer_type", "FREE", {
							shouldDirty: true,
							shouldValidate: formState.isSubmitted,
						})
					}
					title='Free'
					description='Anyone can claim and use it.'
					icon={<Gift className='size-4' />}
					disabled={disabled}
				/>
				<OptionCard
					name='offer_type'
					value='PAID'
					checked={offerType === "PAID"}
					onChange={() =>
						setValue("offer_type", "PAID", {
							shouldDirty: true,
							shouldValidate: formState.isSubmitted,
						})
					}
					title='Paid'
					description='Buyers pay once to get full access.'
					icon={<Tag className='size-4' />}
					disabled={disabled}
				/>
			</div>

			{offerType === "PAID" && (
				<div className='flex flex-col gap-2'>
					<Label htmlFor='listing-price'>Price</Label>
					<div className='flex max-w-sm items-stretch'>
						<Input
							id='listing-price'
							inputMode='numeric'
							placeholder='99000'
							autoComplete='off'
							disabled={disabled}
							aria-invalid={Boolean(formState.errors.price)}
							className='rounded-r-none'
							{...priceField}
							onChange={(event) => {
								event.target.value = event.target.value.replace(/\D/g, "");
								priceField.onChange(event);
							}}
						/>
						<span className='flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground'>
							VND
						</span>
					</div>
					<p className='text-xs text-muted-foreground'>
						{amount > 0
							? `Buyers pay ${formatVnd(amount)}. VND is the only supported currency.`
							: "Whole Vietnamese đồng. VND is the only supported currency."}
					</p>
					<FieldMessage message={formState.errors.price?.message} />
				</div>
			)}
		</ListingSection>
	);
}
