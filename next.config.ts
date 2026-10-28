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
	"https://player.vimeo.com",
	"https://www.loom.com",
	"https://open.spotify.com",
	"https://res.cloudinary.com",
	"https://*.r2.cloudflarestorage.com",
	"https://*.r2.dev",
	"https://*.amazonaws.com",
];

const contentSecurityPolicy = [
	"default-src 'self'",
	// Next.js chèn inline script; dev cần thêm eval cho React Refresh
	// Vercel Speed Insights chỉ tải script từ va.vercel-scripts.com ở dev; production dùng /_vercel (cùng origin)
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""} https://gist.github.com`,
	"style-src 'self' 'unsafe-inline' https://github.githubassets.com",
	"img-src 'self' data: blob: https:",
	"media-src 'self' blob: https:",
	"font-src 'self' data:",
	`connect-src 'self' ${apiOrigin}${isDev ? " ws:" : ""}`,
	`frame-src 'self' ${FRAME_SOURCES.join(" ")}`,
	"object-src 'none'",
	"base-uri 'self'",
	// SePay checkout gửi form POST sang cổng thanh toán (xem navigateToBillingCheckout)
	"form-action 'self' https://pay-sandbox.sepay.vn",
	"frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						// Thêm nguồn mới (embed, CDN, cổng thanh toán) vào danh sách trên, nếu không trình duyệt sẽ chặn
						key: "Content-Security-Policy",
						value: contentSecurityPolicy,
					},
				],
			},
		];
	},
};

export default nextConfig;
