import { timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import type { TemplatePreview } from "@/entities/template";
import { TemplateSnapshotRenderer } from "@/features/template-preview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PageProps = {
	params: Promise<{
		templateId: string;
		versionId: string;
	}>;
};

function isValidRenderKey(
	providedKey: string | null,
	expectedKey: string,
): boolean {
	if (!providedKey || !expectedKey) {
		return false;
	}

	const providedBuffer = Buffer.from(providedKey, "utf8");
	const expectedBuffer = Buffer.from(expectedKey, "utf8");

	if (providedBuffer.length !== expectedBuffer.length) {
		return false;
	}

	return timingSafeEqual(providedBuffer, expectedBuffer);
}

export default async function InternalTemplateRenderPage({
	params,
}: PageProps) {
	const { templateId, versionId } = await params;

	const requestHeaders = await headers();

	const providedKey = requestHeaders.get("x-template-render-key");

	const internalKey = process.env.TEMPLATE_RENDER_INTERNAL_KEY;

	if (!internalKey) {
		throw new Error("TEMPLATE_RENDER_INTERNAL_KEY is not configured");
	}

	if (!isValidRenderKey(providedKey, internalKey)) {
		notFound();
	}

	const apiUrl = process.env.NEXT_PUBLIC_API_URL;

	if (!apiUrl) {
		throw new Error("NEXT_PUBLIC_API_URL is not configured");
	}

	const response = await fetch(
		`${apiUrl}/internal/templates/${templateId}/versions/${versionId}/preview`,
		{
			method: "GET",
			headers: {
				"x-template-render-key": internalKey,
			},
			cache: "no-store",
		},
	);

	if (!response.ok) {
		throw new Error(
			`Failed to load internal template preview: ${response.status}`,
		);
	}

	const payload = (await response.json()) as
		| TemplatePreview
		| {
				data: TemplatePreview;
		  };

	const preview = "data" in payload ? payload.data : payload;

	return (
		<TemplateSnapshotRenderer
			template={preview.template}
			blocks={preview.blocks}
			databases={preview.databases}
		/>
	);
}
