import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";

type WorkspaceSummary = {
	id: string;
	name: string;
	slug: string;
};

type ProjectDropdownProps = {
	project: ProjectItems;
	workspace: WorkspaceSummary;
};

const ProjectDropdown = ({ project, workspace }: ProjectDropdownProps) => {
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
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type='button'
					className='flex size-5 items-center justify-center rounded-sm text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100'
				>
					<Ellipsis size={14} />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='start'
				side='right'
				sideOffset={12}
				className='w-64 border-neutral-700 bg-neutral-900 p-1 text-neutral-200 shadow-xl'
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className='px-2 py-1.5 text-xs font-medium text-neutral-500'>
						Project
					</DropdownMenuLabel>

					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<Pencil size={15} />
						<span>Doi ten project</span>
					</DropdownMenuItem>

					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<Link2 size={15} />
						<span>Sao chep lien ket</span>
					</DropdownMenuItem>

					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<ExternalLink size={15} />
						<span>Mo trong tab moi</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator className='my-1 bg-neutral-800' />

				<DropdownMenuGroup>
					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<PlayCircle size={15} />
						<span>Tao sprint moi</span>
					</DropdownMenuItem>

					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<Columns3 size={15} />
						<span>Them board / view</span>
					</DropdownMenuItem>

					{!isProjectVisibleInPage && (
						<DropdownMenuItem
							disabled={!page?.id || isPending}
							onSelect={handleShowInPage}
							className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'
						>
							<Eye size={15} />
							<span>Thêm vào trang</span>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>

				<DropdownMenuSeparator className='my-1 bg-neutral-800' />

				<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300'>
					<Trash2 size={15} />
					<span>Xoa project</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProjectDropdown;
