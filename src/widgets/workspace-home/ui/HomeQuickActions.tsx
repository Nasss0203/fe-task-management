"use client";

import { Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CreatePageDialog } from "@/widgets/create-page";
import { Button } from "@/shared/ui/button";

interface HomeQuickActionsProps {
	workspaceId?: string;
}

export function HomeQuickActions({ workspaceId }: HomeQuickActionsProps) {
	const router = useRouter();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);

	return (
		<>
			<div className='flex flex-wrap items-center gap-2.5 pt-1'>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => setCreateDialogOpen(true)}
					disabled={!workspaceId}
					className='h-8 gap-1.5 rounded-lg border-border/60 bg-background text-xs font-medium text-foreground hover:bg-accent/50'
				>
					<Plus className='size-3.5' />
					<span>New page</span>
				</Button>

				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => router.push("/dashboard/ai")}
					className='h-8 gap-1.5 rounded-lg border-border/60 bg-background text-xs font-medium text-foreground hover:bg-accent/50'
				>
					<Sparkles className='size-3.5 text-primary' />
					<span>Ask AI</span>
				</Button>
			</div>

			<CreatePageDialog
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				workspaceId={workspaceId}
			/>
		</>
	);
}
