"use client";

import { ArrowRight, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
	useUsableTemplateVersions,
	type PublicTemplateListItem,
	type UsableTemplateVersion,
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
import { BuyTemplateButton } from "@/features/template-purchase";
import { UseTemplateDialog } from "@/features/template-use";

import { getTemplatePriceLabel } from "./template-card";

const primaryClass =
	"h-11 sm:h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const secondaryClass =
	"h-11 sm:h-12 w-full rounded-xl font-medium border-border/80 hover:bg-muted/60 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

interface TemplateDetailActionsProps {
	template: PublicTemplateListItem;
	previewHref: string | null;
}

/**
 * Buyer CTAs. FREE: Use directly (the backend claims it on first use).
 * PAID: buyers who own the current release pick one of the backend's usable
 * versions; everyone else buys through Stripe Checkout.
 */
export function TemplateDetailActions({
	template,
	previewHref,
}: TemplateDetailActionsProps) {
	const { user } = useUser();
	const pathname = usePathname();
	const isPaid = template.offer_type === "PAID";

	return (
		<div className='flex flex-col gap-3 pt-2 border-t border-border/60'>
			{!user ? (
				<Button asChild size='lg' className={primaryClass}>
					<Link
						href={
							isPaid
								? `/sign-in?next=${encodeURIComponent(pathname)}`
								: "/sign-up"
						}
					>
						{isPaid ? "Sign in to buy" : "Use template"}
						<ArrowRight className='ml-2 size-4.5' />
					</Link>
				</Button>
			) : isPaid ? (
				<PaidTemplateActions template={template} userId={user.id} />
			) : (
				<FreeTemplateActions template={template} />
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

function FreeTemplateActions({ template }: { template: PublicTemplateListItem }) {
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
	const usable = useUsableTemplateVersions(template.id, { userId });
	// Every official release the backend grants, including one used as a LIMITED demo.
	const versions = usable.data?.items ?? [];

	if (usable.isPending) {
		return (
			<Button size='lg' disabled className={primaryClass}>
				<Loader2 className='mr-2 size-4 animate-spin' />
				Checking access…
			</Button>
		);
	}

	// PAID_PURCHASE (and the creator) can use the current release. A FREE_CLAIM
	// only covers releases made while the template was free: buy to upgrade.
	const ownsCurrentRelease = versions.some((version) => version.is_current);

	if (ownsCurrentRelease) {
		return <UseVersionActions template={template} versions={versions} />;
	}

	return (
		<>
			<BuyTemplateButton
				templateId={template.id}
				userId={userId}
				priceLabel={getTemplatePriceLabel(template)}
				className={primaryClass}
			/>
			{versions.length > 0 && (
				<UseVersionActions
					template={template}
					versions={versions}
					label='Use your free version'
					buttonClassName={secondaryClass}
					buttonVariant='outline'
				/>
			)}
		</>
	);
}

function UseVersionActions({
	template,
	versions,
	label = "Use template",
	buttonClassName = primaryClass,
	buttonVariant = "default",
}: {
	template: PublicTemplateListItem;
	versions: UsableTemplateVersion[];
	label?: string;
	buttonClassName?: string;
	buttonVariant?: "default" | "outline";
}) {
	const [open, setOpen] = useState(false);
	const current = versions.find((version) => version.is_current) ?? versions[0];
	const [selectedId, setSelectedId] = useState<string | undefined>();
	const selected =
		versions.find((version) => version.id === selectedId) ?? current;

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
			<Button
				size='lg'
				variant={buttonVariant}
				onClick={() => setOpen(true)}
				className={buttonClassName}
			>
				{label}
				<ArrowRight className='ml-2 size-4.5' />
			</Button>
			<UseTemplateDialog
				template={template}
				version={selected}
				open={open}
				onOpenChange={setOpen}
			/>
		</>
	);
}
