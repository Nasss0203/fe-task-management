"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { useUsableTemplateVersions } from "@/entities/template";
import { UseTemplateDialog } from "@/features/template-use";

interface LibraryUseTemplateDialogProps {
	template: { id: string; name: string };
	userId: string;
	onClose: () => void;
}

/**
 * Use from the library pins a release the backend says this user may use
 * (a FREE_CLAIM only covers free releases), never the listing's latest version.
 */
export function LibraryUseTemplateDialog({
	template,
	userId,
	onClose,
}: LibraryUseTemplateDialogProps) {
	const usable = useUsableTemplateVersions(template.id, { userId });
	const versions = usable.data?.items ?? [];
	const current = versions.find((version) => version.is_current) ?? versions[0];
	const unavailable = usable.isError || (usable.isSuccess && !current);

	useEffect(() => {
		if (!unavailable) return;
		toast.error("No release of this template is available for you to use.");
		onClose();
	}, [unavailable, onClose]);

	if (!current) return null;

	return (
		<UseTemplateDialog
			template={template}
			version={current}
			versions={versions}
			open
			onOpenChange={(open) => !open && onClose()}
		/>
	);
}
