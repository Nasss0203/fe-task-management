import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface TemplateErrorStateProps {
	onRetry: () => void;
	message?: string;
}

export function TemplateErrorState({
	onRetry,
	message = "Unable to load templates.",
}: TemplateErrorStateProps) {
	return (
		<div className='col-span-full flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-destructive/20 bg-destructive/5'>
			<div className='flex items-center justify-center size-12 rounded-xl bg-destructive/10 text-destructive mb-3.5'>
				<AlertCircle className='size-6' />
			</div>
			<h3 className='text-base font-semibold text-foreground'>
				{message}
			</h3>
			<p className='text-xs text-muted-foreground mt-1 max-w-sm'>
				Something went wrong while retrieving templates from the server. Please try again.
			</p>
			<Button
				variant='outline'
				size='sm'
				onClick={onRetry}
				className='mt-4 rounded-lg text-xs gap-1.5'
			>
				<RefreshCw className='size-3.5' />
				Try again
			</Button>
		</div>
	);
}
