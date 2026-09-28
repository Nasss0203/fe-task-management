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
	subdomain: string;
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
