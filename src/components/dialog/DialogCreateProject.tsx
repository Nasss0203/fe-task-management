"use client";

import { useProject } from "@/features/project/hooks/useProject";
import { getFriendlyApiErrorMessage } from "@/lib/api-error-message";
import { ProjectDto } from "@/services/project/type";
import { Ellipsis, Plus, ListTodo, Calendar, Table2, FileUp, Files, Kanban, X } from "lucide-react";
import { useRef, useState, KeyboardEvent } from "react";
import { FaRegStar } from "react-icons/fa";
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
			toast.error(
				getFriendlyApiErrorMessage(
					error,
					"Không thể tạo dự án. Vui lòng thử lại.",
				),
			);
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
				className='flex! flex-col! max-h-[85vh] sm:max-w-3xl overflow-hidden border border-border/50 bg-background/95 backdrop-blur-xl p-0 shadow-2xl sm:rounded-2xl text-foreground'
			>
				{/* Top Bar / Header with gradient */}
				<div className='relative overflow-hidden border-b border-border/40 bg-muted/20 px-6 py-3.5 shrink-0'>
					<div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent' />
					<div className='relative'>
						<DialogHeaderV2 className='mb-0'>
							<DialogTitleV2>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2 flex-1'>
										<span className='font-normal text-xs text-muted-foreground uppercase tracking-wider'>
											Thêm vào
										</span>
										<span className='text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground'>
											{workspaceName}
										</span>
									</div>

									<div className='flex items-center text-muted-foreground'>
										<DialogCloseV2 asChild>
											<button type="button" className="p-1 rounded-md hover:bg-muted transition-colors outline-none cursor-pointer">
												<X size={16} />
											</button>
										</DialogCloseV2>
									</div>
								</div>
							</DialogTitleV2>
						</DialogHeaderV2>
					</div>
				</div>

				<div className='flex-1 overflow-auto px-6 md:px-12 py-6'>
					<div className='space-y-6'>
						{/* Title input with subtle bottom focus line */}
						<div className="relative group/input pb-2 border-b border-border/50 focus-within:border-primary/50 transition-colors">
							<textarea
								autoFocus
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder='Tên dự án mới...'
								rows={1}
								onInput={(e) => {
									const target = e.currentTarget;
									target.style.height = "auto";
									target.style.height = `${target.scrollHeight}px`;
								}}
								className='w-full resize-none overflow-hidden border-none bg-transparent text-2xl md:text-3xl font-extrabold outline-none ring-0 placeholder:text-muted-foreground/25 focus:outline-none focus:ring-0 leading-none text-foreground'
							/>
						</div>

						{/* Grid Actions container */}
						<div
							className={`transition-all duration-500 ease-in-out ${
								projectName.trim()
									? "opacity-100 translate-y-0"
									: "opacity-45 translate-y-1.5 pointer-events-none"
							}`}
						>
							<div className="space-y-8">
								{/* Database View types */}
								<div>
									<h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
										Chọn kiểu hiển thị mặc định
									</h4>
									<div className='grid grid-cols-2 md:grid-cols-4 gap-4 w-full'>
										{/* Board view card */}
										<button
											onClick={() => handleSelectBoard(BoardViewType.BOARD)}
											disabled={!projectName.trim() || isPending}
											className='flex flex-col items-start gap-3.5 p-4 rounded-2xl border border-border/80 bg-card hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-md transition-all duration-300 text-foreground group w-full text-left cursor-pointer'
										>
											<div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform duration-300">
												<Kanban size={18} />
											</div>
											<div>
												<div className="font-bold text-sm mb-1">Board</div>
												<div className="text-[11px] text-muted-foreground leading-normal">
													Quản lý công việc theo dạng bảng Kanban sinh động.
												</div>
											</div>
										</button>

										{/* Table view card */}
										<button
											onClick={() => handleSelectBoard(BoardViewType.TABLE)}
											disabled={!projectName.trim() || isPending}
											className='flex flex-col items-start gap-3.5 p-4 rounded-2xl border border-border/80 bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-md transition-all duration-300 text-foreground group w-full text-left cursor-pointer'
										>
											<div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-105 transition-transform duration-300">
												<Table2 size={18} />
											</div>
											<div>
												<div className="font-bold text-sm mb-1">Table</div>
												<div className="text-[11px] text-muted-foreground leading-normal">
													Hiển thị và cập nhật nhanh dữ liệu dạng bảng lưới.
												</div>
											</div>
										</button>

										{/* List view card */}
										<button
											onClick={() => handleSelectBoard(BoardViewType.LIST)}
											disabled={!projectName.trim() || isPending}
											className='flex flex-col items-start gap-3.5 p-4 rounded-2xl border border-border/80 bg-card hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:shadow-md transition-all duration-300 text-foreground group w-full text-left cursor-pointer'
										>
											<div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:scale-105 transition-transform duration-300">
												<ListTodo size={18} />
											</div>
											<div>
												<div className="font-bold text-sm mb-1">List</div>
												<div className="text-[11px] text-muted-foreground leading-normal">
													Danh sách các đầu công việc tối giản, trực quan.
												</div>
											</div>
										</button>

										{/* Calendar view card */}
										<button
											onClick={() => handleSelectBoard(BoardViewType.CALENDAR)}
											disabled={!projectName.trim() || isPending}
											className='flex flex-col items-start gap-3.5 p-4 rounded-2xl border border-border/80 bg-card hover:border-rose-500/50 hover:bg-rose-500/5 hover:shadow-md transition-all duration-300 text-foreground group w-full text-left cursor-pointer'
										>
											<div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-105 transition-transform duration-300">
												<Calendar size={18} />
											</div>
											<div>
												<div className="font-bold text-sm mb-1">Calendar</div>
												<div className="text-[11px] text-muted-foreground leading-normal">
													Quản lý công việc và thời hạn theo lịch biểu quan sát.
												</div>
											</div>
										</button>
									</div>
								</div>

								{/* Tools Section */}
								<div className="border-t border-border/40 pt-6">
									<h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
										Công cụ nâng cao
									</h4>
									<div className='flex flex-wrap gap-3 w-full'>
										<button
											type="button"
											disabled
											className='flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs border border-dashed border-border bg-muted/10 text-muted-foreground hover:bg-muted/20 transition-all opacity-60 cursor-not-allowed'
										>
											<Files size={14} />
											<span className="font-semibold">Sử dụng mẫu dự án</span>
										</button>
										<button
											type="button"
											disabled
											className='flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs border border-dashed border-border bg-muted/10 text-muted-foreground hover:bg-muted/20 transition-all opacity-60 cursor-not-allowed'
										>
											<FileUp size={14} />
											<span className="font-semibold">Nhập dữ liệu (Import)</span>
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
