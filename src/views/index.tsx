import Document from '../components/Document.tsx';

import { type ParseResult, UriParseError, getPostUri } from '../utils/link.ts';
import type { RouteMethods } from '../utils/router.ts';
import { html, redirect } from '../utils/response.ts';

import type { ExecutionContextWithEnv } from '../types.ts';

interface FormResult {
	error: string;
	uri?: string;
}

const methods: RouteMethods<ExecutionContextWithEnv> = {
	async GET() {
		return html(<Page />);
	},
	async POST({ request }) {
		let form: FormResult | undefined;

		jump: {
			const data = await request.formData();
			const url = new URL(request.url);

			const uri = data.get('uri');

			if (!uri || typeof uri !== 'string') {
				form = { uri: undefined, error: `URL not provided` };
				break jump;
			}

			let parsedUrl: URL;
			try {
				parsedUrl = new URL(uri);
			} catch {
				form = { uri, error: `Invalid URL` };
				break jump;
			}

			let parsed: ParseResult;
			try {
				parsed = getPostUri(parsedUrl);
			} catch (err) {
				if (err instanceof UriParseError) {
					form = { uri, error: err.message };
					break jump;
				} else {
					form = { uri, error: `Unknown parsing error` };
					break jump;
				}
			}

			const redirectUrl = new URL('/view', url);
			redirectUrl.searchParams.set('actor', parsed.actor);
			redirectUrl.searchParams.set('rkey', parsed.rkey);

			return redirect('' + redirectUrl, 303);
		}

		return html(<Page form={form} />, { status: form ? 400 : 200 });
	},
};

export default methods;

interface PageProps {
	form?: FormResult;
}

const Page = (props: PageProps) => {
	const { form } = props;

	return (
		<Document page="main">
			<h1>Blueviewer</h1>

			<p>Bluesky thread viewer</p>

			<form method="post">
				<input type="url" name="uri" value={form?.uri} /> <button type="submit">View</button>
				{form !== undefined && <p class="error">{form.error}</p>}
			</form>

			<p>Accepts URLs from bsky.app, Langit, Tokimeki and Klearsky.</p>
			<p>
				<a href="https://github.com/mary-ext/blueviewer">source code</a>
			</p>
		</Document>
	);
};
