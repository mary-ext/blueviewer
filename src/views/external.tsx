import * as tldts from 'tldts';

import Document from '../components/Document.tsx';

import type { RouteMethods } from '../utils/router.ts';
import { html } from '../utils/response.ts';

import type { ExecutionContextWithEnv } from '../types.ts';

const methods: RouteMethods<ExecutionContextWithEnv> = {
	GET({ request }) {
		const url = new URL(request.url);
		const to = url.searchParams.get('to');

		return html(<Page uri={to} />);
	},
};

export default methods;

interface PageProps {
	uri: string | null;
}

const Page = (props: PageProps) => {
	const { uri } = props;

	if (typeof uri !== 'string' || !uri) {
		return (
			<Document page="external">
				<h1>This is awkward</h1>
				<p>url parameter not provided</p>
			</Document>
		);
	}

	return (
		<Document page="external">
			<h1>Link warning</h1>

			<p>The link you clicked were trying to direct to the following site</p>
			<p>{formatUrl(uri)}</p>
			<p>Please make sure this is the right site you intend to go to</p>

			<a href={'' + uri} rel="noopener noreferrer nofollow">
				Visit
			</a>
		</Document>
	);
};

const formatUrl = (uri: string) => {
	let url: URL;
	try {
		url = new URL(uri);
	} catch {
		return <strong>{uri}</strong>;
	}

	const hostname = url.hostname;
	const port = url.port;

	const tld = tldts.parse(hostname, { allowPrivateDomains: true });
	const domain = tld.domain;
	const subdomain = tld.subdomain;

	let prefix = '';
	let emboldened = '';

	if (domain) {
		if (subdomain) {
			prefix = subdomain + '.';
		}

		emboldened = domain + (port ? ':' + port : '');
	} else {
		emboldened = url.host;
	}

	return (
		<span class="linkwarn">
			{url.protocol + '//' + buildAuth(url) + prefix}
			<strong class="linkwarn__highlight">{emboldened}</strong>
			{url.pathname + url.search + url.hash}
		</span>
	);
};

const buildAuth = (url: URL) => {
	const username = url.username;
	const password = url.password;

	return username ? username + (password ? ':' + password : '') + '@' : '';
};
