import { WorkspaceItem } from "../shared/types";
import { getStatusClass } from "../shared/utils";

type Props = {
	items: WorkspaceItem[];
};

export function RecentWorkspacesTable({ items }: Props) {
	return (
		<div className='rounded-2xl border border-neutral-800 bg-neutral-950/80 p-5'>
			<div className='mb-4 flex items-center justify-between'>
				<div>
					<h2 className='text-lg font-semibold text-white'>
						Recent Workspaces
					</h2>
					<p className='text-sm text-neutral-400'>
						New or recently updated workspaces.
					</p>
				</div>

				<button className='text-sm text-neutral-300 hover:text-white'>
					View all
				</button>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[820px] border-separate border-spacing-y-2 text-sm'>
					<thead>
						<tr className='text-left text-neutral-500'>
							<th className='pb-2 font-medium'>Workspace</th>
							<th className='pb-2 font-medium'>Owner</th>
							<th className='pb-2 font-medium'>Members</th>
							<th className='pb-2 font-medium'>Projects</th>
							<th className='pb-2 font-medium'>Plan</th>
							<th className='pb-2 font-medium'>Status</th>
						</tr>
					</thead>

					<tbody>
						{items.map((workspace) => (
							<tr
								key={workspace.name}
								className='bg-neutral-900/60 text-neutral-200'
							>
								<td className='rounded-l-xl px-4 py-4 font-medium text-white'>
									{workspace.name}
								</td>
								<td className='px-4 py-4 text-neutral-400'>
									{workspace.owner}
								</td>
								<td className='px-4 py-4'>
									{workspace.members}
								</td>
								<td className='px-4 py-4'>
									{workspace.projects}
								</td>
								<td className='px-4 py-4'>{workspace.plan}</td>
								<td className='rounded-r-xl px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
											workspace.status,
										)}`}
									>
										{workspace.status}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
