"use client";

import { format } from "date-fns";
import { Receipt, RotateCw } from "lucide-react";
import Link from "next/link";

import {
	useMyTemplatePurchases,
	type TemplatePurchaseStatus,
} from "@/entities/template";
import { formatVnd } from "@/shared/lib/currency";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

const STATUS_LABELS: Record<TemplatePurchaseStatus, string> = {
	PENDING: "Pending",
	PAID: "Paid",
	FAILED: "Failed",
	EXPIRED: "Expired",
	RECONCILIATION_REQUIRED: "Under review",
	REFUNDED: "Refunded",
};

/** The buyer's own template orders, as the backend reports them. */
export function PurchaseHistoryList({ userId }: { userId: string }) {
	const query = useMyTemplatePurchases({ userId });
	const purchases = query.data?.pages.flatMap((page) => page.items) ?? [];

	if (query.isPending) {
		return (
			<div aria-label='Loading purchase history' className='flex flex-col gap-2'>
				{Array.from({ length: 3 }, (_, index) => (
					<Skeleton key={index} className='h-[52px] w-full rounded-xl' />
				))}
			</div>
		);
	}

	if (query.isError && !query.data) {
		return (
			<div role='alert' className='flex flex-col items-center gap-3 py-16 text-center'>
				<p className='text-sm text-muted-foreground'>
					Unable to load your purchase history.
				</p>
				<Button variant='outline' size='sm' onClick={() => query.refetch()}>
					<RotateCw className='size-3.5' />
					Try again
				</Button>
			</div>
		);
	}

	if (purchases.length === 0) {
		return (
			<div className='flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-10 text-center'>
				<span className='flex size-10 items-center justify-center rounded-lg bg-muted'>
					<Receipt className='size-5 text-muted-foreground' />
				</span>
				<p className='text-[13.5px] font-medium leading-5'>No purchases yet</p>
				<p className='max-w-sm text-[13px] leading-5 text-muted-foreground'>
					Paid templates you buy show up here with their order status.
				</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4'>
			<div className='overflow-hidden rounded-xl border bg-card'>
				<ul className='flex flex-col divide-y'>
					{purchases.map((purchase) => (
						<li
							key={purchase.id}
							className='flex flex-col gap-1 px-4 py-2 sm:min-h-[52px] sm:flex-row sm:items-center sm:gap-3'
						>
							<div className='flex min-w-0 flex-1 items-center gap-3'>
								{purchase.templateIcon && (
									<span className='shrink-0 text-base leading-none' aria-hidden='true'>
										{purchase.templateIcon}
									</span>
								)}
								<div className='min-w-0'>
									{purchase.templateName ? (
										<Link
											href={`/dashboard/templates/${purchase.templateId}`}
											className='block truncate text-[13.5px] font-medium leading-5 hover:underline'
										>
											{purchase.templateName}
										</Link>
									) : (
										<span className='block truncate text-[13.5px] font-medium leading-5 text-faint'>
											Unavailable template
										</span>
									)}
									<p className='truncate text-xs leading-[18px] text-faint'>
										{purchase.versionNumber !== null &&
											`v${purchase.versionNumber} · `}
										<time dateTime={purchase.createdAt}>
											{formatDate(purchase.createdAt)}
										</time>
										{` · ${purchase.orderCode}`}
									</p>
								</div>
							</div>
							<div className='flex items-center justify-between gap-3 sm:justify-end'>
								<span className='text-[13.5px] font-medium tabular-nums'>
									{purchase.currency === "VND"
										? formatVnd(purchase.amount)
										: `${purchase.amount} ${purchase.currency}`}
								</span>
								<Badge
									variant={purchase.status === "PAID" ? "default" : "secondary"}
									className='rounded-[10px] px-2 py-0.5 text-[11.5px] font-medium leading-[17px]'
								>
									{STATUS_LABELS[purchase.status] ?? purchase.status}
								</Badge>
							</div>
						</li>
					))}
				</ul>

				{query.hasNextPage && (
					<div className='flex h-[52px] items-center justify-center border-t'>
						<Button
							variant='outline'
							size='sm'
							className='h-[30px] rounded-md px-3 text-[13px]'
							disabled={query.isFetchingNextPage}
							onClick={() => query.fetchNextPage()}
						>
							{query.isFetchingNextPage ? "Loading..." : "Load more"}
						</Button>
					</div>
				)}
			</div>

			{query.isError && (
				<p role='alert' className='text-center text-sm text-destructive'>
					Unable to load more purchases.
				</p>
			)}
		</div>
	);
}

function formatDate(value: string) {
	try {
		return format(new Date(value), "MMM d, yyyy");
	} catch {
		return "Unknown date";
	}
}
