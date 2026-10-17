"use client";

import axios from "axios";
import { format } from "date-fns";
import {
	Archive,
	ArchiveRestore,
	ArrowLeft,
	FileText,
	GitBranch,
	Loader2,
	MoreHorizontal,
	Pencil,
	Plus,
	RotateCw,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
	useTemplateDetail,
	useTemplatePreview,
	useTemplateVersions,
	type TemplateVersion,
} from "@/entities/template";
import {
	useCreateTemplateVersion,
	useRestoreTemplate,
} from "@/entities/template/model/template.mutations";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
// shortcut: management pieces still live in the dashboard widget; move them here when UI-4 strips creator controls from the dashboard.
import {
	TemplatePreviewPanel,
	TemplateVersionList,
} from "@/widgets/dashboard-templates/detail";
import { ArchiveTemplateDialog } from "@/widgets/dashboard-templates/detail/ui/archive-template-dialog";
import { EditTemplateDialog } from "@/widgets/dashboard-templates/detail/ui/edit-template-dialog";
import { PublishTemplateDialog } from "@/widgets/dashboard-templates/detail/ui/publish-template-dialog";

import {
	getTemplateDisplayStatus,
	TemplateIcon,
	TemplateStatusLabel,
	TemplateVisibilityLabel,
} from "./template-meta";
import { TemplateMarketplaceSummary } from "./template-marketplace-summary";

const TABS = ["overview", "versions", "marketplace"] as const;
type Tab = (typeof TABS)[number];

function parseTab(value: string | null): Tab {
	return TABS.find((tab) => tab === value) ?? "overview";
}

function formatDate(value?: string | null) {
	return value ? format(new Date(value), "MMM d, yyyy") : "—";
}

export function CreatorTemplateDetailPage({ templateId }: { templateId: string }) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const tab = parseTab(searchParams.get("tab"));

	const [dialog, setDialog] = useState<"edit" | "archive" | null>(null);
	const [publishTarget, setPublishTarget] = useState<TemplateVersion | null>(
		null,
	);

	const templateQuery = useTemplateDetail(templateId);
	const versionsQuery = useTemplateVersions(templateId);
	const versions = versionsQuery.data ?? [];
	const versionId = searchParams.get("version") ?? versions[0]?.id;
	const activeVersion =
		versions.find((version) => version.id === versionId) ?? null;
	const previewQuery = useTemplatePreview(templateId, activeVersion?.id);

	const createVersion = useCreateTemplateVersion();
	const restore = useRestoreTemplate();

	const updateParams = (next: { tab?: Tab; version?: string }) => {
		const params = new URLSearchParams(searchParams.toString());
		const nextTab = next.tab ?? tab;
		if (nextTab === "overview") params.delete("tab");
		else params.set("tab", nextTab);
		if (next.version) params.set("version", next.version);
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
		});
	};

	const refetchAll = () => {
		templateQuery.refetch();
		versionsQuery.refetch();
		previewQuery.refetch();
	};

	const handleCreateVersion = async () => {
		try {
			const created = await createVersion.mutateAsync({ templateId });
			toast.success("Version created", {
				description: `v${created.version_number} was created from the latest source page.`,
			});
			updateParams({ tab: "overview", version: created.id });
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 409) {
				toast.error("No changes detected", {
					description:
						"The source page has not changed since the latest version.",
				});
				return;
			}
			toast.error("Failed to create version", {
				description: getApiErrorMessage(
					error,
					"Failed to create a new template version.",
				),
			});
		}
	};

	const handleRestore = async () => {
		try {
			await restore.mutateAsync(templateId);
			toast.success("Template restored");
		} catch {
			toast.error("Failed to restore template");
		}
	};

	const template = templateQuery.data;

	if (templateQuery.isPending) {
		return <DetailSkeleton />;
	}

	if (!template) {
		const status = axios.isAxiosError(templateQuery.error)
			? templateQuery.error.response?.status
			: undefined;
		return (
			<div className='flex flex-col items-center gap-3 py-20 text-center'>
				<h1 className='text-lg font-semibold'>
					{status === 404
						? "Template not found"
						: status === 403
							? "You don't have access to this template"
							: "Unable to load template"}
				</h1>
				<div className='flex gap-2'>
					<Button asChild variant='outline' size='sm'>
						<Link href='/creator/templates'>
							<ArrowLeft className='size-3.5' />
							My templates
						</Link>
					</Button>
					{status !== 404 && status !== 403 && (
						<Button size='sm' onClick={() => templateQuery.refetch()}>
							<RotateCw className='size-3.5' />
							Try again
						</Button>
					)}
				</div>
			</div>
		);
	}

	const isArchived = template.status === "ARCHIVED";
	// Same rule as the My templates table: status of the newest version.
	const newestVersion = versions.reduce<TemplateVersion | undefined>(
		(newest, version) =>
			!newest || version.version_number > newest.version_number ? version : newest,
		undefined,
	);
	const displayStatus = getTemplateDisplayStatus(
		template.status,
		newestVersion?.status === "PUBLISHED",
	);

	return (
		<div className='flex flex-col gap-6'>
			<Link
				href='/creator/templates'
				className='inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
			>
				<ArrowLeft className='size-3.5' />
				My templates
			</Link>

			<header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div className='flex min-w-0 gap-4'>
					<TemplateIcon template={template} className='size-12 rounded-lg text-2xl' />
					<div className='flex min-w-0 flex-col gap-1.5'>
						<h1 className='truncate text-2xl font-semibold tracking-tight'>
							{template.name}
						</h1>
						{template.description && (
							<p className='line-clamp-2 max-w-2xl text-sm text-muted-foreground'>
								{template.description}
							</p>
						)}
						<div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
							<TemplateStatusLabel status={displayStatus} />
							<TemplateVisibilityLabel visibility={template.visibility} />
							{versions[0] && (
								<span className='text-sm text-muted-foreground'>
									Latest v{versions[0].version_number}
								</span>
							)}
						</div>
					</div>
				</div>

				<div className='flex shrink-0 gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setDialog("edit")}
						disabled={isArchived}
					>
						<Pencil className='size-3.5' />
						Edit details
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='outline'
								size='icon'
								className='size-8'
								aria-label='More actions'
							>
								<MoreHorizontal className='size-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-48'>
							{template.source_page_id && (
								<>
									<DropdownMenuItem asChild>
										<Link href={`/page/${template.source_page_id}`}>
											<FileText className='size-4' />
											Open source page
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
								</>
							)}
							{isArchived ? (
								<DropdownMenuItem
									disabled={restore.isPending}
									onSelect={handleRestore}
								>
									<ArchiveRestore className='size-4' />
									Restore
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem
									variant='destructive'
									onSelect={() => setDialog("archive")}
								>
									<Archive className='size-4' />
									Archive
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			<Tabs value={tab} onValueChange={(value) => updateParams({ tab: parseTab(value) })} className='gap-6'>
				<TabsList variant='line' className='w-full justify-start border-b pb-1'>
					<TabsTrigger value='overview' className='flex-none'>
						Overview
					</TabsTrigger>
					<TabsTrigger value='versions' className='flex-none'>
						Versions
						<span className='text-xs text-muted-foreground tabular-nums'>
							{versions.length}
						</span>
					</TabsTrigger>
					<TabsTrigger value='marketplace' className='flex-none'>
						Marketplace
					</TabsTrigger>
				</TabsList>

				<TabsContent value='overview'>
					<div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
						<div className='flex min-w-0 flex-col gap-3'>
							{versions.length > 0 ? (
								<>
									<div className='flex items-center justify-between gap-3'>
										<h2 className='text-sm font-semibold'>Snapshot preview</h2>
										<Select
											value={activeVersion?.id}
											onValueChange={(id) => updateParams({ version: id })}
										>
											<SelectTrigger size='sm' aria-label='Preview version'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent position='popper' align='end'>
												{versions.map((version) => (
													<SelectItem key={version.id} value={version.id}>
														v{version.version_number} ·{" "}
														{version.status === "PUBLISHED" ? "Published" : "Draft"}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<TemplatePreviewPanel
										template={template}
										version={activeVersion}
										blocks={previewQuery.data?.blocks ?? []}
										databases={previewQuery.data?.databases ?? []}
										isLoading={previewQuery.isPending && Boolean(activeVersion)}
									/>
								</>
							) : (
								<div className='flex flex-col items-center gap-3 rounded-xl border px-6 py-14 text-center'>
									<span className='flex size-10 items-center justify-center rounded-lg bg-muted'>
										<GitBranch className='size-5 text-muted-foreground' />
									</span>
									<div className='flex flex-col gap-1'>
										<p className='text-sm font-medium'>
											{versionsQuery.isPending ? "Loading versions…" : "No versions yet"}
										</p>
										<p className='max-w-sm text-sm text-muted-foreground'>
											Create a version to snapshot the source page.
										</p>
									</div>
									<Button
										size='sm'
										onClick={handleCreateVersion}
										disabled={createVersion.isPending || isArchived || versionsQuery.isPending}
									>
										{createVersion.isPending ? (
											<Loader2 className='size-3.5 animate-spin' />
										) : (
											<Plus className='size-3.5' />
										)}
										Create version
									</Button>
								</div>
							)}
						</div>

						<aside className='rounded-xl border bg-card'>
							<h2 className='border-b px-4 py-3 text-sm font-semibold'>Details</h2>
							<dl className='flex flex-col gap-3 p-4 text-sm'>
								<DetailRow label='Status'>
									<TemplateStatusLabel status={displayStatus} />
								</DetailRow>
								<DetailRow label='Visibility'>
									<TemplateVisibilityLabel visibility={template.visibility} />
								</DetailRow>
								<DetailRow label='Versions'>{versions.length}</DetailRow>
								<DetailRow label='Created'>{formatDate(template.created_at)}</DetailRow>
								<DetailRow label='Last updated'>{formatDate(template.updated_at)}</DetailRow>
							</dl>
						</aside>
					</div>
				</TabsContent>

				<TabsContent value='versions'>
					<TemplateVersionList
						template={template}
						versions={versions}
						selectedVersionId={activeVersion?.id}
						onPreviewVersion={(id) => updateParams({ tab: "overview", version: id })}
						onPublishVersion={setPublishTarget}
						onCreateVersion={handleCreateVersion}
						isCreatingVersion={createVersion.isPending}
					/>
				</TabsContent>

				<TabsContent value='marketplace'>
					<TemplateMarketplaceSummary template={template} versions={versions} />
				</TabsContent>
			</Tabs>

			{publishTarget && (
				<PublishTemplateDialog
					template={template}
					version={publishTarget}
					open
					onOpenChange={(open) => !open && setPublishTarget(null)}
					onPublished={refetchAll}
				/>
			)}
			<EditTemplateDialog
				template={template}
				open={dialog === "edit"}
				onOpenChange={(open) => setDialog(open ? "edit" : null)}
				onUpdated={refetchAll}
			/>
			<ArchiveTemplateDialog
				template={template}
				open={dialog === "archive"}
				onOpenChange={(open) => setDialog(open ? "archive" : null)}
				onArchived={refetchAll}
			/>
		</div>
	);
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className='flex items-center justify-between gap-3'>
			<dt className='text-muted-foreground'>{label}</dt>
			<dd className='text-right font-medium'>{children}</dd>
		</div>
	);
}

function DetailSkeleton() {
	return (
		<div className='flex flex-col gap-6'>
			<Skeleton className='h-4 w-28' />
			<div className='flex gap-4'>
				<Skeleton className='size-12 rounded-lg' />
				<div className='flex flex-1 flex-col gap-2'>
					<Skeleton className='h-7 w-1/2' />
					<Skeleton className='h-4 w-1/3' />
				</div>
			</div>
			<Skeleton className='h-9 w-72' />
			<Skeleton className='h-96 w-full rounded-xl' />
		</div>
	);
}
