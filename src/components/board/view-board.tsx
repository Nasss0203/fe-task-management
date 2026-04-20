import type { LucideIcon } from "lucide-react";
import {
	BarChart3,
	CalendarDays,
	FileText,
	GanttChart,
	Image,
	LayoutDashboard,
	LayoutList,
	List,
	Map,
	Rss,
	Table2,
} from "lucide-react";

import { BoardItem, BoardViewType } from "@/services/board/type";
import CalendarApp from "../calendar/calendar";
import { ProviderDragDrop } from "../dnd";
import BoardTable from "../table/BoardTable";

type BoardViewProps = {
	board: BoardItem;
};

const BoardView = ({ board }: BoardViewProps) => (
	<ProviderDragDrop
		workspaceId={board.workspaceId}
		projectId={board.projectId}
	/>
);

const CalendarView = () => <CalendarApp />;

const TableView = ({ board }: BoardViewProps) => (
	<BoardTable
		projectId={board.projectId}
		workspaceId={board.workspaceId}
	></BoardTable>
);

const ListView = ({ board }: BoardViewProps) => (
	<div>List view - {board.name}</div>
);

const Timeline = ({ board }: BoardViewProps) => (
	<div>Tiimeline - {board.name}</div>
);
const UnsupportedView = ({ board }: BoardViewProps) => (
	<div>View {board.viewType} chưa được hỗ trợ</div>
);

export type BoardViewConfig = {
	label: string;
	icon: LucideIcon;
	component: React.ComponentType<BoardViewProps>;
	enabled?: boolean;
};

export const BOARD_VIEW_CONFIG: Partial<
	Record<BoardViewType, BoardViewConfig>
> = {
	BOARD: {
		label: "Theo trạng thái",
		icon: LayoutList,
		component: BoardView,
		enabled: true,
	},
	TABLE: {
		label: "Table",
		icon: Table2,
		component: TableView,
		enabled: true,
	},
	LIST: {
		label: "List",
		icon: List,
		component: ListView,
		enabled: true,
	},
	CALENDAR: {
		label: "Calendar",
		icon: CalendarDays,
		component: CalendarView,
		enabled: true,
	},
	TIMELINE: {
		label: "Timeline",
		icon: GanttChart,
		component: Timeline,
		enabled: false,
	},
	GALLERY: {
		label: "Gallery",
		icon: Image,
		component: UnsupportedView,
		enabled: false,
	},
	CHART: {
		label: "Chart",
		icon: BarChart3,
		component: UnsupportedView,
		enabled: false,
	},
	DASHBOARD: {
		label: "Dashboard",
		icon: LayoutDashboard,
		component: UnsupportedView,
		enabled: false,
	},
	FORM: {
		label: "Form",
		icon: FileText,
		component: UnsupportedView,
		enabled: false,
	},
	MAP: {
		label: "Map",
		icon: Map,
		component: UnsupportedView,
		enabled: false,
	},
	FEED: {
		label: "Feed",
		icon: Rss,
		component: UnsupportedView,
		enabled: false,
	},
};
