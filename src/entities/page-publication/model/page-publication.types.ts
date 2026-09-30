export type PagePublicationStatus = {
	published: boolean;

	site_id?: string;

	page_id?: string;

	subdomain?: string;

	path?: string;

	published_at?: string;

	unpublished_at?: string | null;
};

export type PublishSitePayload = {
	include_descendants: boolean;
};

export type PagePublicationType = "DIRECT" | "INHERITED";

export type PagePublication = {
	id: string;
	page_id: string;
	site_id: string;
	subdomain: string;
	parent_publication_id: string | null;
	path: string;
	publication_type: PagePublicationType;
	include_descendants: boolean;
	published: boolean;
	published_at: string | null;
	unpublished_at: string | null;
};

export type PublishSiteResponse = {
	site_id: string;

	page_id: string;

	subdomain: string;

	path: string;

	published_at: string;
};

export type UnpublishSiteResponse = {
	published: false;

	site_id: string;

	page_id: string;

	subdomain: string;

	path: string;

	unpublished_at: string | null;
};
