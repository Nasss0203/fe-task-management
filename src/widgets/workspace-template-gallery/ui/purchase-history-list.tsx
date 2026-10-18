"use client";

import { format } from "date-fns";
import { FileText, Receipt, RotateCw } from "lucide-react";
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
					<Skeleton key={index} className='h-16 w-full rounded-xl' />
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
			<div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center'>
				<span className='flex size-11 items-center justify-center rounded-xl bg-muted'>
					<Receipt className='size-5 text-muted-foreground' />
				</span>
				<p className='text-sm font-medium'>No purchases yet</p>
				<p className='max-w-sm text-sm text-muted-foreground'>
					Paid templates you buy show up here with their order status.
				</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4'>
			<ul className='flex flex-col divide-y rounded-xl border'>
				{purchases.map((purchase) => (
					<li
						key={purchase.id}
						className='flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4'
					>
						<div className='flex min-w-0 flex-1 items-center gap-3'>
							<span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg'>
								{purchase.templateIcon ?? (
									<FileText className='size-4 text-muted-foreground' />
								)}
							</span>
							<div className='min-w-0'>
								{purchase.templateName ? (
									<Link
										href={`/dashboard/templates/${purchase.templateId}`}
										className='block truncate text-sm font-medium hover:underline'
									>
										{purchase.templateName}
									</Link>
								) : (
									<span className='block truncate text-sm font-medium text-muted-foreground'>
										Unavailable template
									</span>
								)}
								<p className='truncate text-xs text-muted-foreground'>
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
							<span className='text-sm font-medium tabular-nums'>
								{purchase.currency === "VND"
									? formatVnd(purchase.amount)
									: `${purchase.amount} ${purchase.currency}`}
							</span>
							<Badge variant={purchase.status === "PAID" ? "default" : "secondary"}>
								{STATUS_LABELS[purchase.status] ?? purchase.status}
							</Badge>
						</div>
					</li>
				))}
			</ul>

			{query.isError && (
				<p role='alert' className='text-center text-sm text-destructive'>
					Unable to load more purchases.
				</p>
			)}
			{query.hasNextPage && (
				<Button
					variant='outline'
					size='sm'
					className='self-center'
					disabled={query.isFetchingNextPage}
					onClick={() => query.fetchNextPage()}
				>
					{query.isFetchingNextPage ? "Loading..." : "Load more"}
				</Button>
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
