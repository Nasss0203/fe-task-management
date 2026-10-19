import { PageBlockType } from "../model/page-block.types";

export interface ResolvedEmbed {
	type: PageBlockType;
	height: number;
	src?: string;
	srcDoc?: string;
}

export const EMBED_BLOCK_TYPES = [
	PageBlockType.EMBED,
	PageBlockType.FIGMA,
	PageBlockType.GOOGLE_MAPS,
	PageBlockType.GITHUB_GIST,
	PageBlockType.TWEET,
];

function getMapsQuery(url: URL): string | null {
	const query = url.searchParams.get("q");

	if (query) return query;

	const segments = url.pathname.split("/").filter(Boolean);
	const placeIndex = segments.indexOf("place");

	if (placeIndex >= 0 && segments[placeIndex + 1]) {
		return decodeURIComponent(segments[placeIndex + 1]).replace(/\+/g, " ");
	}

	const coordinates = segments.find((segment) => segment.startsWith("@"));
	const match = coordinates?.match(/^@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

	return match ? `${match[1]},${match[2]}` : null;
}

export function resolveEmbed(input: string): ResolvedEmbed | null {
	let url: URL;

	try {
		url = new URL(input.trim());
	} catch {
		return null;
	}

	if (url.protocol !== "https:") return null;

	const host = url.hostname.replace(/^www\./, "");
	const segments = url.pathname.split("/").filter(Boolean);

	if (host === "figma.com") {
		if (segments[0] === "embed") {
			return { type: PageBlockType.FIGMA, height: 450, src: url.toString() };
		}

		if (["file", "design", "proto", "board", "slides"].includes(segments[0])) {
			return {
				type: PageBlockType.FIGMA,
				height: 450,
				src: `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url.toString())}`,
			};
		}

		return null;
	}

	if (
		(host === "google.com" && segments[0] === "maps") ||
		host === "maps.google.com"
	) {
		if (host === "google.com" && segments[1] === "embed") {
			return { type: PageBlockType.GOOGLE_MAPS, height: 360, src: url.toString() };
		}

		const query = getMapsQuery(url);

		return query
			? {
					type: PageBlockType.GOOGLE_MAPS,
					height: 360,
					src: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`,
				}
			: null;
	}

	if (host === "gist.github.com") {
		const [user, id] = segments;

		if (!user || !id || !/^[\w-]+$/.test(user) || !/^[0-9a-f]+$/i.test(id)) {
			return null;
		}

		return {
			type: PageBlockType.GITHUB_GIST,
			height: 360,
			srcDoc: `<base target="_blank"><script src="https://gist.github.com/${user}/${id}.js"></script>`,
		};
	}

	if (host === "twitter.com" || host === "x.com") {
		const id = segments[1] === "status" ? segments[2] : undefined;

		return id && /^\d+$/.test(id)
			? {
					type: PageBlockType.TWEET,
					height: 560,
					src: `https://platform.twitter.com/embed/Tweet.html?id=${id}`,
				}
			: null;
	}

	return null;
}
