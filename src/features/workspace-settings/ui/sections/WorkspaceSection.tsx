import { useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
	useMoveWorkspaceToTrash,
	useSelectWorkspace,
	useUpdateWorkspace,
} from "@/entities/workspace/model/workspace.mutations";
import {
	useWorkspace,
	useWorkspaceAccess,
	workspaceKeys,
} from "@/entities/workspace/model/workspace.queries";
import type { Workspace } from "@/entities/workspace/model/workspace.types";
import { useUser } from "@/features/auth";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
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
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Skeleton } from "@/shared/ui/skeleton";

import { useSettingsDialog } from "../../model/use-settings-dialog";
import {
	DangerZone,
	SettingsGroup,
	SettingsHeader,
	SettingsRow,
	formatSettingsDate,
} from "./settings-layout";

const DEFAULT_WORKSPACE_ICON = "🏠";
const WORKSPACE_ICON_CHOICES = [
	"🏠", "🏢", "🚀", "💼", "📁", "📚", "🧠", "💡",
	"🎯", "🛠️", "📈", "🧪", "🎨", "🌍", "🏆", "⭐",
	"🔥", "🌱", "🍀", "🌊", "⚡", "🎓", "🏫", "❤️",
];

interface WorkspaceSectionProps {
	workspaceId: string;
}

const WorkspaceSection = ({ workspaceId }: WorkspaceSectionProps) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { user, setUser } = useUser();
	const setSettingsOpen = useSettingsDialog((state) => state.setOpen);

	const { data: workspace, isLoading } = useWorkspace(workspaceId);
	const { data: access } = useWorkspaceAccess(workspaceId);
	const permissions = access?.permissions ?? [];
	const canUpdate = permissions.includes("workspace.update");
	const canDelete = permissions.includes("workspace.delete");

	const updateMutation = useUpdateWorkspace(workspaceId);
	const trashMutation = useMoveWorkspaceToTrash();
	const selectWorkspaceMutation = useSelectWorkspace();

	const [name, setName] = useState("");
	const [syncedName, setSyncedName] = useState<string>();
	const [copied, setCopied] = useState(false);
	const [iconPickerOpen, setIconPickerOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmText, setConfirmText] = useState("");

	if (workspace && workspace.name !== syncedName) {
		setSyncedName(workspace.name);
		setName(workspace.name);
	}

	if (isLoading || !workspace) {
		return (
			<div className='space-y-4'>
				<Skeleton className='h-8 w-40' />
				<Skeleton className='h-4 w-72' />
				<Skeleton className='mt-8 h-40 w-full' />
			</div>
		);
	}

	const trimmedName = name.trim();
	const nameChanged = trimmedName !== workspace.name;

	const saveName = () => {
		if (!nameChanged || !trimmedName || updateMutation.isPending) {
			setName(workspace.name);
			return;
		}
		updateMutation.mutate(
			{ name: trimmedName },
			{
				onSuccess: () => toast.success("Workspace renamed"),
				onError: (error) => {
					setName(workspace.name);
					toast.error(
						getApiErrorMessage(error, "Could not rename the workspace."),
					);
				},
			},
		);
	};

	const saveIcon = (icon: string | null) => {
		setIconPickerOpen(false);
		if (icon === (workspace.icon ?? null)) return;
		updateMutation.mutate(
			{ icon },
			{
				onError: (error) =>
					toast.error(getApiErrorMessage(error, "Could not update the icon.")),
			},
		);
	};

	const copyId = async () => {
		try {
			await navigator.clipboard.writeText(workspace.id);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error("Could not copy to clipboard");
		}
	};

	const moveToTrash = async () => {
		try {
			await trashMutation.mutateAsync(workspaceId);
		} catch (error) {
			toast.error(
				getApiErrorMessage(error, "Could not move the workspace to trash."),
			);
			return;
		}

		const remaining = (
			queryClient.getQueryData<Workspace[]>(workspaceKeys.all) ?? []
		).filter((item) => item.id !== workspaceId);
		const nextWorkspace = remaining[0];

		if (nextWorkspace) {
			try {
				await selectWorkspaceMutation.mutateAsync(nextWorkspace.id);
			} catch {
				if (user) setUser({ ...user, lastActiveWorkspaceId: nextWorkspace.id });
			}
		} else if (user) {
			setUser({ ...user, lastActiveWorkspaceId: null });
		}

		setConfirmOpen(false);
		setSettingsOpen(false);
		toast.success("Workspace moved to trash");
		router.replace("/dashboard");
	};

	return (
		<div>
			<SettingsHeader
				title='Workspace'
				description='Manage the name and details of this workspace.'
			/>

			<SettingsGroup title='General'>
				<SettingsRow
					label='Name'
					description={
						canUpdate
							? "Press Enter or click outside to save."
							: "Only workspace owners can rename the workspace."
					}
				>
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						onBlur={saveName}
						onKeyDown={(event) => {
							if (event.key === "Enter") event.currentTarget.blur();
							if (event.key === "Escape") setName(workspace.name);
						}}
						maxLength={255}
						disabled={!canUpdate || updateMutation.isPending}
						aria-label='Workspace name'
						aria-invalid={!trimmedName}
						className='w-64'
					/>
				</SettingsRow>
				<SettingsRow
					label='Icon'
					description='Shown next to the workspace name in the sidebar.'
				>
					<Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
						<PopoverTrigger asChild disabled={!canUpdate || updateMutation.isPending}>
							<button
								type='button'
								aria-label='Change workspace icon'
								className='flex size-10 items-center justify-center rounded-lg border bg-muted/50 text-xl transition-colors enabled:hover:bg-muted disabled:cursor-default'
							>
								{workspace.icon || DEFAULT_WORKSPACE_ICON}
							</button>
						</PopoverTrigger>
						<PopoverContent align='end' className='w-72 p-3'>
							<div className='mb-2 flex items-center justify-between'>
								<span className='text-xs font-medium text-muted-foreground'>
									Pick an icon
								</span>
								{workspace.icon && (
									<Button
										type='button'
										variant='ghost'
										size='xs'
										onClick={() => saveIcon(null)}
									>
										Reset
									</Button>
								)}
							</div>
							<div className='grid grid-cols-8 gap-1'>
								{WORKSPACE_ICON_CHOICES.map((choice) => (
									<button
										key={choice}
										type='button'
										onClick={() => saveIcon(choice)}
										className={cn(
											"flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted",
											workspace.icon === choice &&
												"bg-muted ring-1 ring-foreground/20",
										)}
									>
										{choice}
									</button>
								))}
							</div>
						</PopoverContent>
					</Popover>
				</SettingsRow>
			</SettingsGroup>

			<SettingsGroup title='Details'>
				<SettingsRow label='Workspace ID' description='Useful when contacting support.'>
					<div className='flex items-center gap-2'>
						<code className='max-w-56 truncate rounded-md bg-muted px-2 py-1 text-xs'>
							{workspace.id}
						</code>
						<Button
							variant='ghost'
							size='icon-sm'
							onClick={copyId}
							aria-label='Copy workspace ID'
						>
							{copied ? <Check className='size-4' /> : <Copy className='size-4' />}
						</Button>
					</div>
				</SettingsRow>
				<SettingsRow label='Created'>
					<span className='text-sm text-muted-foreground'>
						{formatSettingsDate(workspace.createdAt)}
					</span>
				</SettingsRow>
				<SettingsRow label='Last updated'>
					<span className='text-sm text-muted-foreground'>
						{formatSettingsDate(workspace.updatedAt)}
					</span>
				</SettingsRow>
			</SettingsGroup>

			{canDelete && (
				<DangerZone>
					<SettingsRow
						label='Move workspace to trash'
						description='Everyone loses access. The workspace is kept in trash and can be restored later.'
					>
						<Button
							variant='destructive'
							size='sm'
							onClick={() => {
								setConfirmText("");
								setConfirmOpen(true);
							}}
						>
							<Trash2 className='size-4' />
							Move to trash
						</Button>
					</SettingsRow>
				</DangerZone>
			)}

			<AlertDialog
				open={confirmOpen}
				onOpenChange={(open) => !trashMutation.isPending && setConfirmOpen(open)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Move “{workspace.name}” to trash?</AlertDialogTitle>
						<AlertDialogDescription>
							All members lose access until it is restored. Type the workspace
							name to confirm.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<Input
						value={confirmText}
						onChange={(event) => setConfirmText(event.target.value)}
						placeholder={workspace.name}
						aria-label='Type the workspace name to confirm'
					/>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={trashMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							variant='destructive'
							disabled={
								trashMutation.isPending || confirmText.trim() !== workspace.name
							}
							onClick={(event) => {
								event.preventDefault();
								void moveToTrash();
							}}
						>
							{trashMutation.isPending ? "Moving..." : "Move to trash"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default WorkspaceSection;
