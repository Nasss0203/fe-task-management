"use client";

import { Code2, Eye } from "lucide-react";
import { useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	getContent,
	getString,
} from "@/entities/page-block/ui/read-only-block-content";
import { MermaidDiagram } from "@/shared/ui/mermaid-diagram";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { CodeBlockEditor } from "@/widgets/page-block-renderer/ui/code-block-editor";

interface MermaidBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

type MermaidTab = "preview" | "code";

export function MermaidBlockEditor({
	block,
	shareToken,
}: MermaidBlockEditorProps) {
	const code = getString(getContent(block), "text");
	// Block mới chưa có code thì mở thẳng tab Code
	const [tab, setTab] = useState<MermaidTab>(() =>
		code.trim() ? "preview" : "code",
	);

	return (
		<Tabs
			value={tab}
			onValueChange={(value) => setTab(value as MermaidTab)}
			className='w-full gap-0 rounded-lg border border-border bg-muted/40'
		>
			<div className='flex items-center justify-between px-3 pt-2.5 pb-1'>
				<span className='text-[12.5px] font-semibold text-muted-foreground'>
					Mermaid
				</span>

				<TabsList className='h-7 p-0.5'>
					<TabsTrigger value='preview' className='h-6 gap-1 px-2 text-xs'>
						<Eye className='size-3.5' />
						Preview
					</TabsTrigger>
					<TabsTrigger value='code' className='h-6 gap-1 px-2 text-xs'>
						<Code2 className='size-3.5' />
						Code
					</TabsTrigger>
				</TabsList>
			</div>

			<TabsContent value='preview' className='p-4'>
				{code.trim() ? (
					<MermaidDiagram code={code} />
				) : (
					<p className='text-sm text-muted-foreground'>
						No diagram yet. Open the Code tab to write one.
					</p>
				)}
			</TabsContent>

			{/* Giữ editor trong DOM khi ẩn để chuyển tab không mất nội dung đang gõ */}
			<TabsContent
				value='code'
				forceMount
				className='p-2 data-[state=inactive]:hidden'
			>
				<CodeBlockEditor
					block={block}
					shareToken={shareToken}
					showLanguage={false}
				/>
			</TabsContent>
		</Tabs>
	);
}
