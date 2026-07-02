"use client";

import { useProject } from "@/features/project/hooks/useProject";
import { ProjectDto } from "@/services/project/type";
import axios from "axios";
import { Ellipsis, Plus, LayoutGrid, ListTodo, Calendar, Table2, Image as ImageIcon, Presentation, FileUp, Files, Kanban, X } from "lucide-react";
import { useRef, useState, KeyboardEvent } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { toast } from "sonner";

import { BoardViewType } from "@/services/board/type";
import {
	DialogContentV2,
	DialogHeaderV2,
	DialogTitleV2,
	DialogTriggerV2,
	DialogV2,
	DialogCloseV2,
} from "./dialog-custom";

type Props = {
	workspaceId: string;
	workspaceName: string;
};

type ApiErrorResponse = {
	message?: string | string[] | { message?: string };
};

const getCreateProjectErrorMessage = (error: unknown) => {
	if (!axios.isAxiosError<ApiErrorResponse>(error)) {
		return "Create project failed. Please try again.";
	}

	const message = error.response?.data?.message;

	if (Array.isArray(message)) {
		return message.join(", ");
	}

	if (typeof message === "object" && message?.message) {
		return message.message;
	}

	if (typeof message === "string") {
		return message;
	}

	return "Create project failed. Please try again.";
};

const DialogCreateProject = ({ workspaceId, workspaceName }: Props) => {
	const [open, setOpen] = useState(false);
	const [projectName, setProjectName] = useState("");

	const createdByBoardRef = useRef(false);

	const {
		createProject: { mutateAsync, isPending },
	} = useProject();

	const resetState = () => {
		setProjectName("");
		createdByBoardRef.current = false;
	};

	const createProject = async ({
		createDefaultBoard,
		viewType,
	}: {
		createDefaultBoard: boolean;
		viewType: BoardViewType;
	}) => {
		const trimmedName = projectName.trim();

		if (!trimmedName || isPending) return;

		const data: ProjectDto = {
			workspace_id: workspaceId,
			name: trimmedName,
			create_default_board: createDefaultBoard,
			default_board_view_type: viewType,
		};

		try {
			await mutateAsync(data);
			resetState();
			setOpen(false);
		} catch (error) {
			createdByBoardRef.current = false;
			toast.error(getCreateProjectErrorMessage(error));
		}
	};

	const handleOpenChange = async (nextOpen: boolean) => {
		if (nextOpen) {
			setOpen(true);
			setProjectName("");
			createdByBoardRef.current = false;
			return;
		}

		if (open && !nextOpen) {
			const trimmedName = projectName.trim();

			if (createdByBoardRef.current) {
				resetState();
				setOpen(false);
				return;
			}

			if (trimmedName && !isPending) {
				await createProject({
					createDefaultBoard: false,
					viewType: BoardViewType.BOARD,
				});
				return;
			}

			resetState();
			setOpen(false);
		}
	};

	const handleSelectBoard = async (viewType: BoardViewType) => {
		if (!projectName.trim() || isPending) return;

		createdByBoardRef.current = true;

		await createProject({
			createDefaultBoard: true,
			viewType,
		});
	};

	const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			const trimmedName = projectName.trim();
			if (trimmedName && !isPending) {
				await createProject({
					createDefaultBoard: false,
					viewType: BoardViewType.BOARD,
				});
			}
		}
	};

	return (
		<DialogV2 open={open} onOpenChange={handleOpenChange}>
			<DialogTriggerV2 asChild>
				<div className='flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:hover:bg-accent hover:text-accent-foreground hover:hover:text-foreground cursor-pointer transition-colors'>
					<Plus size={14} />
				</div>
			</DialogTriggerV2>

			<DialogContentV2
				showCloseButton={false}
				className='flex! flex-col! min-h-[60vh] max-h-[90vh] sm:max-w-4xl'
			>
				<DialogHeaderV2 className='shrink-0'>
					<DialogTitleV2>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3 flex-1'>
								<div className='font-normal text-sm text-muted-foreground'>
									Thêm vào
								</div>
								<div className='text-sm font-medium outline-none border-none flex-1 bg-transparent'>
									{workspaceName}
								</div>
							</div>

							<div className='flex items-center gap-3 text-muted-foreground'>
								<FaRegStar className="cursor-pointer hover:text-foreground transition-colors" />
								<Ellipsis className="cursor-pointer hover:text-foreground transition-colors" size={18} />
								<DialogCloseV2 asChild>
									<X className="cursor-pointer hover:text-foreground transition-colors outline-none" size={18} />
								</DialogCloseV2>
							</div>
						</div>
					</DialogTitleV2>
				</DialogHeaderV2>

				<div className='flex-1 overflow-auto mt-8'>
					<div className='mx-10 md:mx-20'>
						<textarea
							autoFocus
							value={projectName}
							onChange={(e) => setProjectName(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder='New Project'
							rows={1}
							onInput={(e) => {
								const target = e.currentTarget;
								target.style.height = "auto";
								target.style.height = `${target.scrollHeight}px`;
							}}
							className='w-full resize-none overflow-hidden border-none bg-transparent text-5xl font-extrabold outline-none ring-0 placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 leading-tight'
						/>

						{/* Quick Actions - Grid Style */}
						<div
							className={`mt-10 transition-all duration-500 ease-in-out ${projectName.trim()
								? "opacity-100 translate-y-0"
								: "opacity-40 translate-y-2 pointer-events-none"
								}`}
						>

							<div className="space-y-6">
								{/* Database Section */}
								<div>
									<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Cơ sở dữ liệu</h4>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-3 w-full'>
										<button
											onClick={() => handleSelectBoard(BoardViewType.BOARD)}
											disabled={!projectName.trim() || isPending}
											className='flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-sm text-foreground group w-full text-left'
										>
											<div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
												<Kanban size={20} />
											</div>
											<div>
												<div className="font-semibold text-base mb-1">Board</div>
												<div className="text-xs text-muted-foreground">Quản lý công việc theo dạng bảng Kanban</div>
											</div>
										</button>

										<button
											onClick={() => handleSelectBoard(BoardViewType.TABLE)}
											disabled={!projectName.trim() || isPending}
											className='flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-sm text-foreground group w-full text-left'
										>
											<div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
												<Table2 size={20} />
											</div>
											<div>
												<div className="font-semibold text-base mb-1 flex items-center gap-2">Table</div>
												<div className="text-xs text-muted-foreground">Hiển thị dữ liệu dạng bảng lưới</div>
											</div>
										</button>

										<button
											onClick={() => handleSelectBoard(BoardViewType.LIST)}
											disabled={!projectName.trim() || isPending}
											className='flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-sm text-foreground group w-full text-left'
										>
											<div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
												<ListTodo size={20} />
											</div>
											<div>
												<div className="font-semibold text-base mb-1 flex items-center gap-2">List</div>
												<div className="text-xs text-muted-foreground">Danh sách công việc đơn giản</div>
											</div>
										</button>

										<button
											onClick={() => handleSelectBoard(BoardViewType.CALENDAR)}
											disabled={!projectName.trim() || isPending}
											className='flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all text-sm text-foreground group w-full text-left'
										>
											<div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
												<Calendar size={20} />
											</div>
											<div>
												<div className="font-semibold text-base mb-1 flex items-center gap-2">Calendar</div>
												<div className="text-xs text-muted-foreground">Quản lý theo lịch biểu trình</div>
											</div>
										</button>
									</div>
								</div>

								{/* Tools Section */}
								<div>
									<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Công cụ khác</h4>
									<div className='flex gap-4 w-full'>
										<button
											disabled
											className='flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors opacity-60 cursor-not-allowed'
										>
											<Files size={16} />
											<span className="font-medium">Từ thư viện mẫu</span>
										</button>
										<button
											disabled
											className='flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors opacity-60 cursor-not-allowed'
										>
											<FileUp size={16} />
											<span className="font-medium">Nhập (Import)</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</DialogContentV2>
		</DialogV2>
	);
};

export default DialogCreateProject;
