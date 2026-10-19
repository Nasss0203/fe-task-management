export const CREATOR_LINK_KEYS = [
	"website",
	"x",
	"github",
	"linkedin",
	"youtube",
	"facebook",
] as const;

export type CreatorLinkKey = (typeof CREATOR_LINK_KEYS)[number];

export type CreatorLinks = Record<CreatorLinkKey, string | null>;

export type CreatorImageKind = "avatar" | "cover";

/** GET /public/creators/:handle */
export interface PublicCreatorProfile {
	handle: string;
	display_name: string;
	headline: string | null;
	bio: string | null;
	avatar_url: string | null;
	cover_url: string | null;
	links: CreatorLinks;
	stats: {
		template_count: number;
		rating_average: number | null;
		rating_count: number;
		like_count: number;
	};
	joined_at: string;
}

/** GET /creators/me/profile */
export interface MyCreatorProfile {
	/** False until the creator saves the form once; `handle` is then a suggestion. */
	has_profile: boolean;
	handle: string;
	display_name: string | null;
	headline: string | null;
	bio: string | null;
	avatar_url: string | null;
	cover_url: string | null;
	links: CreatorLinks;
}

export type UpsertCreatorProfileInput = {
	handle: string;
	display_name: string | null;
	headline: string | null;
	bio: string | null;
} & CreatorLinks;
