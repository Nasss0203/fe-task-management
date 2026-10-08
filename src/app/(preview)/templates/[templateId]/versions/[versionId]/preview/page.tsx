"use client";

import { useTemplatePreviewStore } from "@/features/template-preview/model/template-preview.store";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { usePublicTemplatePreview } from "@/entities/template/model/template.queries";
import { useUser } from "@/features/auth";
import { TemplateSnapshotRenderer } from "@/features/template-preview/ui/template-snapshot-renderer";
import { Button } from "@/shared/ui/button";

export default function PublicTemplatePreviewPage() {
	const params = useParams<{
		templateId: string;
		versionId: string;
	}>();

	const { user } = useUser();
	const ctaHref = user ? "/dashboard" : "/sign-up";

	const {
		data: snapshot,
		isLoading,
		isError,
		error,
	} = usePublicTemplatePreview(params.templateId, params.versionId);
	const setTodoChecked = useTemplatePreviewStore(
		(state) => state.setTodoChecked,
	);

	const sessionKey = `${params.templateId}:${params.versionId}`;
	const preview = useTemplatePreviewStore((state) =>
		state.sessionKey === sessionKey ? state.preview : null,
	);
	const initialize = useTemplatePreviewStore((state) => state.initialize);
	const setRowValue = useTemplatePreviewStore((state) => state.setRowValue);
	const setDatabaseView = useTemplatePreviewStore(
		(state) => state.setDatabaseView,
	);

	useEffect(() => {
		if (snapshot) initialize(params.templateId, params.versionId, snapshot);
	}, [snapshot, params.templateId, params.versionId, initialize]);

	// Keep the session in memory on unmount so navigation Back retains local changes.
	if (isLoading || (snapshot && !preview)) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-background'>
				<p className='text-sm text-muted-foreground'>
					Loading template preview...
				</p>
			</div>
		);
	}

	if (isError || !preview) {
		return (
			<div
				role='alert'
				className='flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center'
			>
				<p className='text-sm text-muted-foreground'>
					{axios.isAxiosError(error) && error.response?.status === 404
						? "Template preview not found."
						: "Unable to load template preview."}
				</p>
				<Link
					href={`/templates/${params.templateId}`}
					className='text-sm text-primary underline'
				>
					Back to template
				</Link>
			</div>
		);
	}

	return (
		<div className='min-h-screen w-full min-w-0 bg-background text-foreground'>
			{/* Immersive document header toolbar - independent marketplace shell */}
			<header className='sticky top-0 z-30 w-full border-b border-border/70 bg-background/95 backdrop-blur-xs'>
				<div className='flex h-14 w-full items-center justify-between px-6 sm:px-8 lg:px-12'>
					<Link
						href={`/templates/${params.templateId}`}
						className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
					>
						<ArrowLeft className='size-4' />
						Back to template
					</Link>

					<Link href={ctaHref}>
						<Button size='sm' className='h-9 rounded-lg px-4 font-medium shadow-xs'>
							Use template
						</Button>
					</Link>
				</div>
			</header>

			{/* Outer document canvas */}
			<main className='w-full min-w-0 pb-24'>
				<TemplateSnapshotRenderer
					template={preview.template}
					blocks={preview.blocks}
					databases={preview.databases}
					mode='preview'
					onDatabaseValueChange={setRowValue}
					onDatabaseViewChange={setDatabaseView}
					onTodoCheckedChange={setTodoChecked}
				/>
			</main>
		</div>
	);
}
