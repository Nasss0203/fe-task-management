"use client";

import { ArrowRight, Eye, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
	useUsableTemplateVersions,
	type PublicTemplateListItem,
} from "@/entities/template";
import { useUser } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { UseTemplateDialog } from "@/features/template-use";

import { getTemplatePriceLabel } from "./template-card";

const primaryClass =
	"h-11 sm:h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const secondaryClass =
	"h-11 sm:h-12 w-full rounded-xl font-medium border-border/80 hover:bg-muted/60 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

interface TemplateDetailActionsProps {
	template: PublicTemplateListItem;
	/** FREE only: the user already claimed it, so Use skips the claim. */
	isClaimed: boolean;
	previewHref: string | null;
}

/**
 * Buyer CTAs. FREE: claim (once) then use. PAID: owners pick an official
 * release from the backend's usable versions; others see the price.
 */
export function TemplateDetailActions({
	template,
	isClaimed,
	previewHref,
}: TemplateDetailActionsProps) {
	const { user } = useUser();
	const isPaid = template.offer_type === "PAID";

	return (
		<div className='flex flex-col gap-3 pt-2 border-t border-border/60'>
			{!user ? (
				<Button asChild size='lg' className={primaryClass}>
					<Link href={isPaid ? "/sign-in" : "/sign-up"}>
						{isPaid ? "Sign in to buy" : "Use template"}
						<ArrowRight className='ml-2 size-4.5' />
					</Link>
				</Button>
			) : isPaid ? (
				<PaidTemplateActions template={template} userId={user.id} />
			) : (
				<FreeTemplateActions template={template} isClaimed={isClaimed} />
			)}

			{previewHref && (
				<Button asChild variant='outline' size='lg' className={secondaryClass}>
					<Link href={previewHref}>
						<Eye className='mr-2 size-4.5 text-muted-foreground' aria-hidden />
						{isPaid ? "Try the demo" : "Preview"}
					</Link>
				</Button>
			)}
		</div>
	);
}

function FreeTemplateActions({
	template,
	isClaimed,
}: {
	template: PublicTemplateListItem;
	isClaimed: boolean;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button size='lg' onClick={() => setOpen(true)} className={primaryClass}>
				Use template
				<ArrowRight className='ml-2 size-4.5' />
			</Button>
			{template.version && (
				<UseTemplateDialog
					template={template}
					version={template.version}
					open={open}
					onOpenChange={setOpen}
					requireClaim={!isClaimed}
				/>
			)}
		</>
	);
}

function PaidTemplateActions({
	template,
	userId,
}: {
	template: PublicTemplateListItem;
	userId: string;
}) {
	const [open, setOpen] = useState(false);
	const usable = useUsableTemplateVersions(template.id, { userId });
	// Every official release the backend grants, including one used as a LIMITED demo.
	const versions = usable.data?.items ?? [];
	const current = versions.find((version) => version.is_current) ?? versions[0];
	const [selectedId, setSelectedId] = useState<string | undefined>();
	const selected =
		versions.find((version) => version.id === selectedId) ?? current;

	if (usable.isPending) {
		return (
			<Button size='lg' disabled className={primaryClass}>
				<Loader2 className='mr-2 size-4 animate-spin' />
				Checking access…
			</Button>
		);
	}

	// 403 = not purchased. Checkout isn't wired in the frontend yet, so the
	// button stays disabled instead of pretending a purchase can happen.
	if (!selected) {
		return (
			<div className='flex flex-col gap-2'>
				<Button size='lg' disabled className={primaryClass}>
					<Lock className='mr-2 size-4' />
					Buy for {getTemplatePriceLabel(template)}
				</Button>
				<p className='text-center text-xs text-muted-foreground'>
					Checkout is coming soon. Try the demo in the meantime.
				</p>
			</div>
		);
	}

	return (
		<>
			{versions.length > 1 && (
				<Select value={selected.id} onValueChange={setSelectedId}>
					<SelectTrigger aria-label='Version to use' className='h-10 w-full'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent position='popper'>
						{versions.map((version) => (
							<SelectItem key={version.id} value={version.id}>
								v{version.version_number}
								{version.is_current ? " · latest" : ""}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
			<Button size='lg' onClick={() => setOpen(true)} className={primaryClass}>
				Use template
				<ArrowRight className='ml-2 size-4.5' />
			</Button>
			<UseTemplateDialog
				template={template}
				version={selected}
				open={open}
				onOpenChange={setOpen}
				requireClaim={false}
			/>
		</>
	);
}
