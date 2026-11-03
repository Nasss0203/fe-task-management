"use client";

import { ClipboardList, ExternalLink, Eye, ListPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { useAddDatabaseProperty } from "@/entities/database/model/database.mutations";
import { useDatabase } from "@/entities/database/model/database.queries";
import type {
	DatabaseProperty,
	FormDatabase,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { getDatabaseViewConfig } from "@/entities/page-block/lib/get-database-view-config";
import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { useSharedPageBlocks } from "@/entities/page-block/model/page-block.queries";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	usePage,
	useWorkspaceDatabases,
} from "@/entities/page/model/page.queries";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { ReadOnlyPageBlockRenderer } from "@/widgets/page-block/ui/read-only-page-block-renderer";

import {
	FORM_PROPERTY_TYPES,
	getFormField,
	NEW_QUESTION_TYPES,
	nextColumnName,
	type SectionForm,
} from "../lib/form-config";
import { FormFill } from "./form-fill";

export { useFormDatabase } from "./form-fill";

const HOVER_BUTTON =
	"flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 group-hover/section:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100";

function DatabaseOption({
	databaseId,
	name,
	pageId,
	selected,
	onPick,
}: {
	databaseId: string;
	name?: string;
	pageId?: string;
	selected: boolean;
	onPick: () => void;
}) {
	const { data } = useDatabase(databaseId, !name);
	const { data: page } = usePage(pageId, Boolean(pageId));

	return (
		<button
			type='button'
			aria-pressed={selected}
			onClick={onPick}
			className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted aria-pressed:bg-muted'
		>
			<ClipboardList className='size-4 shrink-0 text-muted-foreground' />
			<span className='truncate'>{name ?? data?.name ?? "Database"}</span>
			{page && (
				<span className='ml-auto truncate text-xs text-muted-foreground'>
					{page.title}
				</span>
			)}
		</button>
	);
}

export function SectionFormSettings({
	block,
	form,
	hasQuestions,
	shareToken,
}: {
	block: PageBlockNode;
	form: SectionForm | null;
	hasQuestions: boolean;
	shareToken?: string;
}) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const updateBlock = useUpdatePageBlock(shareToken);
	const sharedBlocks = useSharedPageBlocks(
		block.page_id,
		shareToken,
		Boolean(shareToken),
	);
	const { data: page } = usePage(block.page_id, !shareToken);
	const { data: workspaceDatabases = [] } = useWorkspaceDatabases(
		page?.workspace_id,
		!shareToken,
	);
	// A share link only reaches this page, so it can't list the workspace.
	const sharedDatabaseIds = [
		...new Set(
			(sharedBlocks.data ?? []).flatMap((item) => {
				const config = getDatabaseViewConfig(item);
				return config && !item.deleted_at ? [config.database_id] : [];
			}),
		),
	];
	const databases = workspaceDatabases
		.filter((item) =>
			item.name.toLowerCase().includes(search.trim().toLowerCase()),
		)
		.sort(
			(a, b) =>
				Number(b.pageId === block.page_id) - Number(a.pageId === block.page_id),
		);

	const saveForm = (next: SectionForm | null) =>
		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			dataConfig: { ...block.data_config, form: next },
		});

	const pickDatabase = (databaseId: string) => {
		if (form?.database_id === databaseId) return;

		saveForm({
			database_id: databaseId,
			submit_label: form?.submit_label,
			success_message: form?.success_message,
		});
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label='Form settings'
					className={HOVER_BUTTON}
				>
					<ClipboardList className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent side='bottom' align='end' className='w-72 space-y-3 p-3'>
				<div>
					<p className='text-sm font-medium'>Form</p>
					<p className='text-xs text-muted-foreground'>
						Answers become rows of this database. Anyone who can open its page
						can read them.
					</p>
				</div>

				{shareToken ? (
					<div className='max-h-56 space-y-0.5 overflow-y-auto'>
						{sharedDatabaseIds.map((databaseId) => (
							<DatabaseOption
								key={databaseId}
								databaseId={databaseId}
								selected={form?.database_id === databaseId}
								onPick={() => pickDatabase(databaseId)}
							/>
						))}
					</div>
				) : (
					<>
						<Input
							value={search}
							placeholder='Find a database'
							aria-label='Find a database'
							onChange={(event) => setSearch(event.target.value)}
						/>
						<div className='max-h-56 space-y-0.5 overflow-y-auto'>
							{databases.length === 0 && (
								<p className='px-2 py-1.5 text-sm text-muted-foreground'>
									No database found.
								</p>
							)}
							{databases.map((item) => (
								<DatabaseOption
									key={item.id}
									databaseId={item.id}
									name={item.name}
									pageId={item.pageId}
									selected={form?.database_id === item.id}
									onPick={() => pickDatabase(item.id)}
								/>
							))}
						</div>
					</>
				)}

				{form && (
					<>
						<label className='block space-y-1 text-xs text-muted-foreground'>
							Button text
							<Input
								defaultValue={form.submit_label ?? ""}
								placeholder='Submit'
								onBlur={(event) =>
									saveForm({ ...form, submit_label: event.target.value })
								}
							/>
						</label>
						<label className='block space-y-1 text-xs text-muted-foreground'>
							Message after sending
							<Input
								defaultValue={form.success_message ?? ""}
								placeholder='Thanks, your answer was sent.'
								onBlur={(event) =>
									saveForm({ ...form, success_message: event.target.value })
								}
							/>
						</label>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							disabled={hasQuestions}
							title={hasQuestions ? "Remove the questions first" : undefined}
							onClick={() => saveForm(null)}
						>
							Turn off form
						</Button>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}

export function AddQuestionButton({
	block,
	databaseId,
	shareToken,
}: {
	block: PageBlockNode;
	databaseId: string;
	shareToken?: string;
}) {
	const [open, setOpen] = useState(false);
	const createBlock = useCreatePageBlock(shareToken);
	const addProperty = useAddDatabaseProperty(databaseId);
	// Needs access to the database page: without it the form can only be filled.
	const { data: database } = useDatabase(databaseId);

	if (!database) return null;

	const addQuestion = (property: DatabaseProperty) => {
		setOpen(false);
		createBlock.mutate({
			pageId: block.page_id,
			parentBlockId: block.id,
			afterBlockId: block.children.at(-1)?.id ?? null,
			type: PageBlockType.FORM_FIELD,
			content: { label: property.name },
			dataConfig: { property_id: property.id, required: false },
		});
	};

	const addNewQuestion = ({ label, type }: (typeof NEW_QUESTION_TYPES)[number]) => {
		setOpen(false);
		addProperty.mutate(
			{
				name: nextColumnName(
					label,
					database.properties.map((item) => item.name),
				),
				type,
			},
			{
				onSuccess: addQuestion,
				onError: () => toast.error("Unable to add this question."),
			},
		);
	};

	const used = new Set(
		block.children.flatMap((child) => {
			const field = getFormField(child.data_config);
			return child.type === PageBlockType.FORM_FIELD && field
				? [field.property_id]
				: [];
		}),
	);
	const available = [...database.properties]
		.filter((item) => FORM_PROPERTY_TYPES.has(item.type) && !used.has(item.id))
		.sort((a, b) => Number(a.position) - Number(b.position));

	return (
		<>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button type='button' variant='outline' size='sm'>
						<ListPlus />
						Add question
					</Button>
				</PopoverTrigger>
				<PopoverContent
					side='bottom'
					align='start'
					className='max-h-80 w-60 overflow-y-auto p-1'
				>
					{NEW_QUESTION_TYPES.map((item) => (
						<button
							key={item.label}
							type='button'
							onClick={() => addNewQuestion(item)}
							className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
						>
							<PropertyIcon type={item.type} className='size-4' />
							<span className='truncate'>{item.label}</span>
						</button>
					))}
					{available.length > 0 && (
						<p className='mt-1 border-t px-2 pt-2 pb-1 text-xs text-muted-foreground'>
							Existing columns
						</p>
					)}
					{available.map((property) => (
						<button
							key={property.id}
							type='button'
							onClick={() => addQuestion(property)}
							className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
						>
							<PropertyIcon type={property.type} className='size-4' />
							<span className='truncate'>{property.name}</span>
						</button>
					))}
				</PopoverContent>
			</Popover>
			<Button asChild variant='outline' size='sm'>
				<Link href={`/page/${database.pageId}`}>
					<ExternalLink />
					View responses
				</Link>
			</Button>
		</>
	);
}

export function FillFormButton({
	block,
	form,
	database,
	shareToken,
	title,
}: {
	block: PageBlockNode;
	form: SectionForm;
	database: FormDatabase;
	shareToken?: string;
	title: string;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button type='button' size='sm' onClick={() => setOpen(true)}>
				<Eye />
				Fill out
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>{title || "Untitled form"}</DialogTitle>
						<DialogDescription>
							Answers are saved as a new row.
						</DialogDescription>
					</DialogHeader>
					<FormFill
						section={block}
						form={form}
						database={database}
						shareToken={shareToken}
						renderBlock={(child) => (
							<ReadOnlyPageBlockRenderer
								block={
									child as Parameters<
										typeof ReadOnlyPageBlockRenderer
									>[0]["block"]
								}
								shareToken={shareToken}
							/>
						)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
