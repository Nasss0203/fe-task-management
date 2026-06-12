"use client";

import { useMemo, useState, useEffect } from "react";
import { useTaskFilterStore } from "@/stores/use-task-filter";
import { FindBacklogTasksFilters } from "@/services/task/type";
import { useTaskPriority, useTaskStatus } from "@/features/task/hooks/useTask";
import { useMember } from "@/features/member/hooks/useMember";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, Type, CircleDashed, Flag, User, Check, Plus } from "lucide-react";
import { useDebounced } from "@/hooks/useDebounce";

type ProjectTaskFilterProps = {
	workspaceId: string;
	projectId: string;
};

type FilterView = "main" | "search" | "status" | "priority" | "assignee";

export const ProjectTaskFilter = ({ workspaceId, projectId }: ProjectTaskFilterProps) => {
	const filtersByProject = useTaskFilterStore(state => state.filtersByProject);
	const setFiltersGlobal = useTaskFilterStore(state => state.setFilters);
	const resetFiltersGlobal = useTaskFilterStore(state => state.resetFilters);

	const filters = filtersByProject[projectId] || {};
	const setFilters = useMemo(() => {
		return (f: Partial<FindBacklogTasksFilters>) => setFiltersGlobal(projectId, f);
	}, [projectId, setFiltersGlobal]);
	const resetFilters = useMemo(() => {
		return () => resetFiltersGlobal(projectId);
	}, [projectId, resetFiltersGlobal]);

	const { findAllMember } = useMember({ workspaceId });
	const { data: taskStatusData } = useTaskStatus(workspaceId, projectId);
	const { data: taskPriorityData } = useTaskPriority(workspaceId, projectId);

	const [open, setOpen] = useState(false);
	const [view, setView] = useState<FilterView>("main");

	const [localSearch, setLocalSearch] = useState(filters.search ?? "");
	const debouncedSearch = useDebounced(localSearch, 400);

	useEffect(() => {
		setFilters({ search: debouncedSearch || undefined });
	}, [debouncedSearch, setFilters]);

	useEffect(() => {
		if (filters.search === undefined) {
			setLocalSearch("");
		}
	}, [filters.search]);

	// Reset view when popover closes
	useEffect(() => {
		if (!open) {
			setTimeout(() => setView("main"), 200); // delay so it doesn't blink while closing
		}
	}, [open]);

	const statusOptions = useMemo(
		() => (taskStatusData?.data ?? []).map((status) => ({ value: status.id, label: status.name })),
		[taskStatusData?.data]
	);

	const priorityOptions = useMemo(
		() => (taskPriorityData?.data ?? []).map((priority) => ({ value: priority.id, label: priority.name })),
		[taskPriorityData?.data]
	);

	const assigneeOptions = useMemo(() => {
		const members = (findAllMember.data?.data ?? []) as any[];
		return members.map((member) => ({
			value: member.user_id,
			label: member.full_name || member.email || "Chưa đặt tên",
		})).sort((a, b) => a.label.localeCompare(b.label));
	}, [findAllMember.data?.data]);

	const getStatusLabel = (id: string | string[]) => {
		const val = Array.isArray(id) ? id[0] : id;
		return statusOptions.find(o => o.value === val)?.label ?? "Trạng thái";
	};
	const getPriorityLabel = (id: string | string[]) => {
		const val = Array.isArray(id) ? id[0] : id;
		return priorityOptions.find(o => o.value === val)?.label ?? "Độ ưu tiên";
	};
	const getAssigneeLabel = (id: string | string[]) => {
		const val = Array.isArray(id) ? id[0] : id;
		return assigneeOptions.find(o => o.value === val)?.label ?? "Người phụ trách";
	};

	return (
		<div className="flex items-center gap-2 flex-wrap">
			{/* Active Filters as Badges */}
			{filters.search && (
				<Badge variant="secondary" className="flex items-center gap-1.5 h-8 px-2 cursor-pointer border border-border/50 bg-background hover:bg-muted/50" onClick={() => { setView("search"); setOpen(true); }}>
					<Type className="w-3.5 h-3.5 text-muted-foreground" />
					<span className="font-normal text-xs">{filters.search}</span>
					<button onClick={(e) => { e.stopPropagation(); setFilters({ search: undefined }); }} className="ml-0.5 p-0.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
						<X className="w-3 h-3" />
					</button>
				</Badge>
			)}
			{filters.statusId && (
				<Badge variant="secondary" className="flex items-center gap-1.5 h-8 px-2 cursor-pointer border border-border/50 bg-background hover:bg-muted/50" onClick={() => { setView("status"); setOpen(true); }}>
					<CircleDashed className="w-3.5 h-3.5 text-muted-foreground" />
					<span className="font-normal text-xs">{getStatusLabel(filters.statusId)}</span>
					<button onClick={(e) => { e.stopPropagation(); setFilters({ statusId: undefined }); }} className="ml-0.5 p-0.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
						<X className="w-3 h-3" />
					</button>
				</Badge>
			)}
			{filters.priorityId && (
				<Badge variant="secondary" className="flex items-center gap-1.5 h-8 px-2 cursor-pointer border border-border/50 bg-background hover:bg-muted/50" onClick={() => { setView("priority"); setOpen(true); }}>
					<Flag className="w-3.5 h-3.5 text-muted-foreground" />
					<span className="font-normal text-xs">{getPriorityLabel(filters.priorityId)}</span>
					<button onClick={(e) => { e.stopPropagation(); setFilters({ priorityId: undefined }); }} className="ml-0.5 p-0.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
						<X className="w-3 h-3" />
					</button>
				</Badge>
			)}
			{filters.assigneeId && (
				<Badge variant="secondary" className="flex items-center gap-1.5 h-8 px-2 cursor-pointer border border-border/50 bg-background hover:bg-muted/50" onClick={() => { setView("assignee"); setOpen(true); }}>
					<User className="w-3.5 h-3.5 text-muted-foreground" />
					<span className="font-normal text-xs">{getAssigneeLabel(filters.assigneeId)}</span>
					<button onClick={(e) => { e.stopPropagation(); setFilters({ assigneeId: undefined }); }} className="ml-0.5 p-0.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
						<X className="w-3 h-3" />
					</button>
				</Badge>
			)}

			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="sm" className="h-8 text-muted-foreground font-medium text-xs px-2.5">
						<Plus className="w-3.5 h-3.5 mr-1.5" /> Bộ lọc
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[280px] p-0 shadow-xl rounded-xl border-border/60" align="start">
					{view === "main" && (
						<Command>
							<CommandInput placeholder="Lọc theo..." className="text-[13px] h-10 border-0 focus:ring-0" />
							<CommandList>
								<CommandEmpty className="py-6 text-center text-sm">Không tìm thấy.</CommandEmpty>
								<CommandGroup>
									<CommandItem onSelect={() => setView("search")} className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5">
										<Type className="mr-2.5 h-4 w-4 text-muted-foreground" /> Từ khóa tìm kiếm
									</CommandItem>
									<CommandItem onSelect={() => setView("status")} className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5">
										<CircleDashed className="mr-2.5 h-4 w-4 text-muted-foreground" /> Trạng thái
									</CommandItem>
									<CommandItem onSelect={() => setView("priority")} className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5">
										<Flag className="mr-2.5 h-4 w-4 text-muted-foreground" /> Độ ưu tiên
									</CommandItem>
									<CommandItem onSelect={() => setView("assignee")} className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5">
										<User className="mr-2.5 h-4 w-4 text-muted-foreground" /> Người phụ trách
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					)}

					{view === "search" && (
						<div className="p-3">
							<div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
								<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full hover:bg-muted" onClick={() => setView("main")}>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<span className="font-semibold text-[13px] flex-1">Từ khóa tìm kiếm</span>
							</div>
							<Input
								autoFocus
								placeholder="Nhập từ khóa (tên, ID)..."
								value={localSearch}
								onChange={(e) => setLocalSearch(e.target.value)}
								className="h-9 text-[13px] bg-muted/40"
							/>
						</div>
					)}

					{view === "status" && (
						<Command>
							<div className="flex items-center gap-2 p-2 border-b border-border/50">
								<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full hover:bg-muted" onClick={() => setView("main")}>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<span className="font-semibold text-[13px] flex-1">Trạng thái</span>
							</div>
							<CommandInput placeholder="Tìm trạng thái..." className="text-[13px] h-10 border-0 focus:ring-0" />
							<CommandList>
								<CommandEmpty className="py-6 text-center text-sm">Không tìm thấy.</CommandEmpty>
								<CommandGroup>
									<CommandItem
										onSelect={() => { setFilters({ statusId: undefined }); setOpen(false); }}
										className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5"
									>
										<div className="w-4 mr-2" />Tất cả
									</CommandItem>
									{statusOptions.map((opt) => (
										<CommandItem
											key={opt.value}
											onSelect={() => { setFilters({ statusId: opt.value }); setOpen(false); }}
											className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5"
										>
											<div className="w-4 mr-2 flex justify-center">
												{filters.statusId === opt.value && <Check className="h-3.5 w-3.5" />}
											</div>
											{opt.label}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					)}

					{view === "priority" && (
						<Command>
							<div className="flex items-center gap-2 p-2 border-b border-border/50">
								<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full hover:bg-muted" onClick={() => setView("main")}>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<span className="font-semibold text-[13px] flex-1">Độ ưu tiên</span>
							</div>
							<CommandInput placeholder="Tìm độ ưu tiên..." className="text-[13px] h-10 border-0 focus:ring-0" />
							<CommandList>
								<CommandEmpty className="py-6 text-center text-sm">Không tìm thấy.</CommandEmpty>
								<CommandGroup>
									<CommandItem
										onSelect={() => { setFilters({ priorityId: undefined }); setOpen(false); }}
										className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5"
									>
										<div className="w-4 mr-2" />Tất cả
									</CommandItem>
									{priorityOptions.map((opt) => (
										<CommandItem
											key={opt.value}
											onSelect={() => { setFilters({ priorityId: opt.value }); setOpen(false); }}
											className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5"
										>
											<div className="w-4 mr-2 flex justify-center">
												{filters.priorityId === opt.value && <Check className="h-3.5 w-3.5" />}
											</div>
											{opt.label}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					)}

					{view === "assignee" && (
						<Command>
							<div className="flex items-center gap-2 p-2 border-b border-border/50">
								<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 rounded-full hover:bg-muted" onClick={() => setView("main")}>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<span className="font-semibold text-[13px] flex-1">Người phụ trách</span>
							</div>
							<CommandInput placeholder="Tìm người phụ trách..." className="text-[13px] h-10 border-0 focus:ring-0" />
							<CommandList>
								<CommandEmpty className="py-6 text-center text-sm">Không tìm thấy.</CommandEmpty>
								<CommandGroup>
									<CommandItem
										onSelect={() => { setFilters({ assigneeId: undefined }); setOpen(false); }}
										className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5"
									>
										<div className="w-4 mr-2" />Tất cả
									</CommandItem>
									{assigneeOptions.map((opt) => (
										<CommandItem
											key={opt.value}
											onSelect={() => { setFilters({ assigneeId: opt.value }); setOpen(false); }}
											className="text-[13px] py-2 cursor-pointer rounded-lg mx-1 my-0.5"
										>
											<div className="w-4 mr-2 flex justify-center">
												{filters.assigneeId === opt.value && <Check className="h-3.5 w-3.5" />}
											</div>
											{opt.label}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					)}

				</PopoverContent>
			</Popover>

			{/* Clear All button if there's any active filter */}
			{(filters.search || filters.statusId || filters.priorityId || filters.assigneeId) && (
				<Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-rose-500">
					Xóa bộ lọc
				</Button>
			)}
		</div>
	);
};				