import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock3, Ellipsis, Eye } from "lucide-react";
import type { AdminAuditLog } from "../shared/audit-log-admin.types";
import {
	formatDate,
	formatRelativeTime,
	getActionLabel,
	getSeverityClass,
	getSeverityLabel,
	getTargetLabel,
} from "../shared/audit-log-admin.utils";

type Props = {
	logs: AdminAuditLog[];
	onView: (log: AdminAuditLog) => void;
};

export function AuditLogManagementTable({ logs, onView }: Props) {
	if (!logs.length) {
		return (
			<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-10 text-center'>
				<p className='text-sm text-neutral-400'>
					Không có audit log phù hợp.
				</p>
			</div>
		);
	}

	return (
		<div className='rounded-[28px] border border-white/10 bg-[#0b0b0b] p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]'>
			<div className='mb-5 flex items-start justify-between gap-4'>
				<div>
					<h2 className='text-2xl font-semibold text-white'>
						Nhật ký hệ thống
					</h2>
					<p className='mt-1 text-sm text-neutral-400'>
						Ghi nhận các hành động quan trọng và cho phép xem before
						/ after chi tiết.
					</p>
				</div>

				<div className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-300'>
					{logs.length} logs
				</div>
			</div>

			<div className='overflow-x-auto'>
				<table className='w-full min-w-[1350px] border-separate border-spacing-y-3'>
					<thead>
						<tr className='text-left text-sm text-neutral-500'>
							<th className='px-4 py-2 font-medium'>Actor</th>
							<th className='px-4 py-2 font-medium'>Action</th>
							<th className='px-4 py-2 font-medium'>Target</th>
							<th className='px-4 py-2 font-medium'>Severity</th>
							<th className='px-4 py-2 font-medium'>Mô tả</th>
							<th className='px-4 py-2 font-medium'>Thời gian</th>
							<th className='px-4 py-2 font-medium text-right'>
								Actions
							</th>
						</tr>
					</thead>

					<tbody>
						{logs.map((log) => (
							<tr
								key={log.id}
								className='text-sm text-neutral-200'
							>
								<td className='rounded-l-3xl border-y border-l border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{log.actorName}
										</p>
										<p className='text-xs text-neutral-500'>
											{log.actorEmail}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-white'>
									{getActionLabel(log.action)}
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<p className='font-medium text-white'>
											{log.targetName}
										</p>
										<p className='text-xs text-neutral-500'>
											{getTargetLabel(log.targetType)}
										</p>
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<span
										className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getSeverityClass(
											log.severity,
										)}`}
									>
										{getSeverityLabel(log.severity)}
									</span>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4 text-neutral-300'>
									<div className='max-w-[320px] truncate'>
										{log.description}
									</div>
								</td>

								<td className='border-y border-white/5 bg-[#101010] px-4 py-4'>
									<div className='space-y-1'>
										<div className='inline-flex items-center gap-2 text-neutral-300'>
											<Clock3 className='h-4 w-4 text-neutral-500' />
											<span>
												{formatRelativeTime(
													log.createdAt,
												)}
											</span>
										</div>
										<p className='text-xs text-neutral-500'>
											{formatDate(log.createdAt)}
										</p>
									</div>
								</td>

								<td className='rounded-r-3xl border-y border-r border-white/5 bg-[#101010] px-4 py-4'>
									<div className='flex justify-end'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#171717] text-neutral-300 transition hover:bg-white/5 hover:text-white'>
													<Ellipsis className='h-4 w-4' />
												</button>
											</DropdownMenuTrigger>

											<DropdownMenuContent
												align='end'
												className='w-52 rounded-2xl border border-white/10 bg-[#0f0f0f] p-2 text-white'
											>
												<DropdownMenuItem
													onClick={() => onView(log)}
													className='cursor-pointer rounded-xl px-3 py-2 text-sm focus:bg-white/5 focus:text-white'
												>
													<Eye className='mr-2 h-4 w-4' />
													Xem chi tiết
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
