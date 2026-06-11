import Image from "next/image";
import type { WorkspaceMemberItem } from "@/services/member/type";
import { RequirePermission } from "@/features/permission/components/RequirePermission";
import { PERMISSIONS } from "@/constants/permissions";

interface SettingsAccessSectionProps {
	members: WorkspaceMemberItem[];
	isMembersLoading: boolean;
	workspaceId: string;
	onAddPeople: () => void;
}

export function SettingsAccessSection({
	members,
	isMembersLoading,
	workspaceId,
	onAddPeople,
}: SettingsAccessSectionProps) {
	return (
		<div className='max-w-4xl space-y-4'>
			<div className='flex items-center justify-between gap-4'>
				<div>
					<div className='text-sm font-semibold'>
						Current users
					</div>
					<div className='mt-1 text-sm text-muted-foreground'>
						Manage workspace members and roles.
					</div>
				</div>
				<RequirePermission workspaceId={workspaceId} code={PERMISSIONS.WORKSPACE_MEMBER_ADD} mode="hide">
					<button
						type='button'
						onClick={onAddPeople}
						className='rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400'
					>
						Add people
					</button>
				</RequirePermission>
			</div>

			<div className='rounded-md border border-border'>
				<div className='grid grid-cols-[1fr_220px_120px] border-b border-border px-4 py-3 text-xs font-semibold uppercase text-muted-foreground'>
					<div>Name</div>
					<div>Role</div>
					<div>Action</div>
				</div>
				{isMembersLoading ? (
					<div className='px-4 py-4 text-sm text-muted-foreground'>
						Loading members...
					</div>
				) : members.length === 0 ? (
					<div className='px-4 py-4 text-sm text-muted-foreground'>
						No members found in this workspace yet.
					</div>
				) : (
					members.map((member) => (
						<div
							key={member.id}
							className='grid grid-cols-[1fr_220px_120px] items-center border-t border-border px-4 py-4 text-sm first:border-t-0'
						>
							<div className='flex min-w-0 items-center gap-3'>
								<div className='flex size-8 items-center justify-center overflow-hidden rounded-full bg-violet-600 text-xs font-bold uppercase'>
									{member.avatar_url ? (
										<Image
											src={member.avatar_url}
											alt={member.full_name}
											width={32}
											height={32}
											className='size-full object-cover'
										/>
									) : (
										member.full_name?.charAt(0) ??
										member.email?.charAt(0) ??
										"U"
									)}
								</div>
								<div className='min-w-0'>
									<div className='truncate font-medium'>
										{member.full_name || member.email}
									</div>
									<div className='truncate text-xs text-muted-foreground'>
										{member.email}
									</div>
								</div>
							</div>
							<div className='uppercase text-foreground'>
								{member.role_name}
							</div>
							<div className='text-muted-foreground'>-</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
