import ProjectTrashDialog from "@/features/project/components/project/ProjectTrashDialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERMISSIONS } from "@/constants/permissions";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { useBoards } from "@/features/board/hooks/useBoards";
import { usePageBlock } from "@/features/page-block/hooks/usePageBlock";
import { BoardViewType } from "@/services/board/type";
import { findPage } from "@/services/page/page.service";
import { PAGE_KEY } from "@/services/page/type";
import {
	normalizeDatabaseViewConfig,
	PageBlockType,
} from "@/services/page_block/type";
import { ProjectItems } from "@/services/project/type";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Columns3,
	Ellipsis,
	ExternalLink,
	Eye,
	Link2,
	Pencil,
	PlayCircle,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type WorkspaceSummary = {
	id: string;
	name: string;
	slug: string;
};

type ProjectDropdownProps = {
	project: ProjectItems;
	workspace: WorkspaceSummary;
	onRenameProject?: () => void;
};

const ProjectDropdown = ({ project, workspace, onRenameProject }: ProjectDropdownProps) => {
	const [openTrashDialog, setOpenTrashDialog] = useState(false);
	const queryClient = useQueryClient();
	const {
		createPageBlock: { mutateAsync: createBlock, isPending },
	} = usePageBlock();
	const { findBoard } = useBoards({
		workspaceId: workspace.id,
		projectId: project.id,
	});
	const { data: pageData } = useQuery({
		queryKey: [PAGE_KEY.PAGE, workspace.id],
		queryFn: () => findPage(workspace.id),
		enabled: !!workspace.id,
	});

	const page = pageData?.data;
	const boards = findBoard.data?.data ?? [];
	const databaseViewBlock = page?.blocks?.find((block) => {
		if (block.type !== PageBlockType.DATABASE_VIEW) return false;

		const config = normalizeDatabaseViewConfig(block.data_config);
		return config?.project_id === project.id;
	});
	const isProjectVisibleInPage = !!databaseViewBlock;

	const handleShowInPage = async () => {
		if (!page?.id || !project.id || isPending) return;

		const defaultBoard = boards[0];

		try {
			await createBlock({
				page_id: page.id,
				type: PageBlockType.DATABASE_VIEW,
				title: project.name ?? "Untitled project",
				content: null,
				style_config: null,
				data_config: {
					project_id: project.id,
					workspace_id: workspace.id,
					default_board_id: defaultBoard?.id ?? null,
					default_view_type:
						defaultBoard?.viewType ?? BoardViewType.BOARD,
				},
				is_open: true,
			});

			await queryClient.invalidateQueries({
				queryKey: [PAGE_KEY.PAGE, workspace.id],
			});

			toast.success("Project da hien thi trong page.");
		} catch (error) {
			console.error("showProjectInPage failed", error);
			toast.error("Khong the hien thi project trong page.");
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type='button'
						className='flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground'
					>
						<Ellipsis size={14} />
					</button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					align='start'
					side='right'
					sideOffset={12}
					className='w-64 border-border bg-background p-1 text-foreground shadow-xl'
				>
					<DropdownMenuGroup>
						<DropdownMenuLabel className='px-2 py-1.5 text-xs font-medium text-muted-foreground'>
							Project
						</DropdownMenuLabel>

						<DropdownMenuItem
							onSelect={() => {
								if (onRenameProject) {
									onRenameProject();
								} else {
									toast.info(
										"Rename project se duoc noi tiep khi backend update metadata san sang.",
									);
								}
							}}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
						>
							<Pencil size={15} />
							<span>Doi ten project</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							onSelect={async () => {
								const targetUrl = `${window.location.origin}/dashboard/${workspace.slug}/projects/${project.id}`;

								try {
									await navigator.clipboard.writeText(targetUrl);
									toast.success("Da sao chep lien ket project.");
								} catch (error) {
									console.error("copyProjectLink failed", error);
									toast.error("Khong the sao chep lien ket project.");
								}
							}}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
						>
							<Link2 size={15} />
							<span>Sao chep lien ket</span>
						</DropdownMenuItem>

						<DropdownMenuItem asChild>
							<Link
								href={`/dashboard/${workspace.slug}/projects/${project.id}`}
								target='_blank'
								className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
							>
								<ExternalLink size={15} />
								<span>Mo trong tab moi</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator className='my-1 bg-muted' />

					<DropdownMenuGroup>
						<RequirePermission
							workspaceId={workspace.id}
							code={PERMISSIONS.SPRINT_CREATE}
						>
							<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'>
								<PlayCircle size={15} />
								<span>Tao sprint moi</span>
							</DropdownMenuItem>
						</RequirePermission>

						<RequirePermission
							workspaceId={workspace.id}
							code={PERMISSIONS.BOARD_CREATE}
						>
							<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'>
								<Columns3 size={15} />
								<span>Them board / view</span>
							</DropdownMenuItem>
						</RequirePermission>

						{!isProjectVisibleInPage && (
							<RequirePermission
								workspaceId={workspace.id}
								code={PERMISSIONS.PAGE_BLOCK_CREATE}
							>
								<DropdownMenuItem
									disabled={!page?.id || isPending}
									onSelect={handleShowInPage}
									className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:focus:bg-accent focus:text-accent-foreground focus:text-foreground'
								>
									<Eye size={15} />
									<span>Them vao trang</span>
								</DropdownMenuItem>
							</RequirePermission>
						)}
					</DropdownMenuGroup>

					<DropdownMenuSeparator className='my-1 bg-muted' />

					<RequirePermission
						workspaceId={workspace.id}
						code={PERMISSIONS.PROJECT_DELETE}
					>
						<DropdownMenuItem
							onSelect={() => setOpenTrashDialog(true)}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300'
						>
							<Trash2 size={15} />
							<span>Xoa project</span>
						</DropdownMenuItem>
					</RequirePermission>
				</DropdownMenuContent>
			</DropdownMenu>

			<ProjectTrashDialog
				project={project}
				workspace={workspace}
				open={openTrashDialog}
				onOpenChange={setOpenTrashDialog}
				pageId={page?.id}
				projectBlock={databaseViewBlock ?? null}
			/>
		</>
	);
};

export default ProjectDropdown;
