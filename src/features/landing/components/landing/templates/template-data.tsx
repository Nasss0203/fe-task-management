export type TemplateItem = {
	id: string | number;
	title: string;
	description: string;
	variant:
		| "kanban"
		| "mindmap"
		| "checklist"
		| "timeline"
		| "planner"
		| "meeting";
};

export const templateItems: TemplateItem[] = [
	{
		id: 1,
		title: "Mẫu Khởi động Dự án",
		description:
			"Mẫu toàn diện này bao gồm các yếu tố chính từ việc thiết lập mục tiêu đến phân công tác vụ, cung cấp nền tảng có cấu trúc cho sự thành công của dự án.",
		variant: "kanban",
	},
	{
		id: 2,
		title: "Mẫu Tiến độ Dự án",
		description:
			"Xác định mục tiêu, chia nhỏ chúng thành các bước có thể thực hiện và theo dõi tiến độ của bạn để đạt được mục tiêu.",
		variant: "timeline",
	},
	{
		id: 3,
		title: "Chương trình Họp Nhóm",
		description:
			"Được cấu trúc để bao gồm các điểm thảo luận quan trọng, hành động và theo dõi, mẫu này đảm bảo nhóm của bạn luôn tập trung và đồng bộ.",
		variant: "mindmap",
	},
	{
		id: 4,
		title: "Danh sách Công việc Hàng ngày",
		description:
			"Dễ dàng sắp xếp và ưu tiên các tác vụ trong ngày, đảm bảo không có gì bị bỏ sót và tối đa hóa năng suất hàng ngày của bạn.",
		variant: "checklist",
	},
	{
		id: 5,
		title: "Bảng Thiết lập Mục tiêu",
		description:
			"Xác định mục tiêu, chia nhỏ chúng thành các bước có thể thực hiện và theo dõi tiến độ của bạn để đạt được mục tiêu.",
		variant: "timeline",
	},
	{
		id: 6,
		title: "Kế hoạch Năng suất Cá nhân",
		description:
			"Tổ chức các tác vụ, thiết lập mức độ ưu tiên và theo dõi thành tựu của bạn để tối đa hóa hiệu quả trong các hoạt động hàng ngày.",
		variant: "planner",
	},
];
