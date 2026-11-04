"use client";

import { ChevronRight, Palette, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useDatabase } from "@/entities/database/model/database.queries";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { useFormAnswerKeys } from "@/entities/page-block/model/page-block.queries";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	CALLOUT_TONES,
	type CalloutTone,
	getCalloutTone,
} from "@/entities/page-block/ui/read-only-block-content";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { InSectionProvider } from "@/widgets/page-block-editor/ui/column-scope";
import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { PageBlockEditorRow } from "@/widgets/page-block-editor/ui/page-block-editor-row";
import { ReadOnlyPageBlockRenderer } from "@/widgets/page-block/ui/read-only-page-block-renderer";

import { getSectionForm, getSectionQuiz } from "../lib/form-config";
import {
	FormDatabaseProvider,
	FormQuestionsProvider,
	FormQuizProvider,
} from "./form-field-block-editor";
import {
	AddQuestionButton,
	FillFormButton,
	SectionFormSettings,
	useFormDatabase,
} from "./section-form-controls";

interface SectionBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function getSectionText(
	block: Pick<PageBlockNode, "content">,
	key: "title" | "description",
): string {
	const content = block.content;
	const value =
		content && typeof content === "object" && !Array.isArray(content)
			? content[key]
			: undefined;
	return typeof value === "string" ? value : "";
}

export function SectionBlockEditor({
	block,
	shareToken,
}: SectionBlockEditorProps) {
	const [title, setTitle] = useState(() => getSectionText(block, "title"));
	const [description, setDescription] = useState(() =>
		getSectionText(block, "description"),
	);
	const [toneOpen, setToneOpen] = useState(false);
	const titleRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLInputElement>(null);
	const creatingChildRef = useRef(false);

	const updateBlock = useUpdatePageBlock(shareToken);
	const createBlock = useCreatePageBlock(shareToken);
	const { focusBlockId, requestFocus, clearFocus } = usePageBlockEditor();
	const tone = getCalloutTone(block.style_config);
	const form = getSectionForm(block.data_config);
	const { data: formDatabase, isError: formUnavailable } = useFormDatabase(
		block,
		form,
		shareToken,
	);
	const { isError: cannotManageForm } = useDatabase(
		form?.database_id,
		Boolean(form),
	);
	const hasQuestions = block.children.some(
		(child) => child.type === PageBlockType.FORM_FIELD,
	);
	const quiz = form ? getSectionQuiz(block.data_config) : null;
	const showAnswerKeys = Boolean(quiz) && !shareToken;
	const answerKeys = useFormAnswerKeys(block.id, showAnswerKeys);
	const totalPoints = (answerKeys.data ?? []).reduce(
		(sum, key) => sum + (key.correct_value !== null ? key.points : 0),
		0,
	);
	const quizState = showAnswerKeys
		? {
				sectionBlockId: block.id,
				keys: new Map(
					(answerKeys.data ?? []).map((key) => [key.field_block_id, key]),
				),
				unavailable: answerKeys.isError,
			}
		: null;

	useEffect(() => {
		setTitle(getSectionText(block, "title"));
		setDescription(getSectionText(block, "description"));
	}, [block]);

	useEffect(() => {
		if (focusBlockId !== block.id) return;
		titleRef.current?.focus();
		clearFocus();
	}, [focusBlockId, block.id, clearFocus]);

	const saveText = () => {
		if (
			title === getSectionText(block, "title") &&
			description === getSectionText(block, "description")
		) {
			return;
		}

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: { ...block.content, title, description },
		});
	};

	const addChild = async () => {
		if (creatingChildRef.current) return;
		creatingChildRef.current = true;

		try {
			const created = await createBlock.mutateAsync({
				pageId: block.page_id,
				parentBlockId: block.id,
				type: PageBlockType.TEXT,
				content: { text: "" },
			});
			requestFocus(created.id);
		} finally {
			creatingChildRef.current = false;
		}
	};

	const enterBody = async () => {
		saveText();

		if (!block.is_open) {
			await updateBlock.mutateAsync({
				blockId: block.id,
				pageId: block.page_id,
				isOpen: true,
			});
		}

		const firstChild = block.children[0];
		if (firstChild) {
			requestFocus(firstChild.id);
			return;
		}

		await addChild();
	};

	const selectTone = (nextTone: CalloutTone) => {
		setToneOpen(false);
		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			styleConfig: { ...block.style_config, tone: nextTone },
		});
	};

	const isEnter = (event: React.KeyboardEvent<HTMLInputElement>) =>
		event.key === "Enter" && !event.nativeEvent.isComposing;

	// Editing this page doesn't reach the form's database: fill the form, don't configure it.
	if (cannotManageForm) {
		return (
			<ReadOnlyPageBlockRenderer
				block={
					block as Parameters<typeof ReadOnlyPageBlockRenderer>[0]["block"]
				}
				shareToken={shareToken}
			/>
		);
	}

	return (
		<section
			aria-label={title || "Untitled section"}
			className={cn(
				"group/section w-full rounded-xl border border-border py-2.5 pr-2.5 pl-1",
				CALLOUT_TONES[tone].className,
			)}
		>
			<div className='grid min-h-7 grid-cols-[28px_28px_minmax(0,1fr)_auto] items-center'>
				<span aria-hidden='true' />
				<button
					type='button'
					aria-label={block.is_open ? "Collapse section" : "Expand section"}
					aria-expanded={block.is_open}
					onClick={() =>
						updateBlock.mutate({
							blockId: block.id,
							pageId: block.page_id,
							isOpen: !block.is_open,
						})
					}
					className='flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground'
				>
					<ChevronRight
						className={cn(
							"size-4 transition-transform duration-200",
							block.is_open && "rotate-90",
						)}
					/>
				</button>

				<input
					ref={titleRef}
					value={title}
					placeholder='Untitled section'
					onChange={(event) => setTitle(event.target.value)}
					onBlur={saveText}
					onKeyDown={(event) => {
						if (!isEnter(event)) return;
						event.preventDefault();
						if (block.is_open) {
							descriptionRef.current?.focus();
							return;
						}
						void enterBody();
					}}
					className='min-h-7 min-w-0 border-0 bg-transparent p-0 pl-1 text-base font-semibold leading-7 outline-none placeholder:text-faint'
				/>

				<div className='flex items-center gap-1.5'>
					{!block.is_open && block.children.length > 0 && (
						<span className='shrink-0 text-xs text-muted-foreground'>
							{block.children.length}{" "}
							{block.children.length === 1 ? "block" : "blocks"}
						</span>
					)}

					{quiz ? (
						<span className='inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#5e6ad2]/12 px-2.5 py-0.5 text-xs font-medium text-[#5e6ad2] dark:bg-indigo-500/15 dark:text-indigo-300'>
							<span
								aria-hidden='true'
								className='size-1.5 rounded-full bg-[#5e6ad2] dark:bg-indigo-400'
							/>
							Quiz
							{totalPoints > 0
								? ` · ${totalPoints} ${totalPoints === 1 ? "pt" : "pts"}`
								: ""}
						</span>
					) : form ? (
						<span className='inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
							Form
						</span>
					) : null}

					<SectionFormSettings
						block={block}
						form={form}
						hasQuestions={hasQuestions}
						shareToken={shareToken}
					/>

					<Popover open={toneOpen} onOpenChange={setToneOpen}>
						<PopoverTrigger asChild>
							<button
								type='button'
								aria-label='Change section color'
								className='flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 group-hover/section:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100'
							>
								<Palette className='size-4' />
							</button>
						</PopoverTrigger>

						<PopoverContent side='bottom' align='end' className='w-44 p-1'>
							{(Object.keys(CALLOUT_TONES) as CalloutTone[]).map((key) => (
								<button
									key={key}
									type='button'
									aria-pressed={key === tone}
									onClick={() => selectTone(key)}
									className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
								>
									<span
										aria-hidden='true'
										className={cn(
											"size-5 rounded border border-border/60",
											CALLOUT_TONES[key].className,
										)}
									/>
									{CALLOUT_TONES[key].label}
								</button>
							))}
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{block.is_open && (
				<>
					<input
						ref={descriptionRef}
						value={description}
						placeholder='Add a description'
						onChange={(event) => setDescription(event.target.value)}
						onBlur={saveText}
						onKeyDown={(event) => {
							if (!isEnter(event)) return;
							event.preventDefault();
							void enterBody();
						}}
						className='ml-15 block min-h-6 w-[calc(100%-3.75rem)] border-0 bg-transparent p-0 text-[13.5px] leading-6 text-muted-foreground outline-none placeholder:text-transparent focus:placeholder:text-faint group-hover/section:placeholder:text-faint'
					/>

					<InSectionProvider value>
						<FormDatabaseProvider value={formDatabase ?? null}>
							<FormQuestionsProvider value={block.children}>
							<FormQuizProvider value={quizState}>
							{block.children.length > 0 ? (
								<div className={cn("mt-1.5", form ? "space-y-2" : "space-y-1")}>
									{block.children.map((child) => (
										<PageBlockEditorRow
											key={child.id}
											block={child}
											shareToken={shareToken}
										/>
									))}
								</div>
							) : (
								<button
									type='button'
									onClick={() => void addChild()}
									className='mt-1 ml-15 flex items-center gap-1.5 rounded-md px-1 text-left text-[13px] leading-7 text-faint transition-colors hover:bg-foreground/5 hover:text-muted-foreground'
								>
									<Plus className='size-3.5' />
									Add a block
								</button>
							)}
							{form && formUnavailable && (
								<p className='mt-1 ml-15 text-sm text-destructive'>
									This form&apos;s database is no longer available.
								</p>
							)}
							{form && formDatabase && (
								<div className='mt-2.5 ml-14 flex flex-wrap items-center gap-2 pt-0.5'>
									<AddQuestionButton
										block={block}
										databaseId={form.database_id}
										shareToken={shareToken}
									/>
									{hasQuestions && (
										<FillFormButton
											block={block}
											form={form}
											database={formDatabase}
											shareToken={shareToken}
											title={title}
										/>
									)}
								</div>
							)}
							</FormQuizProvider>
							</FormQuestionsProvider>
						</FormDatabaseProvider>
					</InSectionProvider>
				</>
			)}
		</section>
	);
}
