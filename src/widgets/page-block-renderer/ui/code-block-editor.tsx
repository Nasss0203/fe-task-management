"use client";

import { useEffect, useMemo, useState } from "react";

import CodeMirror, { oneDark } from "@uiw/react-codemirror";

import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";

import { Check, ChevronDown, Copy } from "lucide-react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";

import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { Button } from "@/shared/ui/button";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";

interface CodeBlockEditorProps {
	block: PageBlockNode;
}

type CodeLanguage =
	| "plaintext"
	| "javascript"
	| "typescript"
	| "json"
	| "html"
	| "css"
	| "python"
	| "sql";

const LANGUAGE_OPTIONS: {
	value: CodeLanguage;
	label: string;
}[] = [
	{
		value: "plaintext",
		label: "Plain text",
	},
	{
		value: "javascript",
		label: "JavaScript",
	},
	{
		value: "typescript",
		label: "TypeScript",
	},
	{
		value: "json",
		label: "JSON",
	},
	{
		value: "html",
		label: "HTML",
	},
	{
		value: "css",
		label: "CSS",
	},
	{
		value: "python",
		label: "Python",
	},
	{
		value: "sql",
		label: "SQL",
	},
];

function getCode(block: PageBlockNode): string {
	const content = block.content;

	if (
		content &&
		typeof content === "object" &&
		!Array.isArray(content) &&
		"text" in content &&
		typeof content.text === "string"
	) {
		return content.text;
	}

	return "";
}

function getLanguage(block: PageBlockNode): CodeLanguage {
	const content = block.content;

	if (
		content &&
		typeof content === "object" &&
		!Array.isArray(content) &&
		"language" in content &&
		typeof content.language === "string"
	) {
		const language = content.language as CodeLanguage;

		if (LANGUAGE_OPTIONS.some((item) => item.value === language)) {
			return language;
		}
	}

	return "typescript";
}

export function CodeBlockEditor({ block }: CodeBlockEditorProps) {
	const [value, setValue] = useState(() => getCode(block));

	const [language, setLanguage] = useState<CodeLanguage>(() =>
		getLanguage(block),
	);

	const [languageOpen, setLanguageOpen] = useState(false);

	const [copied, setCopied] = useState(false);

	const updateBlock = useUpdatePageBlock();

	const createBlock = useCreatePageBlock();

	const { requestFocus } = usePageBlockEditor();

	/**
	 * Khi chuyển sang block CODE khác.
	 */
	useEffect(() => {
		setValue(getCode(block));
		setLanguage(getLanguage(block));
	}, [block.id]);

	/**
	 * CodeMirror extension theo language.
	 */
	const extensions = useMemo(() => {
		switch (language) {
			case "javascript":
				return [
					javascript({
						jsx: true,
					}),
				];

			case "typescript":
				return [
					javascript({
						jsx: true,
						typescript: true,
					}),
				];

			case "json":
				return [json()];

			case "html":
				return [html()];

			case "css":
				return [css()];

			case "python":
				return [python()];

			case "sql":
				return [sql()];

			default:
				return [];
		}
	}, [language]);

	/**
	 * Autosave sau khi ngừng gõ 600ms.
	 */
	useEffect(() => {
		const currentText = getCode(block);

		const currentLanguage = getLanguage(block);

		if (value === currentText && language === currentLanguage) {
			return;
		}

		const timeout = window.setTimeout(() => {
			updateBlock.mutate({
				blockId: block.id,
				pageId: block.page_id,

				content: {
					text: value,
					language,
				},
			});
		}, 600);

		return () => {
			window.clearTimeout(timeout);
		};
	}, [value, language, block.id, block.page_id]);

	const saveNow = async () => {
		await updateBlock.mutateAsync({
			blockId: block.id,
			pageId: block.page_id,

			content: {
				text: value,
				language,
			},
		});
	};

	const handleCopy = async () => {
		await navigator.clipboard.writeText(value);

		setCopied(true);

		window.setTimeout(() => {
			setCopied(false);
		}, 1500);
	};

	/**
	 * Ctrl + Enter / Cmd + Enter
	 * => thoát CODE và tạo TEXT phía dưới.
	 */
	const createTextBelow = async () => {
		await saveNow();

		const newBlock = await createBlock.mutateAsync({
			pageId: block.page_id,

			parentBlockId: block.parent_block_id,

			afterBlockId: block.id,

			type: PageBlockType.TEXT,

			content: {
				text: "",
			},

			styleConfig: {},
			dataConfig: {},
		});

		requestFocus(newBlock.id);
	};

	return (
		<div
			className='
                relative
                w-full
                overflow-hidden
                rounded-lg
                border
                bg-muted/20
            '
		>
			{/* Toolbar */}
			<div
				className='
                    flex
                    h-10
                    items-center
                    justify-end
                    gap-1
                    px-2
                '
			>
				{/* Language */}
				<Popover open={languageOpen} onOpenChange={setLanguageOpen}>
					<PopoverTrigger asChild>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							className='
                                h-7
                                gap-1
                                px-2
                                text-xs
                                font-normal
                                text-muted-foreground
                            '
						>
							{
								LANGUAGE_OPTIONS.find(
									(item) => item.value === language,
								)?.label
							}

							<ChevronDown className='size-3' />
						</Button>
					</PopoverTrigger>

					<PopoverContent
						side='bottom'
						align='end'
						className='w-48 p-1'
					>
						{LANGUAGE_OPTIONS.map((item) => (
							<button
								key={item.value}
								type='button'
								onClick={() => {
									setLanguage(item.value);

									setLanguageOpen(false);
								}}
								className='
                                        flex
                                        w-full
                                        items-center
                                        justify-between
                                        rounded-md
                                        px-2
                                        py-1.5
                                        text-left
                                        text-sm
                                        hover:bg-muted
                                    '
							>
								<span>{item.label}</span>

								{language === item.value && (
									<Check className='size-4' />
								)}
							</button>
						))}
					</PopoverContent>
				</Popover>

				{/* Copy */}
				<Button
					type='button'
					variant='ghost'
					size='icon'
					onClick={() => {
						void handleCopy();
					}}
					className='size-7'
					title='Copy code'
				>
					{copied ? (
						<Check className='size-4' />
					) : (
						<Copy className='size-4' />
					)}
				</Button>
			</div>

			{/* Editor */}
			<div
				className='relative z-10 w-full pointer-events-auto'
				onMouseDown={(event) => {
					event.stopPropagation();
				}}
				onClick={(event) => {
					event.stopPropagation();
				}}
			>
				<CodeMirror
					value={value}
					extensions={[oneDark, ...extensions]}
					basicSetup={{
						lineNumbers: false,
						foldGutter: false,
						highlightActiveLine: false,
						highlightActiveLineGutter: false,
						bracketMatching: true,
						closeBrackets: true,
						autocompletion: false,
					}}
					onChange={(nextValue) => {
						setValue(nextValue);
					}}
					className='
    w-full

    [&_.cm-editor]:bg-transparent
    [&_.cm-editor]:outline-none

    [&_.cm-scroller]:min-h-[40px]
    [&_.cm-scroller]:font-mono
    [&_.cm-scroller]:text-sm

    [&_.cm-content]:min-h-[40px]
    [&_.cm-content]:px-4
    [&_.cm-content]:py-3
    [&_.cm-content]:pr-40

    [&_.cm-activeLine]:bg-transparent
    [&_.cm-gutters]:hidden
  '
				/>
			</div>
		</div>
	);
}
