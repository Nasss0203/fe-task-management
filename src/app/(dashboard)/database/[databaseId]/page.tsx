"use client";

import NextLink from "next/link";
import { useParams } from "next/navigation";

import { useDatabase } from "@/entities/database/model/database.queries";
import { usePage } from "@/entities/page/model/page.queries";
import { PageContent, PageHeader } from "@/entities/page/ui/page-surface";

import { DatabaseViewBlock } from "@/widgets/database-view/ui/database-view-block";

export default function DatabaseDetail() {
	const params = useParams<{
		databaseId: string;
	}>();

	const { data: database } = useDatabase(params.databaseId);

	const { data: page } = usePage(database?.pageId);

	return (
		<div className='w-full min-w-0'>
			<PageHeader icon='🗃️' title={database?.name} />

			{page && (
				<div className='truncate px-12 text-sm text-muted-foreground md:px-16 lg:px-24'>
					In{" "}
					<NextLink
						href={`/page/${page.id}`}
						className='text-foreground underline-offset-4 hover:underline'
					>
						{page.icon || "📄"} {page.title || "Untitled"}
					</NextLink>
				</div>
			)}

			<PageContent>
				<DatabaseViewBlock databaseId={params.databaseId} />
			</PageContent>
		</div>
	);
}
