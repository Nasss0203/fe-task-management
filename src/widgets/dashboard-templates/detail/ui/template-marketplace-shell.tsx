"use client";

import { useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
	AlertCircle,
	CheckCircle2,
	ExternalLink,
	Globe,
	LayoutTemplate,
	Loader2,
	Lock,
	Sparkles,
	Store,
	Users,
} from "lucide-react";
import { toast } from "sonner";

import {
	usePublishTemplateToMarketplace,
	useTemplateListing,
	useTemplateVersions,
	useUnpublishTemplateListing,
	type PageTemplate,
	type TemplateVersion,
} from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface TemplateMarketplaceShellProps {
	template: PageTemplate;
	versions?: TemplateVersion[];
	selectedVersionId?: string;
	onSwitchTab?: (tab: string) => void;
	onOpenEdit?: () => void;
}

function errorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		if (error.response?.status === 403)
			return "You don't have permission to manage this marketplace listing.";
		const message: unknown = error.response?.data?.message;
		if (typeof message === "string") return message;
		if (Array.isArray(message)) return message.join(", ");
		if (error.response?.status === 409)
			return "Publication changed. Please refresh and try again.";
		if (error.response?.status === 400)
			return "Unable to publish this version. Please review your selection.";
	}
	return "Unable to complete the request. You can safely try again.";
}

export function TemplateMarketplaceShell({
	template,
	versions: propVersions,
	selectedVersionId,
}: TemplateMarketplaceShellProps) {
	const [publishOpen, setPublishOpen] = useState(false);
	const [unpublishOpen, setUnpublishOpen] = useState(false);
	const [versionId, setVersionId] = useState("");
	const [failure, setFailure] = useState<string | null>(null);
	const submitting = useRef(false);

	const {
		data: listing,
		isLoading,
		error,
		refetch,
	} = useTemplateListing(template.id);

	const versionQuery = useTemplateVersions(template.id, {
		enabled: !propVersions,
	});
	const versions = propVersions ?? versionQuery.data ?? [];

	const publish = usePublishTemplateToMarketplace();
	const unpublish = useUnpublishTemplateListing();
	const busy = publish.isPending || unpublish.isPending;

	const live =
		listing?.status === "PUBLISHED" &&
		template.visibility === "PUBLIC" &&
		template.status !== "ARCHIVED";

	const distributed = versions.find(
		(version) => version.id === listing?.published_version_id,
	);
	const selected = versions.find((version) => version.id === versionId);
	const currentVersion =
		versions.find((v) => v.id === selectedVersionId) ||
		[...versions].sort((a, b) => b.version_number - a.version_number)[0] ||
		null;

	const missingListing =
		axios.isAxiosError(error) && error.response?.status === 404;

	function openPublish() {
		const preview = versions.find(
			(version) => version.id === selectedVersionId,
		);
		const current = versions.find(
			(version) => version.id === listing?.published_version_id,
		);
		const latest = [...versions].sort(
			(a, b) => b.version_number - a.version_number,
		)[0];
		setVersionId((preview ?? current ?? latest)?.id ?? "");
		setFailure(null);
		setPublishOpen(true);
	}

	async function confirm(action: "publish" | "unpublish") {
		if (submitting.current || (action === "publish" && !selected)) return;
		submitting.current = true;
		setFailure(null);
		try {
			if (action === "publish") {
				await publish.mutateAsync({ templateId: template.id, versionId });
				setPublishOpen(false);
				toast.success("Template published to Marketplace.");
			} else {
				await unpublish.mutateAsync(template.id);
				setUnpublishOpen(false);
				toast.success("Template unpublished.");
			}
		} catch (requestError) {
			setFailure(errorMessage(requestError));
		} finally {
			submitting.current = false;
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:gap-8 items-start">
					<div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-xs">
						<div className="flex items-center gap-4">
							<Skeleton className="size-12 rounded-2xl" />
							<div className="space-y-2">
								<Skeleton className="h-6 w-48 rounded" />
								<Skeleton className="h-4 w-72 rounded" />
							</div>
						</div>
						<Skeleton className="h-32 w-full rounded-xl" />
						<Skeleton className="h-11 w-44 rounded-xl" />
					</div>
					<div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
						<Skeleton className="h-5 w-36 rounded" />
						<Skeleton className="h-28 w-full rounded-xl" />
					</div>
				</div>
				<p role="status" className="sr-only">
					Loading Marketplace…
				</p>
			</div>
		);
	}

	if (error && !missingListing) {
		return (
			<div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 md:p-8 space-y-4 shadow-xs max-w-2xl">
				<div className="flex items-center gap-3 text-destructive font-semibold text-base">
					<AlertCircle className="size-5 shrink-0" />
					<span>Marketplace access restricted</span>
				</div>
				<p role="alert" className="text-sm text-muted-foreground leading-relaxed">
					{errorMessage(error)}
				</p>
				{!(axios.isAxiosError(error) && error.response?.status === 403) && (
					<div className="pt-2">
						<Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
							Try again
						</Button>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Two-Column Responsive Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:gap-8 items-start">
				{/* LEFT COLUMN: MAIN CARD (~65-70%) */}
				<div className="min-w-0 space-y-6">
					<div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 space-y-6 shadow-xs">
						{/* Card Header */}
						<div className="flex items-start gap-4">
							<div
								className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-colors ${
									live
										? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
										: "bg-primary/10 text-primary border border-primary/20"
								}`}
							>
								{live ? <CheckCircle2 className="size-6" /> : <Store className="size-6" />}
							</div>
							<div className="space-y-1 min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
										{live ? "Live on Marketplace" : "Publish your template"}
									</h3>
									{live && (
										<Badge
											variant="secondary"
											className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full"
										>
											LIVE
										</Badge>
									)}
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{live
										? "Your template is publicly available on Taskmanly Marketplace."
										: "Share your template with the Taskmanly community."}
								</p>
							</div>
						</div>

						<Separator className="border-border/60" />

						{/* Content: Template Preview Box */}
						<div className="rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5 space-y-4">
							<div className="flex items-center gap-3.5">
								<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-background text-2xl shadow-xs select-none">
									{template.icon ? (
										<span>{template.icon}</span>
									) : (
										<LayoutTemplate className="size-5 text-muted-foreground" />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<h4 className="text-base font-semibold text-foreground truncate max-w-sm">
											{template.name}
										</h4>
										<Badge
											variant="secondary"
											className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-full"
										>
											FREE
										</Badge>
									</div>
									{template.description && (
										<p className="text-xs text-muted-foreground truncate mt-0.5">
											{template.description}
										</p>
									)}
								</div>
							</div>

							{/* Metadata Snapshot: Only shown in Not Published state to prevent duplication with Marketplace Details */}
							{!live && (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
									<div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3.5 py-2.5">
										<span className="text-muted-foreground">Version</span>
										<span className="font-mono font-medium text-foreground">
											{currentVersion
												? `Version ${currentVersion.version_number} (${
														currentVersion.status === "PUBLISHED"
															? "Published"
															: "Draft"
													})`
												: "None"}
										</span>
									</div>
									<div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3.5 py-2.5">
										<span className="text-muted-foreground">Access</span>
										<span className="font-medium text-foreground">Free</span>
									</div>
								</div>
							)}
						</div>

						{/* Live or Not Live Actions & Notices */}
						{live ? (
							<div className="flex flex-wrap items-center gap-3 pt-2">
								<Button asChild size="lg" className="rounded-xl font-semibold shadow-sm">
									<Link href={`/templates/${template.id}`} target="_blank">
										<ExternalLink className="mr-2 size-4" />
										View on Marketplace
									</Link>
								</Button>
								<Button
									variant="outline"
									size="lg"
									disabled={busy}
									onClick={() => {
										setFailure(null);
										setUnpublishOpen(true);
									}}
									className="rounded-xl border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
								>
									Unpublish
								</Button>
							</div>
						) : (
							<div className="space-y-4 pt-1">
								{/* Informative notice */}
								<div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs flex items-start gap-3">
									<Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
									<div className="space-y-1 leading-relaxed">
										<p className="font-medium text-foreground">
											One-click community distribution
										</p>
										<p className="text-muted-foreground">
											When you publish, your template will be shared publicly in the
											Taskmanly Template Gallery. Anyone can discover, preview, and
											use this template in their workspace for free.
										</p>
									</div>
								</div>

								{/* Warning alerts */}
								{template.status === "ARCHIVED" && (
									<div
										role="alert"
										className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive flex items-center gap-2.5"
									>
										<AlertCircle className="size-4 shrink-0" />
										<span>Restore this template before publishing.</span>
									</div>
								)}

								{versionQuery.error && !propVersions && (
									<div
										role="alert"
										className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive flex items-center justify-between gap-2.5"
									>
										<span>Unable to load versions.</span>
										<Button
											variant="link"
											size="sm"
											onClick={() => versionQuery.refetch()}
											className="h-auto p-0 text-destructive underline"
										>
											Retry
										</Button>
									</div>
								)}

								{!versions.length &&
									!versionQuery.isLoading &&
									!versionQuery.error && (
										<div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2.5">
											<AlertCircle className="size-4 shrink-0" />
											<p>Create a version before publishing.</p>
										</div>
									)}

								{/* Primary Action Button */}
								<div className="pt-2">
									<Button
										size="lg"
										onClick={openPublish}
										disabled={
											busy || template.status === "ARCHIVED" || !versions.length
										}
										className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold shadow-sm transition-all focus-visible:ring-2"
									>
										<Sparkles className="mr-2 size-4" />
										Publish to Marketplace
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* RIGHT COLUMN: MARKETPLACE DETAILS SUMMARY CARD (~30-35%) */}
				<aside className="w-full space-y-4 lg:sticky lg:top-4">
					<div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold text-foreground">
								Marketplace Details
							</h3>
						</div>

						{/* Definitions */}
						<dl className="space-y-2.5 text-xs">
							<div className="flex items-center justify-between">
								<dt className="text-muted-foreground font-normal">Status</dt>
								<dd>
									<Badge
										variant={live ? "secondary" : "outline"}
										className={
											live
												? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold"
												: "bg-muted text-muted-foreground border-border/60 text-[10px] font-medium"
										}
									>
										{live ? "Published" : "Not published"}
									</Badge>
								</dd>
							</div>

							<div className="flex items-center justify-between">
								<dt className="text-muted-foreground font-normal">Access</dt>
								<dd className="text-foreground font-medium">Free</dd>
							</div>

							<div className="flex items-center justify-between">
								<dt className="text-muted-foreground font-normal">
									{live ? "Published Version" : "Selected Version"}
								</dt>
								<dd className="font-mono font-medium text-foreground">
									{live
										? distributed
											? `v${distributed.version_number}`
											: "v1"
										: currentVersion
											? `v${currentVersion.version_number}`
											: "None"}
								</dd>
							</div>

							<div className="flex items-center justify-between">
								<dt className="text-muted-foreground font-normal">Visibility</dt>
								<dd className="text-foreground font-medium flex items-center gap-1.5">
									{template.visibility === "PUBLIC" ? (
										<>
											<Globe className="size-3 text-muted-foreground" />
											<span>Public</span>
										</>
									) : template.visibility === "WORKSPACE" ? (
										<>
											<Users className="size-3 text-muted-foreground" />
											<span>Workspace</span>
										</>
									) : (
										<>
											<Lock className="size-3 text-muted-foreground" />
											<span>Private</span>
										</>
									)}
								</dd>
							</div>

							{live && listing?.published_at && (
								<div className="flex items-center justify-between">
									<dt className="text-muted-foreground font-normal">Published at</dt>
									<dd className="text-foreground">
										{new Date(listing.published_at).toLocaleDateString(undefined, {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</dd>
								</div>
							)}
						</dl>

						<Separator className="border-border/60" />

						{/* Subtle contextual hint */}
						<div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
							<Sparkles className="size-3.5 shrink-0 text-primary/70 mt-0.5" />
							<span>
								{live
									? "Your template is listed in the Public Template Catalog for free community use."
									: "Publishing makes your template discoverable to everyone with free cloning access."}
							</span>
						</div>
					</div>
				</aside>
			</div>

			{/* REDESIGNED PUBLISH TO MARKETPLACE DIALOG */}
			<Dialog
				open={publishOpen}
				onOpenChange={(open) => {
					if (!busy) setPublishOpen(open);
				}}
			>
				<DialogContent
					className="sm:max-w-lg rounded-2xl"
					onEscapeKeyDown={(event) => {
						if (busy) event.preventDefault();
					}}
					onInteractOutside={(event) => {
						if (busy) event.preventDefault();
					}}
				>
					<DialogHeader>
						<div className="flex items-center gap-3">
							<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
								<Store className="size-5" />
							</div>
							<div className="space-y-0.5">
								<DialogTitle className="text-lg font-bold">
									Publish to Marketplace
								</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground">
									Choose a version to share.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					{publish.isPending ? (
						<div role="status" className="space-y-4 py-8 text-center">
							<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mx-auto text-primary">
								<Loader2 className="size-6 animate-spin" />
							</div>
							<div className="space-y-1">
								<p className="font-semibold text-foreground text-sm">
									Publishing to Marketplace...
								</p>
								<p className="text-xs text-muted-foreground">
									Please wait while we publish your template.
								</p>
							</div>
						</div>
					) : (
						<div className="space-y-5 py-2">
							{/* Version selection fieldset */}
							<fieldset className="space-y-2">
								<legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
									Template version
								</legend>
								<div className="space-y-2 max-h-56 overflow-y-auto pr-1">
									{versions.map((ver) => {
										const isSelected = versionId === ver.id;
										return (
											<label
												key={ver.id}
												className={`flex items-start gap-3.5 rounded-xl border p-3.5 cursor-pointer transition-all ${
													isSelected
														? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-xs"
														: "border-border/80 hover:border-border hover:bg-muted/30"
												}`}
											>
												<input
													type="radio"
													name="marketplace-version"
													value={ver.id}
													checked={isSelected}
													onChange={() => setVersionId(ver.id)}
													className="mt-0.5 size-4 accent-primary"
												/>
												<div className="min-w-0 flex-1 space-y-1">
													<div className="flex items-center justify-between gap-2">
														<span className="text-sm font-semibold text-foreground">
															v{ver.version_number} —{" "}
															{ver.status === "DRAFT" ? "Draft" : "Published"}
														</span>
														<Badge
															variant={
																ver.status === "PUBLISHED" ? "secondary" : "outline"
															}
															className={
																ver.status === "PUBLISHED"
																	? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
																	: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]"
															}
														>
															{ver.status === "PUBLISHED" ? "Published" : "Draft"}
														</Badge>
													</div>
													{ver.status === "DRAFT" && (
														<p className="text-xs text-muted-foreground">
															Draft version will be published upon confirmation.
														</p>
													)}
												</div>
											</label>
										);
									})}
								</div>
							</fieldset>

							{/* Notice when changing from currently distributed marketplace version */}
							{distributed && selected && distributed.id !== selected.id && (
								<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
									The Marketplace version will change from v{distributed.version_number} to v{selected.version_number}.
								</div>
							)}

							{/* Publication Summary Box */}
							<div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Publication Summary
								</p>
								<div className="space-y-2 text-xs">
									<div className="flex items-center justify-between">
										<span className="text-muted-foreground">Marketplace version</span>
										<span className="font-mono font-medium text-foreground">
											v{selected ? selected.version_number : "—"} ({selected?.status === "DRAFT" ? "Draft" : "Published"})
										</span>
									</div>
									<p className="text-xs text-muted-foreground">
										This version will be distributed on the Marketplace.
									</p>
									<div className="pt-1.5 border-t border-border/60 space-y-2">
										<p className="text-sm">Listing type: Free</p>
										<div className="space-y-1 pt-1 border-t border-border/60">
											<p className="font-medium text-foreground">Public visibility</p>
											{template.visibility === "PUBLIC" ? (
												<p className="text-muted-foreground leading-relaxed">
													Your template will remain Public.
												</p>
											) : (
												<div className="text-muted-foreground leading-relaxed space-y-0.5">
													<p>Your template will become Public.</p>
													<p>Anyone can discover it after publishing.</p>
													<span className="sr-only">
														Your template will become publicly available.
													</span>
												</div>
											)}
										</div>
										{selected?.status === "DRAFT" && (
											<p className="text-muted-foreground">
												The selected draft version will be published.
											</p>
										)}
										{!listing && (
											<p className="text-muted-foreground">
												A free listing will be created automatically.
											</p>
										)}
									</div>
								</div>
							</div>

							{failure && (
								<div
									role="alert"
									className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive flex items-center gap-2"
								>
									<AlertCircle className="size-4 shrink-0" />
									<span>{failure}</span>
								</div>
							)}
						</div>
					)}

					<DialogFooter className="gap-2 sm:gap-0 pt-2">
						<Button
							variant="outline"
							disabled={busy}
							onClick={() => setPublishOpen(false)}
							className="rounded-xl"
						>
							Cancel
						</Button>
						<Button
							disabled={busy || !selected}
							onClick={() => confirm("publish")}
							className="rounded-xl font-semibold shadow-sm"
						>
							Confirm &amp; Publish
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* UNPUBLISH CONFIRMATION ALERT DIALOG */}
			<AlertDialog
				open={unpublishOpen}
				onOpenChange={(open) => {
					if (!busy) setUnpublishOpen(open);
				}}
			>
				<AlertDialogContent className="rounded-2xl max-w-md">
					<AlertDialogHeader className="space-y-3">
						<AlertDialogTitle>Unpublish from Marketplace?</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div className="text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-2.5">
								<p className="text-foreground">
									Your template will no longer appear in the public Marketplace.
								</p>
								<p className="font-medium text-foreground pt-1">
									This action will not:
								</p>
								<ul className="list-disc pl-5 space-y-1 text-muted-foreground">
									<li>Change your template&apos;s Public visibility.</li>
									<li>Remove published versions.</li>
									<li>Revoke existing template entitlements.</li>
								</ul>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					{failure && (
						<div
							role="alert"
							className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive flex items-center gap-2"
						>
							<AlertCircle className="size-4 shrink-0" />
							<span>{failure}</span>
						</div>
					)}
					<AlertDialogFooter className="gap-2 sm:gap-0 pt-2">
						<Button
							variant="outline"
							disabled={busy}
							onClick={() => setUnpublishOpen(false)}
							className="rounded-xl"
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							disabled={busy}
							onClick={() => confirm("unpublish")}
							className="rounded-xl font-semibold"
						>
							{unpublish.isPending ? "Unpublishing..." : "Unpublish"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
