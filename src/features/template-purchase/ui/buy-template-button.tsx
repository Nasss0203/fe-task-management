"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";

import {
	PurchaseUnderReviewError,
	useBuyTemplate,
} from "../model/use-buy-template";

interface BuyTemplateButtonProps {
	templateId: string;
	userId: string;
	priceLabel: string;
	className?: string;
}

export function BuyTemplateButton({
	templateId,
	userId,
	priceLabel,
	className,
}: BuyTemplateButtonProps) {
	const pathname = usePathname();
	const { buy, isPending, error } = useBuyTemplate();

	const errorMessage = error
		? error instanceof PurchaseUnderReviewError
			? error.message
			: getApiErrorMessage(error, "Couldn't start checkout. Please try again.")
		: null;

	useEffect(() => {
		if (errorMessage) toast.error(errorMessage);
	}, [errorMessage]);

	return (
		<div className='flex flex-col gap-2'>
			<Button
				size='lg'
				className={className}
				disabled={isPending}
				aria-busy={isPending}
				onClick={() => buy({ templateId, userId, returnPath: pathname })}
			>
				{isPending ? (
					<Loader2 className='mr-2 size-4 animate-spin' aria-hidden />
				) : (
					<ShoppingCart className='mr-2 size-4' aria-hidden />
				)}
				{isPending ? "Redirecting to checkout…" : `Buy template — ${priceLabel}`}
			</Button>
			{errorMessage && (
				<p role='alert' className='text-center text-xs text-destructive'>
					{errorMessage}
				</p>
			)}
		</div>
	);
}
