"use client";

import { useParams } from "next/navigation";

import { RowPageView } from "@/widgets/database-view/ui/row-page-view";

export default function RowPage() {
	const params = useParams<{ pageId: string; rowId: string }>();

	return <RowPageView pageId={params.pageId} rowId={params.rowId} />;
}
