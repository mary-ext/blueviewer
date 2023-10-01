import type { DID, Records, RefOf, ResponseOf } from '@intrnl/bluesky-client/atp-schema';
import { repeat } from '@intrnl/jsx-to-html';

import Document from '~/components/Document.tsx';
import PermalinkPost from '~/components/PermalinkPost.tsx';
import Post from '~/components/Post.tsx';

import { agent, isDid } from '~/utils/api.ts';
import { html, respond } from '~/utils/response.ts';
import { filterReplies } from '~/utils/view.ts';

export const onRequest: PagesFunction = async (context) => {
	const request = context.request;
	const method = request.method;

	if (method !== 'GET') {
		return respond('Method not allowed', { status: 405, headers: { allow: 'GET' } });
	}

	const url = new URL(request.url);
	const actor = url.searchParams.get('actor');
	const rkey = url.searchParams.get('rkey');

	if (!actor || !rkey) {
		return html(<ErrorPage message="Invalid parameters" />, { status: 400 });
	}

	let thread: ResponseOf<'app.bsky.feed.getPostThread'>['thread'];
	try {
		let did: DID;
		if (isDid(actor)) {
			did = actor;
		} else {
			const response = await agent.rpc.get('com.atproto.identity.resolveHandle', {
				params: {
					handle: actor,
				},
			});

			did = response.data.did;
		}

		const response = await agent.rpc.get('app.bsky.feed.getPostThread', {
			params: {
				uri: `at://${did}/app.bsky.feed.post/${rkey}`,
				parentHeight: 1,
				depth: 6,
			},
		});

		thread = response.data.thread;
	} catch (error) {
		return html(<ErrorPage message="Error occured when retrieving the thread" error={error} />, {
			status: 500,
		});
	}

	if (thread.$type !== 'app.bsky.feed.defs#threadViewPost') {
		return html(<NotFoundPage />, { status: 404 });
	}

	return html(<Page thread={thread} url={request.url} />, { status: 200 });
};

interface PageProps {
	thread: RefOf<'app.bsky.feed.defs#threadViewPost'>;
	url?: string;
}

const Page = (props: PageProps) => {
	const { thread, url } = props;

	const title = getTitle(thread);
	const replies = filterReplies(thread.replies, thread.post.author.did);

	return (
		<Document page="thread" title={title}>
			<PermalinkPost thread={thread} url={url} />

			<hr class="divider" />

			<div class="children">
				{repeat(replies, (reply, idx, array) => (
					<Post thread={reply} last={idx === array.length - 1} />
				))}
			</div>
		</Document>
	);
};

const getTitle = (thread: PageProps['thread']) => {
	const post = thread.post;

	const author = post.author;
	const record = post.record as Records['app.bsky.feed.post'];

	return `${author.displayName || `@${author.handle}`}: "${record.text}" / Blueviewer`;
};

const NotFoundPage = () => {
	return (
		<Document page="thread-notfound">
			<h1>Thread not found</h1>
			<p>Did you put in the right URL?</p>
		</Document>
	);
};

const ErrorPage = (props: { message: string; error?: unknown }) => {
	const { message, error } = props;

	return (
		<Document page="thread-error">
			<h1>Something went wrong</h1>
			<p>{message}</p>
			{error ? <p>{'' + error}</p> : null}
		</Document>
	);
};
