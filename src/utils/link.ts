export class UriParseError extends Error {
	name = 'UriParseError';
}

export interface ParseResult {
	actor: string;
	rkey: string;
}

const BSKY_URL_RE = /\/profile\/([^\/]+)\/post\/([^\/]+)$/;
const AT_URL_RE = /^at:\/\/(did:[^\/]+)\/app\.bsky\.feed\.post\/([^\/]+)$/;

export const getPostUri = (uri: URL): ParseResult => {
	const protocol = uri.protocol;
	const host = uri.host;
	const pathname = uri.pathname;

	let match: RegExpExecArray | null;

	if (protocol === 'at:') {
		if ((match = AT_URL_RE.exec(uri.href))) {
			return { actor: match[1], rkey: match[2] };
		}

		throw new UriParseError(`Invalid at:// URI`);
	}

	if (protocol !== 'https:' && protocol !== 'http:') {
		throw new UriParseError(`Invalid URL protocol`);
	}

	if (
		host === 'bsky.app' ||
		host === 'staging.bsky.app' ||
		host === 'langit.pages.dev' ||
		host === 'tokimeki.blue'
	) {
		if ((match = BSKY_URL_RE.exec(pathname))) {
			return { actor: match[1], rkey: match[2] };
		}

		throw dieInvalidHostUrl(host);
	}

	if (host === 'klearsky.pages.dev') {
		const atUri = uri.searchParams.get('uri');

		if (atUri && (match = AT_URL_RE.exec(atUri))) {
			return { actor: match[1], rkey: match[2] };
		}

		throw dieInvalidHostUrl(host);
	}

	throw dieUnsupportedHost(host);
};

const dieInvalidHostUrl = (host: string) => {
	return new UriParseError(`Invalid ${host} URL`);
};

const dieUnsupportedHost = (host: string) => {
	return new UriParseError(`Unsupported host: ${host}`);
};
