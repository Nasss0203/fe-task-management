"use client";

import { AddPeopleDialog } from "@/components/dialog/AddPeopleDialog";
import { SettingsAccessSection } from "@/features/workspace/components/settings/SettingsAccessSection";
import { useMember } from "@/features/member/hooks/useMember";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { useState } from "react";
import { useParams } from "next/navigation";
import { LoadingDashboard } from "@/features/dashboard/components/overview/LoadingDashboard";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { PERMISSIONS } from "@/constants/permissions";
import { UserPlus } from "lucide-react";

const MemberPage = () => {
	const params = useParams();
	const workspaceSlug = params?.slug as string;

	const { workspaceFindAll: { data: workspaceQuery, isLoading: isWorkspaceLoading } } = useWorkspace();
	const workspaces = workspaceQuery?.data ?? [];
	const workspace = workspaces.find((item) => item.slug === workspaceSlug);

	const { findAllMember } = useMember({ workspaceId: workspace?.id });
	const members = findAllMember.data?.data ?? [];
	const isMembersLoading = findAllMember.isPending;

	const [openAddPeopleDialog, setOpenAddPeopleDialog] = useState(false);

	if (isWorkspaceLoading) return <LoadingDashboard />;

	if (!workspace) {
		return (
			<div className="flex w-full items-center justify-center p-10">
				<p className="text-muted-foreground">Không tìm thấy Workspace.</p>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold tracking-tight">Thành viên</h1>
					<p className="text-muted-foreground">
						Quản lý các thành viên trong workspace <strong>{workspace.name}</strong>.
					</p>
				</div>
				<RequirePermission workspaceId={workspace.id} code={PERMISSIONS.WORKSPACE_MEMBER_ADD} mode="hide">
					<button
						type='button'
						onClick={() => setOpenAddPeopleDialog(true)}
						className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500'
					>
						<UserPlus size={16} />
						Thêm thành viên
					</button>
				</RequirePermission>
			</div>

			<div className="w-full">
				<SettingsAccessSection
					workspaceId={workspace.id}
					members={members}
					isMembersLoading={isMembersLoading}
					onAddPeople={() => setOpenAddPeopleDialog(true)}
					hideHeader
				/>
			</div>

			<AddPeopleDialog
				workspaceId={workspace.id}
				open={openAddPeopleDialog}
				onOpenChange={setOpenAddPeopleDialog}
			/>
		</div>
	);
};

export default MemberPage;
