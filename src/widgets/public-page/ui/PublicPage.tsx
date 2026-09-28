import type { PublicSitePage } from "@/entities/public-site/model/public-site.types";
import { Skeleton } from "@/shared/ui/skeleton";

import { PublicPageBlockList } from "./PublicPageBlockList";

interface PublicPageProps {
	publicSite: PublicSitePage;
}

export function PublicPage({ publicSite }: PublicPageProps) {
	const { page, blocks } = publicSite;

	return (
		<article className='w-full min-w-0'>
			{page.cover_url ? (
				<div className='h-56 w-full overflow-hidden sm:h-72'>
					{/* Public cover URLs can use arbitrary backend-approved hosts. */}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={page.cover_url}
						alt=''
						className='h-full w-full object-cover'
					/>
				</div>
			) : null}

			<div className='mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 lg:px-12'>
				<header className='space-y-4'>
					{page.icon ? (
						<div className='text-5xl leading-none' aria-hidden='true'>
							{page.icon}
						</div>
					) : null}

					<h1 className='break-words text-4xl font-bold tracking-tight sm:text-5xl'>
						{page.title || "Untitled"}
					</h1>
				</header>

				<div className='mt-12'>
					<PublicPageBlockList blocks={blocks} />
				</div>
			</div>
		</article>
	);
}

export function PublicPageSkeleton() {
	return (
		<div
			className='mx-auto w-full max-w-4xl space-y-10 px-6 py-12 sm:px-10 lg:px-12'
			role='status'
			aria-label='Loading public page'
		>
			<div className='space-y-4'>
				<Skeleton className='size-12 rounded-lg' />
				<Skeleton className='h-11 w-3/5 max-w-lg' />
			</div>
			<div className='space-y-3'>
				<Skeleton className='h-5 w-full' />
				<Skeleton className='h-5 w-11/12' />
				<Skeleton className='h-5 w-4/5' />
			</div>
		</div>
	);
}
