import { FileQuestion, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/ui/button";

interface PageUnavailableProps {
	/**
	 * BE trả 403 cho cả page không tồn tại lẫn không có quyền,
	 * nên "no-access" không khẳng định page có tồn tại.
	 */
	reason: "no-access" | "not-found";
}

const COPY = {
	"no-access": {
		icon: LockKeyhole,
		title: "You don't have access to this page",
		description:
			"This page may have been deleted, or it belongs to a workspace you're not part of. Ask the page owner to share it with you.",
	},
	"not-found": {
		icon: FileQuestion,
		title: "Page not found",
		description:
			"This page may have been deleted or moved. Check the link and try again.",
	},
} as const;

export function PageUnavailable({ reason }: PageUnavailableProps) {
	const { icon: Icon, title, description } = COPY[reason];

	return (
		<div className='flex min-h-[60vh] w-full items-center justify-center px-6 py-16'>
			<div className='flex w-full max-w-md flex-col items-center text-center'>
				<div className='mb-5 flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/40 text-muted-foreground'>
					<Icon className='size-6' />
				</div>

				<h1 className='text-xl font-semibold tracking-tight'>{title}</h1>

				<p className='mt-2 text-sm leading-6 text-muted-foreground'>
					{description}
				</p>

				<Button asChild variant='outline' className='mt-6'>
					<Link href='/dashboard'>Back to home</Link>
				</Button>
			</div>
		</div>
	);
}
