"use client";

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
			className='w-full gap-0 rounded-lg border border-border'
		>
			<div className='flex items-center border-b border-border px-3 py-2'>
				<TabsList className='h-6 gap-1 bg-transparent p-0'>
					<TabsTrigger
						value='preview'
						className='h-6 flex-none rounded-[5px] px-2 text-xs font-normal text-muted-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:shadow-none'
					>
						Preview
					</TabsTrigger>
					<TabsTrigger
						value='code'
						className='h-6 flex-none rounded-[5px] px-2 text-xs font-normal text-muted-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:shadow-none'
					>
						Code
					</TabsTrigger>
				</TabsList>
			</div>

			<TabsContent value='preview' className='p-5'>
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
