"use client";

import { isAxiosError } from "axios";
import { useParams } from "next/navigation";

import { usePublicPage } from "@/entities/public-site/model/public-site.queries";
import { Button } from "@/shared/ui/button";
import {
	PublicPage,
	PublicPageSkeleton,
} from "@/widgets/public-page/ui/PublicPage";

function PublicPageNotFound() {
	return (
		<section className='flex min-h-screen items-center justify-center px-6 text-center'>
			<div className='space-y-2'>
				<h1 className='text-2xl font-semibold'>Page not found</h1>
				<p className='text-sm text-muted-foreground'>
					The page may be unavailable or no longer published.
				</p>
			</div>
		</section>
	);
}

export default function PublicSiteRoute() {
	const params = useParams<{
		subdomain: string;
		path?: string[];
	}>();

	const resolvedPath =
		!params.path || params.path.length === 0
			? "/"
			: `/${params.path.join("/")}`;

	const publicPageQuery = usePublicPage(params.subdomain, resolvedPath);

	if (publicPageQuery.isPending) {
		return <PublicPageSkeleton />;
	}

	if (publicPageQuery.isError) {
		if (
			isAxiosError(publicPageQuery.error) &&
			publicPageQuery.error.response?.status === 404
		) {
			return <PublicPageNotFound />;
		}

		return (
			<section className='flex min-h-screen items-center justify-center px-6 text-center'>
				<div className='space-y-4'>
					<div className='space-y-2'>
						<h1 className='text-2xl font-semibold'>
							Unable to load this page.
						</h1>
						<p className='text-sm text-muted-foreground'>
							Check your connection and try again.
						</p>
					</div>

					<Button
						type='button'
						variant='outline'
						disabled={publicPageQuery.isFetching}
						onClick={() => void publicPageQuery.refetch()}
					>
						{publicPageQuery.isFetching ? "Retrying..." : "Try again"}
					</Button>
				</div>
			</section>
		);
	}

	if (!publicPageQuery.data) {
		return <PublicPageNotFound />;
	}

	return <PublicPage publicSite={publicPageQuery.data} />;
}
