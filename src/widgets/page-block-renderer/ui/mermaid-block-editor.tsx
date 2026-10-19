"use client";

import { Code2, EyeOff } from "lucide-react";
import { useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	getContent,
	getString,
} from "@/entities/page-block/ui/read-only-block-content";
import { Button } from "@/shared/ui/button";
import { MermaidDiagram } from "@/shared/ui/mermaid-diagram";
import { CodeBlockEditor } from "@/widgets/page-block-renderer/ui/code-block-editor";

interface MermaidBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function MermaidBlockEditor({
	block,
	shareToken,
}: MermaidBlockEditorProps) {
	const code = getString(getContent(block), "text");
	const [codeOpen, setCodeOpen] = useState(() => !code.trim());

	return (
		<div className='w-full space-y-2'>
			<div className={codeOpen ? undefined : "hidden"}>
				<CodeBlockEditor
					block={block}
					shareToken={shareToken}
					showLanguage={false}
				/>
			</div>

			<div className='relative rounded-lg border bg-muted/20 p-4'>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					aria-expanded={codeOpen}
					onClick={() => setCodeOpen((open) => !open)}
					className='absolute right-2 top-2 z-10 h-7 gap-1.5 px-2 text-xs font-normal text-muted-foreground'
				>
					{codeOpen ? (
						<EyeOff className='size-3.5' />
					) : (
						<Code2 className='size-3.5' />
					)}
					{codeOpen ? "Hide code" : "Edit code"}
				</Button>

				{code.trim() ? (
					<MermaidDiagram code={code} />
				) : (
					<p className='text-sm text-muted-foreground'>
						Write Mermaid code above to draw a diagram.
					</p>
				)}
			</div>
		</div>
	);
}
