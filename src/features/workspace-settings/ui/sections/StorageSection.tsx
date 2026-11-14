import { FileText, Image as ImageIcon, Paperclip, RotateCw, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import type {
	StorageFileSort,
	StorageFileStatus,
	StorageFileType,
} from "@/entities/attachment/model/attachment.types";
import {
	useBulkDeleteWorkspaceFiles,
	useWorkspaceStorage,
	useWorkspaceStorageFiles,
} from "@/entities/attachment/model/storage.queries";
import { useWorkspaceEntitlements } from "@/entities/billing/model/billing.queries";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { cn } from "@/shared/lib/utils";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { NativeCheckbox } from "@/shared/ui/native-checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";

import { useSettingsDialog } from "../../model/use-settings-dialog";
import { SettingsHeader, formatSettingsDate } from "./settings-layout";

const ALL = "all";

const TYPE_LABELS: Record<StorageFileType, string> = {
	image: "Images",
	document: "Documents",
	other: "Other",
};

const TYPE_ICONS = {
	image: ImageIcon,
	document: FileText,
	other: Paperclip,
} satisfies Record<StorageFileType, unknown>;

const STATUS_STYLES: Record<StorageFileStatus, { label: string; className: string }> = {
	IN_USE: { label: "In use", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" },
	IN_TRASH: { label: "In trash", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
	ORPHANED: { label: "Unused", className: "bg-muted text-muted-foreground" },
};

const SORT_LABELS: Record<StorageFileSort, string> = {
	size_desc: "Largest first",
	created_desc: "Newest first",
	created_asc: "Oldest first",
};

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const units = ["KB", "MB", "GB", "TB"];
	let value = bytes / 1024;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	return `${value.toFixed(1)} ${units[unit]}`;
}

const selectTriggerClass =
	"min-w-0 border-input bg-background px-2.5 text-[13px] shadow-none data-[size=sm]:h-[30px]";

interface StorageSectionProps {
	workspaceId: string;
}

const StorageSection = ({ workspaceId }: StorageSectionProps) => {
	const setSettingsOpen = useSettingsDialog((state) => state.setOpen);
	const [type, setType] = useState<StorageFileType | typeof ALL>(ALL);
	const [status, setStatus] = useState<StorageFileStatus | typeof ALL>(ALL);
	const [sort, setSort] = useState<StorageFileSort>("size_desc");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [confirmOpen, setConfirmOpen] = useState(false);
	const debouncedSearch = useDebounce(search.trim());

	const params = useMemo(
		() => ({
			type: type === ALL ? undefined : type,
			status: status === ALL ? undefined : status,
			search: debouncedSearch || undefined,
			sort,
			page,
		}),
		[type, status, debouncedSearch, sort, page],
	);

	const usageQuery = useWorkspaceStorage(workspaceId);
	const entitlementsQuery = useWorkspaceEntitlements(workspaceId);
	const filesQuery = useWorkspaceStorageFiles(workspaceId, params);
	const bulkDelete = useBulkDeleteWorkspaceFiles(workspaceId);

	const goToPage = (nextPage: number) => {
		setPage(nextPage);
		setSelectedIds(new Set());
	};

	const usage = usageQuery.data;
	const canManageAll = usage?.canManageAll ?? false;
	const storageLimit = entitlementsQuery.data?.features.find(
		(feature) => feature.code === "MAX_STORAGE_MB",
	)?.limit;
	const storageLimitBytes =
		typeof storageLimit === "number" ? storageLimit * 1024 * 1024 : null;
	const barTotalBytes = storageLimitBytes ?? usage?.workspace.bytes ?? 0;
	const files = filesQuery.data?.data ?? [];
	const meta = filesQuery.data?.meta;
	const selectedFiles = files.filter((file) => selectedIds.has(file.id));
	const selectedBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
	const selectedInUse = selectedFiles.filter((file) => file.status === "IN_USE").length;
	const allSelected = files.length > 0 && selectedFiles.length === files.length;

	const toggle = (id: string) => {
		setSelectedIds((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleAll = () => {
		setSelectedIds(allSelected ? new Set() : new Set(files.map((file) => file.id)));
	};

	const confirmDelete = () => {
		bulkDelete.mutate(
			selectedFiles.map((file) => file.id),
			{
				onSuccess: ({ deletedCount }) => {
					toast.success(`Deleted ${deletedCount} file${deletedCount === 1 ? "" : "s"}`);
					setSelectedIds(new Set());
					setConfirmOpen(false);
				},
				onError: () => toast.error("Couldn't delete the files"),
			},
		);
	};

	return (
		<div>
			<SettingsHeader
				title='Storage'
				description={
					!usage
						? "Files uploaded to this workspace."
						: canManageAll
							? "Files uploaded to this workspace by every member."
							: "Files you uploaded to this workspace."
				}
			/>

			{usageQuery.isPending ? (
				<Skeleton className='mb-6 h-28 w-full rounded-xl' />
			) : usage ? (
				<section className='mb-6 rounded-xl border p-5'>
					<p className='text-[12.5px] leading-[19px] text-muted-foreground'>Workspace usage</p>
					<p className='mt-1 text-lg font-semibold leading-[27px]'>
						{formatBytes(usage.workspace.bytes)}
						{storageLimitBytes !== null && (
							<span className='text-[13px] font-normal text-muted-foreground'>
								{" "}of {formatBytes(storageLimitBytes)}
							</span>
						)}
						<span className='ml-2 text-[13px] font-normal text-muted-foreground'>
							{usage.workspace.count} files
						</span>
					</p>
					<div
						role={storageLimitBytes !== null ? "progressbar" : undefined}
						aria-label={storageLimitBytes !== null ? "Storage used of plan limit" : undefined}
						aria-valuemin={storageLimitBytes !== null ? 0 : undefined}
						aria-valuemax={storageLimitBytes ?? undefined}
						aria-valuenow={storageLimitBytes !== null ? usage.workspace.bytes : undefined}
						className='mt-3 flex h-2 overflow-hidden rounded-full bg-muted'
					>
						{(Object.keys(TYPE_LABELS) as StorageFileType[]).map((key) => (
							<div
								key={key}
								className={cn(
									key === "image" && "bg-sky-500",
									key === "document" && "bg-violet-500",
									key === "other" && "bg-zinc-400",
								)}
								style={{
									width: `${barTotalBytes ? Math.min(100, (usage.byType[key].bytes / barTotalBytes) * 100) : 0}%`,
								}}
							/>
						))}
					</div>
					<div className='mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-muted-foreground'>
						{(Object.keys(TYPE_LABELS) as StorageFileType[]).map((key) => (
							<span key={key}>
								{TYPE_LABELS[key]}: {formatBytes(usage.byType[key].bytes)}
							</span>
						))}
					</div>
					{!canManageAll && (
						<p className='mt-3 text-[13px]'>
							You uploaded {formatBytes(usage.mine.bytes)} ({usage.mine.count} files).
						</p>
					)}
				</section>
			) : null}

			<div className='mb-3 flex flex-wrap items-center gap-2'>
				<div className='relative min-w-[180px] flex-1'>
					<Search className='pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground' />
					<Input
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							goToPage(1);
						}}
						placeholder='Search file name'
						aria-label='Search file name'
						maxLength={100}
						className='h-[30px] pl-8 text-[13px]'
					/>
				</div>
				<Select value={type} onValueChange={(value) => {
					setType(value as StorageFileType | typeof ALL);
					goToPage(1);
				}}>
					<SelectTrigger size='sm' aria-label='File type' className={selectTriggerClass}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL}>All types</SelectItem>
						{(Object.keys(TYPE_LABELS) as StorageFileType[]).map((key) => (
							<SelectItem key={key} value={key}>{TYPE_LABELS[key]}</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={status} onValueChange={(value) => {
					setStatus(value as StorageFileStatus | typeof ALL);
					goToPage(1);
				}}>
					<SelectTrigger size='sm' aria-label='File status' className={selectTriggerClass}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ALL}>All statuses</SelectItem>
						{(Object.keys(STATUS_STYLES) as StorageFileStatus[]).map((key) => (
							<SelectItem key={key} value={key}>{STATUS_STYLES[key].label}</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={sort} onValueChange={(value) => {
					setSort(value as StorageFileSort);
					goToPage(1);
				}}>
					<SelectTrigger size='sm' aria-label='Sort files' className={selectTriggerClass}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{(Object.keys(SORT_LABELS) as StorageFileSort[]).map((key) => (
							<SelectItem key={key} value={key}>{SORT_LABELS[key]}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{selectedFiles.length > 0 && (
				<div className='mb-3 flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-3 py-2 text-[13px]'>
					<span>
						{selectedFiles.length} selected · {formatBytes(selectedBytes)}
					</span>
					<Button size='sm' variant='destructive' onClick={() => setConfirmOpen(true)}>
						Delete {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"}
					</Button>
				</div>
			)}

			{filesQuery.isPending ? (
				<Skeleton className='h-48 w-full rounded-xl' />
			) : filesQuery.isError ? (
				<div role='alert' className='flex flex-col items-center gap-3 rounded-xl border py-12 text-center'>
					<p className='text-sm text-muted-foreground'>Could not load the files.</p>
					<Button variant='outline' size='sm' onClick={() => void filesQuery.refetch()}>
						<RotateCw className='size-3.5' />
						Retry
					</Button>
				</div>
			) : files.length === 0 ? (
				<p className='rounded-xl border py-12 text-center text-sm text-muted-foreground'>No files found.</p>
			) : (
				<div className='overflow-x-auto rounded-xl border'>
					<table className='w-full text-left text-[13px]'>
						<thead className='border-b text-[12px] text-muted-foreground'>
							<tr>
								<th className='w-9 px-3 py-2'>
									<NativeCheckbox aria-label='Select all files' checked={allSelected} onChange={toggleAll} />
								</th>
								<th className='px-2 py-2 font-medium'>Name</th>
								<th className='px-2 py-2 font-medium'>Size</th>
								<th className='px-2 py-2 font-medium'>Location</th>
								{canManageAll && <th className='px-2 py-2 font-medium'>Uploaded by</th>}
								<th className='px-2 py-2 font-medium'>Date</th>
								<th className='px-2 py-2 font-medium'>Status</th>
							</tr>
						</thead>
						<tbody>
							{files.map((file) => {
								const Icon = TYPE_ICONS[file.type];
								const fileStatus = STATUS_STYLES[file.status];
								return (
									<tr key={file.id} className='border-b last:border-b-0'>
										<td className='px-3 py-2'>
											<NativeCheckbox
												aria-label={`Select ${file.fileName}`}
												checked={selectedIds.has(file.id)}
												onChange={() => toggle(file.id)}
											/>
										</td>
										<td className='max-w-[220px] px-2 py-2'>
											<span className='flex min-w-0 items-center gap-2'>
												<Icon className='size-3.5 shrink-0 text-muted-foreground' />
												<span className='truncate' title={file.fileName}>{file.fileName}</span>
											</span>
										</td>
										<td className='whitespace-nowrap px-2 py-2'>{formatBytes(file.size)}</td>
										<td className='max-w-[160px] truncate px-2 py-2'>
											{file.location && file.status === "IN_USE" ? (
												<Link
													href={`/page/${file.location.pageId}`}
													onClick={() => setSettingsOpen(false)}
													className='hover:underline'
												>
													{file.location.pageTitle || "Untitled"}
												</Link>
											) : (
												<span className='text-muted-foreground'>
													{file.location?.pageTitle || (file.location ? "Untitled" : "—")}
												</span>
											)}
										</td>
										{canManageAll && (
											<td className='max-w-[140px] truncate px-2 py-2'>{file.uploadedBy?.username ?? "—"}</td>
										)}
										<td className='whitespace-nowrap px-2 py-2'>{formatSettingsDate(file.createdAt)}</td>
										<td className='px-2 py-2'>
											<span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium", fileStatus.className)}>
												{fileStatus.label}
											</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{meta && meta.totalPages > 1 && (
				<div className='mt-3 flex items-center justify-end gap-2 text-[13px]'>
					<span className='text-muted-foreground'>
						Page {meta.page} of {meta.totalPages}
					</span>
					<Button size='sm' variant='outline' disabled={page <= 1} onClick={() => goToPage(page - 1)}>
						Previous
					</Button>
					<Button size='sm' variant='outline' disabled={page >= meta.totalPages} onClick={() => goToPage(page + 1)}>
						Next
					</Button>
				</div>
			)}

			<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This frees {formatBytes(selectedBytes)} and cannot be undone.
							{selectedInUse > 0 &&
								` ${selectedInUse} of them ${selectedInUse === 1 ? "is" : "are"} still used in a page and will stop showing there.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={bulkDelete.isPending}>Cancel</AlertDialogCancel>
						<AlertDialogAction disabled={bulkDelete.isPending} asChild>
							<Button variant='destructive' onClick={confirmDelete}>
								{bulkDelete.isPending ? "Deleting..." : "Delete"}
							</Button>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default StorageSection;
