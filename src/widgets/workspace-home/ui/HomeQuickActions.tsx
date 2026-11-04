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
			<div className='flex flex-wrap items-center gap-2'>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => setCreateDialogOpen(true)}
					disabled={!workspaceId}
				>
					<Plus />
					<span>New page</span>
				</Button>

				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() => router.push("/dashboard/ai")}
				>
					<Sparkles />
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
