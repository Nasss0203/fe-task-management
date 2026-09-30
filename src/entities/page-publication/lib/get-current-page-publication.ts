import type { PagePublication } from "../model/page-publication.types";

export interface GetCurrentPagePublicationParams {
	isRootPage: boolean;
	publicSubdomain?: string | null;
	publications: PagePublication[];
}

export function getCurrentPagePublication({
	isRootPage,
	publicSubdomain,
	publications,
}: GetCurrentPagePublicationParams): PagePublication | null {
	if (isRootPage) {
		// Root: Ưu tiên record publication_type === "DIRECT" thuộc root site hiện tại.
		// Nếu có publicSubdomain, tìm direct publication có subdomain khớp và published === true trước.
		if (publicSubdomain) {
			const directActive = publications.find(
				(p) =>
					p.publication_type === "DIRECT" &&
					p.subdomain === publicSubdomain &&
					p.published,
			);
			if (directActive) return directActive;

			const directUnpublished = publications.find(
				(p) =>
					p.publication_type === "DIRECT" &&
					p.subdomain === publicSubdomain,
			);
			if (directUnpublished) return directUnpublished;
		}

		// Fallback: Tìm direct publication published bất kỳ, hoặc direct bất kỳ
		const directPublished = publications.find(
			(p) => p.publication_type === "DIRECT" && p.published,
		);
		if (directPublished) return directPublished;

		const directAny = publications.find(
			(p) => p.publication_type === "DIRECT",
		);
		return directAny ?? null;
	}

	// The backend list is scoped to the current root site. Keep private inherited
	// records so the child toggle can reactivate the same publication and path.
	return publications.find((p) => p.publication_type === "INHERITED") ?? null;
}
