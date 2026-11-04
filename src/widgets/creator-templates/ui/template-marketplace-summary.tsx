"use client";

import axios from "axios";
import { format } from "date-fns";
import { ExternalLink, Plus, RotateCw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
	useTemplateListing,
	type PageTemplate,
	type TemplateVersion,
} from "@/entities/template";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

import { formatVnd, isLimitedDemoConfig } from "../model/listing-form";
import {
	getListingState,
	LISTING_STATE_PRESENTATION,
} from "../model/listing-state";

interface TemplateMarketplaceSummaryProps {
	template: PageTemplate;
	versions: TemplateVersion[];
}

export function TemplateMarketplaceSummary({
	template,
	versions,
}: TemplateMarketplaceSummaryProps) {
	const { data: listing, isPending, error, refetch } = useTemplateListing(
		template.id,
	);
	const notListed = axios.isAxiosError(error) && error.response?.status === 404;

	if (isPending && !notListed) {
		return <Skeleton className='h-56 w-full rounded-xl' />;
	}

	if (error && !notListed) {
		return (
			<div className='flex flex-col items-center gap-3 rounded-xl border px-6 py-10 text-center'>
				<p className='text-sm text-muted-foreground'>
					We couldn&apos;t load the marketplace listing.
				</p>
				<Button variant='outline' size='sm' onClick={() => refetch()}>
					<RotateCw className='size-3.5' />
					Try again
				</Button>
			</div>
		);
	}

	const currentListing = notListed ? null : listing;
	const state = getListingState(template, currentListing);
	const presentation = LISTING_STATE_PRESENTATION[state];
	const releasedVersion = versions.find(
		(version) => version.id === currentListing?.published_version_id,
	);
	const isArchived = template.status === "ARCHIVED";

	return (
		<section className='flex flex-col gap-4 rounded-[12px] border bg-card p-4'>
			<div className='flex flex-wrap items-center gap-2.5'>
				<h2 className='text-[14px] font-semibold'>Marketplace listing</h2>
				<span className='inline-flex items-center gap-1.5 text-[13px] text-muted-foreground'>
					<span className={cn("size-[7px] rounded-full", presentation.dot)} />
					{presentation.label}
				</span>

				<div className='ml-auto flex flex-wrap items-center gap-2'>
					{state === "LIVE" && (
						<Button asChild variant='ghost' size='sm'>
							<Link href={`/templates/${template.id}`} target='_blank'>
								<ExternalLink className='size-3.5' />
								View public page
							</Link>
						</Button>
					)}
					{isArchived ? (
						<Button
							variant={currentListing ? "outline" : "default"}
							size='sm'
							disabled
						>
							{!currentListing && <Plus className='size-3.5' />}
							{currentListing ? "Edit listing" : "Set up listing"}
						</Button>
					) : (
						<Button
							asChild
							variant={currentListing ? "outline" : "default"}
							size='sm'
						>
							<Link href={`/creator/templates/${template.id}/listing`}>
								{!currentListing && <Plus className='size-3.5' />}
								{currentListing ? "Edit listing" : "Set up listing"}
							</Link>
						</Button>
					)}
				</div>
			</div>

			<dl className='grid grid-cols-2 gap-4 text-sm sm:grid-cols-4'>
				<Fact label='Marketplace version'>
					{releasedVersion ? `v${releasedVersion.version_number}` : "—"}
				</Fact>
				<Fact label='Price'>
					{!currentListing
						? "—"
						: currentListing.offer_type === "PAID"
							? formatVnd(currentListing.price_amount ?? 0)
							: "Free"}
				</Fact>
				<Fact label='Preview'>
					{currentListing?.preview_mode === "IMAGE"
						? "Screenshot"
						: currentListing?.preview_mode === "INTERACTIVE"
							? isLimitedDemoConfig(currentListing.demo_config)
								? "Limited demo"
								: "Live demo"
							: "—"}
				</Fact>
				<Fact label='Listed on'>
					{currentListing?.published_at
						? format(new Date(currentListing.published_at), "MMM d, yyyy")
						: "—"}
				</Fact>
			</dl>

			<p className='text-[12.5px] text-muted-foreground/80'>
				Publishing a version only locks a snapshot. Buyers get a version after
				you release it to the marketplace.
			</p>
		</section>
	);
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className='flex flex-col gap-0.5'>
			<dt className='text-[12px] text-muted-foreground'>{label}</dt>
			<dd className='text-[14px] font-medium'>{children}</dd>
		</div>
	);
}
