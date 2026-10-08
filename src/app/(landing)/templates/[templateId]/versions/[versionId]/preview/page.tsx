"use client";

import { useTemplatePreviewStore } from "@/features/template-preview/model/template-preview.store";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { usePublicTemplatePreview } from "@/entities/template/model/template.queries";
import { TemplateSnapshotRenderer } from "@/features/template-preview/ui/template-snapshot-renderer";

export default function PublicTemplatePreviewPage() {
	const params = useParams<{
		templateId: string;
		versionId: string;
	}>();

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
	const reset = useTemplatePreviewStore((state) => state.reset);
	useEffect(() => {
		if (snapshot) initialize(params.templateId, params.versionId, snapshot);
	}, [snapshot, params.templateId, params.versionId, initialize]);
	// Keep the session in memory on unmount so navigation Back retains local changes.
	if (isLoading || (snapshot && !preview)) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
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
				className='flex min-h-screen flex-col items-center justify-center gap-4'
			>
				<p className='text-sm text-muted-foreground'>
					{axios.isAxiosError(error) && error.response?.status === 404
						? "Template preview not found."
						: "Unable to load template preview."}
				</p>
				<Link
					href='/templates'
					className='text-sm text-primary underline'
				>
					Back to templates
				</Link>
			</div>
		);
	}

	return (
		<div className='min-h-screen w-full min-w-0 bg-background text-foreground'>
			<div className='flex items-center justify-between border-b border-border px-6 py-3 text-sm'>
				<Link
					href='/templates'
					className='text-muted-foreground hover:text-foreground'
				>
					Back to templates
				</Link>
				<div className='flex items-center gap-3'>
					<span className='text-muted-foreground'>Preview mode</span>
					<button
						type='button'
						onClick={reset}
						className='text-muted-foreground hover:text-foreground'
					>
						Reset preview
					</button>
				</div>
			</div>
			<TemplateSnapshotRenderer
				template={preview.template}
				blocks={preview.blocks}
				databases={preview.databases}
				mode='preview'
				onDatabaseValueChange={setRowValue}
				onDatabaseViewChange={setDatabaseView}
				onTodoCheckedChange={setTodoChecked}
			/>
		</div>
	);
}
