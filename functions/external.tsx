import * as tldts from 'tldts';

import Document from '~/components/Document.tsx';

import { html, respond } from '~/utils/response.ts';

export const onRequest: PagesFunction = async (context) => {
	const request = context.request;
	const method = request.method;

	if (method !== 'GET') {
		return respond('Method not allowed', { status: 405, headers: { allow: 'GET' } });
	}

	const url = new URL(request.url);
	const uri = url.searchParams.get('to');

	return html(<Page uri={uri} />);
};

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

	const tld = tldts.parse(hostname);
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
