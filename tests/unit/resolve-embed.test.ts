import { describe, expect, it } from "vitest";

import { resolveEmbed } from "@/entities/page-block/lib/resolve-embed";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

describe("resolveEmbed", () => {
	it("wraps Figma design links in the Figma embed URL", () => {
		const result = resolveEmbed("https://www.figma.com/design/abc123/My-file");

		expect(result?.type).toBe(PageBlockType.FIGMA);
		expect(result?.src).toBe(
			"https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2Fabc123%2FMy-file",
		);
	});

	it("builds a Google Maps embed from place and coordinate links", () => {
		expect(
			resolveEmbed("https://www.google.com/maps/place/Hoan+Kiem+Lake/@21.02,105.85,15z")?.src,
		).toBe("https://maps.google.com/maps?q=Hoan%20Kiem%20Lake&output=embed");
		expect(resolveEmbed("https://www.google.com/maps/@21.0285,105.8542,14z")?.src).toBe(
			"https://maps.google.com/maps?q=21.0285%2C105.8542&output=embed",
		);
	});

	it("renders gists through a script inside srcDoc", () => {
		const result = resolveEmbed("https://gist.github.com/octocat/6cad326836d38bd3a7ae");

		expect(result?.type).toBe(PageBlockType.GITHUB_GIST);
		expect(result?.srcDoc).toContain(
			'src="https://gist.github.com/octocat/6cad326836d38bd3a7ae.js"',
		);
	});

	it("maps tweet links on twitter.com and x.com", () => {
		expect(resolveEmbed("https://x.com/jack/status/20")?.src).toBe(
			"https://platform.twitter.com/embed/Tweet.html?id=20",
		);
		expect(resolveEmbed("https://twitter.com/jack/status/20")?.type).toBe(
			PageBlockType.TWEET,
		);
	});

	it("embeds Vimeo, Loom and Spotify links with the generic Embed block", () => {
		expect(resolveEmbed("https://vimeo.com/76979871")).toEqual({
			type: PageBlockType.EMBED,
			height: 360,
			src: "https://player.vimeo.com/video/76979871",
		});
		expect(resolveEmbed("https://player.vimeo.com/video/76979871")?.src).toBe(
			"https://player.vimeo.com/video/76979871",
		);
		expect(resolveEmbed("https://www.loom.com/share/0281766fa2d04bb788eaf19e65135184")).toEqual({
			type: PageBlockType.EMBED,
			height: 400,
			src: "https://www.loom.com/embed/0281766fa2d04bb788eaf19e65135184",
		});
		expect(resolveEmbed("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=x")).toEqual({
			type: PageBlockType.EMBED,
			height: 152,
			src: "https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC",
		});
		expect(resolveEmbed("https://open.spotify.com/intl-vi/playlist/37i9dQZF1DXcBWIGoYBM5M")).toEqual({
			type: PageBlockType.EMBED,
			height: 352,
			src: "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M",
		});
	});

	it("rejects malformed Vimeo, Loom and Spotify links", () => {
		expect(resolveEmbed("https://vimeo.com/channels/staffpicks")).toBeNull();
		expect(resolveEmbed("https://player.vimeo.com/123")).toBeNull();
		expect(resolveEmbed("https://www.loom.com/looms/videos")).toBeNull();
		expect(resolveEmbed("https://open.spotify.com/user/spotify")).toBeNull();
		expect(resolveEmbed("https://open.spotify.com/track/<script>")).toBeNull();
	});

	it("rejects hosts outside the whitelist, http and malformed ids", () => {
		expect(resolveEmbed("https://evil.example.com/embed")).toBeNull();
		expect(resolveEmbed("http://www.figma.com/design/abc")).toBeNull();
		expect(resolveEmbed("https://gist.github.com/octocat/<script>")).toBeNull();
		expect(resolveEmbed("https://x.com/jack/status/abc")).toBeNull();
		expect(resolveEmbed("javascript:alert(1)")).toBeNull();
		expect(resolveEmbed("not a url")).toBeNull();
	});
});
