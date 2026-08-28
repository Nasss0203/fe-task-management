"use client";

import { useMutation } from "@tanstack/react-query";

import { attachmentApi } from "../api/attachment-api";
import type { UploadAttachmentInput } from "./attachment.types";

export function useUploadAttachment() {
	return useMutation({
		mutationFn: (input: UploadAttachmentInput) =>
			attachmentApi.upload(input),
	});
}

export function useCreateAttachmentDownloadUrl() {
	return useMutation({
		mutationFn: (attachmentId: string) =>
			attachmentApi.createDownloadUrl(attachmentId),
	});
}
