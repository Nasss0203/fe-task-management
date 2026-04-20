"use client";

import { useProject } from "@/hooks/use-project";
import { ProjectDto } from "@/services/project/type";
import { Ellipsis, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";

import { BoardViewType } from "@/services/board/type";
import {
	DialogContentV2,
	DialogFooterV2,
	DialogHeaderV2,
	DialogTitleV2,
	DialogTriggerV2,
	DialogV2,
} from "./dialog-custom";
import DialogSelectBoard from "./DialogSelectBoard";

type Props = {
	workspaceId: string;
	workspaceName: string;
};

const DialogTask = ({ workspaceId, workspaceName }: Props) => {
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

		await mutateAsync(data);
		resetState();
		setOpen(false);
	};

	const handleOpenChange = async (nextOpen: boolean) => {
		// mở dialog
		if (nextOpen) {
			setOpen(true);
			setProjectName("");
			createdByBoardRef.current = false;
			return;
		}

		// đóng dialog
		if (open && !nextOpen) {
			const trimmedName = projectName.trim();

			// nếu vừa tạo bằng click board rồi thì chỉ đóng thôi
			if (createdByBoardRef.current) {
				resetState();
				setOpen(false);
				return;
			}

			// nếu có nhập tên thì đóng dialog sẽ tạo project trống
			if (trimmedName && !isPending) {
				await createProject({
					createDefaultBoard: false,
					viewType: BoardViewType.BOARD,
				});
				return;
			}

			// không nhập gì thì đóng bình thường
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

	return (
		<DialogV2 open={open} onOpenChange={handleOpenChange}>
			<DialogTriggerV2 asChild>
				<Plus size={16} className='hover:bg-neutral-700 rounded-xs' />
			</DialogTriggerV2>

			<DialogContentV2
				showCloseButton={false}
				className='flex! flex-col!'
			>
				<DialogHeaderV2 className='shrink-0'>
					<DialogTitleV2>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3 flex-1'>
								<div className='font-normal text-lg text-neutral-500'>
									Thêm vào
								</div>
								<div className='text-lg outline-none border-none flex-1 bg-transparent'>
									{workspaceName}
								</div>
							</div>

							<div className='flex items-center gap-2'>
								<FaRegStar />
								<FaStar className='text-yellow-500' />
								<Ellipsis />
							</div>
						</div>
					</DialogTitleV2>
				</DialogHeaderV2>

				<div className='flex-1 overflow-auto mt-10'>
					<div className='mx-30'>
						<textarea
							autoFocus
							value={projectName}
							onChange={(e) => setProjectName(e.target.value)}
							placeholder='New page'
							rows={1}
							onInput={(e) => {
								const target = e.currentTarget;
								target.style.height = "auto";
								target.style.height = `${target.scrollHeight}px`;
							}}
							className='w-full resize-none overflow-hidden border-none bg-transparent text-3xl font-extrabold outline-none ring-0 placeholder:text-2xl placeholder:font-bold focus:outline-none focus:ring-0'
						/>
					</div>
				</div>

				<DialogFooterV2 className='shrink-0 mt-5'>
					<DialogSelectBoard
						disabled={!projectName.trim() || isPending}
						onSelect={handleSelectBoard}
					/>
				</DialogFooterV2>
			</DialogContentV2>
		</DialogV2>
	);
};

export default DialogTask;
