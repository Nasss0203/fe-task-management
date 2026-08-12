"use client";

import { deleteAttachmentApi, getAttachmentDownloadUrlApi, getTaskAttachmentsApi, uploadAttachmentApi } from "@/services/attachment/attachment.service";
import type { TaskItem } from "@/services/task/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const MAX_ATTACHMENT_SIZE_MB = 50;
const MAX_FILE_SIZE = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;

export function useTaskAttachments(task: TaskItem) {
	const queryClient = useQueryClient();
	const [isUploading, setIsUploading] = useState(false);

	const { data: attachmentsData, isLoading: isLoadingAttachments } = useQuery({
		queryKey: ["task-attachments", task.id],
		queryFn: () => getTaskAttachmentsApi(task.id),
		enabled: !!task.id,
	});

	const attachments = attachmentsData?.data ?? [];

	const handleUpload = async (files: File[]) => {
		if (!files.length) return;

		const validFiles: File[] = [];
		for (const file of files) {
			if (file.size > MAX_FILE_SIZE) {
				toast.error(
					`Tệp ${file.name} vượt quá giới hạn ${MAX_ATTACHMENT_SIZE_MB}MB.`,
				);
				continue;
			}
			validFiles.push(file);
		}

		if (validFiles.length === 0) return;

		setIsUploading(true);
		
		try {
			const promises = validFiles.map((file) =>
				uploadAttachmentApi(task.workspaceId, task.id, undefined, file)
			);
			
			const results = await Promise.allSettled(promises);
			
			const succeeded = results.filter((r) => r.status === "fulfilled").length;
			const failed = results.filter((r) => r.status === "rejected").length;
			
			if (succeeded > 0) {
				toast.success(`Đã tải lên ${succeeded} tệp.`);
				queryClient.invalidateQueries({ queryKey: ["task-attachments", task.id] });
			}
			if (failed > 0) {
				toast.error(`Không thể tải lên ${failed} tệp.`);
			}
		} catch {
			toast.error("Đã xảy ra lỗi khi tải tệp lên.");
		} finally {
			setIsUploading(false);
		}
	};

	const { mutate: deleteAttachment } = useMutation({
		mutationFn: deleteAttachmentApi,
		onSuccess: () => {
			toast.success("Đã xóa tệp đính kèm.");
			queryClient.invalidateQueries({ queryKey: ["task-attachments", task.id] });
		},
		onError: () => {
			toast.error("Không thể xóa tệp đính kèm.");
		},
	});

	const handleDownload = async (id: string, fileName: string) => {
		try {
			const response = await getAttachmentDownloadUrlApi(id);
			const url = response.data.downloadUrl;
			
			const link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			link.target = "_blank";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch {
			toast.error("Không thể lấy liên kết tải xuống.");
		}
	};

	return {
		attachments,
		isLoadingAttachments,
		isUploading,
		handleUpload,
		handleDownload,
		deleteAttachment,
	};
}
