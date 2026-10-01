const RESERVED_SUBDOMAINS = new Set(["api", "www"]);
const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function normalizeHostname(host: string): string {
	return host.trim().toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

function getConfiguredRootDomain(): string | null {
	const value = process.env.NEXT_PUBLIC_APP_DOMAIN;

	if (!value) return null;

	const domain = normalizeHostname(value);

	if (!domain || domain.includes("/") || domain.includes(":")) {
		return null;
	}

	return domain;
}

export function getPublicSiteSubdomain(hostname: string): string | null {
	const normalizedHostname = normalizeHostname(hostname);
	let candidate: string | null = null;

	if (normalizedHostname.endsWith(".localhost")) {
		candidate = normalizedHostname.slice(0, -".localhost".length);
	} else {
		const rootDomain = getConfiguredRootDomain();

		if (!rootDomain || normalizedHostname === rootDomain) {
			return null;
		}

		const rootDomainSuffix = `.${rootDomain}`;

		if (!normalizedHostname.endsWith(rootDomainSuffix)) {
			return null;
		}

		candidate = normalizedHostname.slice(0, -rootDomainSuffix.length);
	}

	if (
		!candidate ||
		candidate.includes(".") ||
		!SUBDOMAIN_PATTERN.test(candidate) ||
		RESERVED_SUBDOMAINS.has(candidate)
	) {
		return null;
	}

	return candidate;
}

export function isPublicSiteHostname(hostname: string): boolean {
	return getPublicSiteSubdomain(hostname) !== null;
}
