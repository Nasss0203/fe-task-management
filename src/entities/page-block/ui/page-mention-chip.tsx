"use client";

import Link from "next/link";
import { createContext, useContext } from "react";

import type { PageMentionTitles } from "@/entities/page/model/page.types";

export const PageMentionTitlesContext = createContext<
	Partial<PageMentionTitles> | undefined
>(undefined);

export function PageMentionChip({
	pageId,
	pageTitles,
}: {
	pageId: string;
	pageTitles?: Partial<PageMentionTitles>;
}) {
	const contextTitles = useContext(PageMentionTitlesContext);
	const titles = pageTitles ?? contextTitles;
	const page = titles?.[pageId];

	if (page) {
		return (
			<Link
				href={`/page/${page.pageId}`}
				className='rounded-sm bg-accent-soft px-0.5 font-medium text-ring underline-offset-2 hover:underline'
			>
				{page.icon ? `${page.icon} ` : ""}
				{page.title || "Untitled"}
			</Link>
		);
	}

	return (
		<span className='rounded-sm bg-muted px-0.5 font-medium text-muted-foreground'>
			{titles && page === undefined ? "@…" : "No access"}
		</span>
	);
}
