import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

function getOrigin(url: string | undefined): string {
	try {
		return url ? new URL(url).origin : "";
	} catch {
		return "";
	}
}

const apiOrigin = getOrigin(process.env.NEXT_PUBLIC_API_URL);

/**
 * Nguồn iframe được phép. Giữ khớp với resolve-embed.ts (FE)
 * và page-block-embed.policy.ts (BE), cộng thêm YouTube (block Video)
 * và nơi lưu file cho xem trước PDF.
 */
const FRAME_SOURCES = [
	"https://www.figma.com",
	"https://www.google.com",
	"https://maps.google.com",
	"https://platform.twitter.com",
	"https://www.youtube.com",
	"https://www.youtube-nocookie.com",
	"https://res.cloudinary.com",
	"https://*.r2.cloudflarestorage.com",
	"https://*.r2.dev",
	"https://*.amazonaws.com",
];

const contentSecurityPolicy = [
	"default-src 'self'",
	// Next.js chèn inline script; dev cần thêm eval cho React Refresh
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://gist.github.com`,
	"style-src 'self' 'unsafe-inline' https://github.githubassets.com",
	"img-src 'self' data: blob: https:",
	"media-src 'self' blob: https:",
	"font-src 'self' data:",
	`connect-src 'self' ${apiOrigin}${isDev ? " ws:" : ""}`,
	`frame-src 'self' ${FRAME_SOURCES.join(" ")}`,
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						// shortcut: chỉ báo vi phạm trong console, chưa chặn; đổi sang
						// "Content-Security-Policy" sau khi dùng thử toàn bộ app không còn báo lỗi
						key: "Content-Security-Policy-Report-Only",
						value: contentSecurityPolicy,
					},
				],
			},
		];
	},
};

export default nextConfig;
