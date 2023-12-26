import type { DID, Records, RefOf, ResponseOf } from '@intrnl/bluesky-client/atp-schema';
import { repeat } from '@intrnl/jsx-to-string';

import Document from '../components/Document.tsx';
import PermalinkPost from '../components/PermalinkPost.tsx';
import Post from '../components/Post.tsx';

import { agent, getCollectionId, isDid } from '../utils/api.ts';
import { html } from '../utils/response.ts';
import type { RouteMethods } from '../utils/router.ts';
import { filterReplies } from '../utils/view.ts';

import type { ExecutionContextWithEnv } from '../types.ts';

const methods: RouteMethods<ExecutionContextWithEnv> = {
	async GET({ request }) {
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
	},
};

export default methods;

interface PageProps {
	thread: RefOf<'app.bsky.feed.defs#threadViewPost'>;
	url?: string;
}

const Page = (props: PageProps) => {
	const { thread, url } = props;

	const title = getTitle(thread);
	const replies = filterReplies(thread.replies, thread.post.author.did);

	return (
		<Document
			page="thread"
			title={title}
			head={
				<>
					{getEmbedHead(thread)}
					<script type="module" src="/assets/timestamp.js" />
				</>
			}
		>
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

const getEmbedHead = (thread: PageProps['thread']) => {
	const parent = thread.parent;
	const post = thread.post;

	const record = post.record as Records['app.bsky.feed.post'];

	const profile = post.author;
	const embed = post.embed;

	const title = profile.displayName ? `${profile.displayName} (@${profile.handle})` : profile.handle;

	const heads = [
		<>
			<meta name="theme-color" content="#0085ff" />
			<meta property="og:site_name" content="Blueviewer" />
		</>,
	];

	let header = '';
	let text = record.text;

	if (parent) {
		if (parent.$type === 'app.bsky.feed.defs#threadViewPost') {
			header += `[replying to @${parent.post.author.handle}] `;
		} else {
			header += `[reply: not found] `;
		}
	}

	if (embed) {
		const $type = embed.$type;

		let images: RefOf<'app.bsky.embed.images#viewImage'>[] | undefined;
		let record: RefOf<'app.bsky.embed.record#viewRecord'> | null | undefined;

		if ($type === 'app.bsky.embed.images#view') {
			images = embed.images;
		} else if ($type === 'app.bsky.embed.recordWithMedia#view') {
			const med = embed.media;

			const rec = embed.record.record;
			const rectype = rec.$type;

			if (med.$type === 'app.bsky.embed.images#view') {
				images = med.images;
			}

			if (getCollectionId(rec.uri) === 'app.bsky.feed.post') {
				if (rectype === 'app.bsky.embed.record#viewRecord') {
					record = rec;
				} else {
					record = null;
				}
			}
		} else if ($type === 'app.bsky.embed.record#view') {
			const rec = embed.record;
			const rectype = rec.$type;

			if (getCollectionId(rec.uri) === 'app.bsky.feed.post') {
				if (rectype === 'app.bsky.embed.record#viewRecord') {
					record = rec;
				} else {
					record = null;
				}
			}
		}

		if (images) {
			heads.push(
				<>
					<meta name="twitter:card" content="summary_large_image" />
					{repeat(images, (img) => (
						<meta property="og:image" content={img.fullsize} />
					))}
				</>,
			);
		}

		if (record === null) {
			header += `[quote: not found]`;
		} else if (record) {
			header += `[quoting @${record.author.handle}] `;
		}
	}

	if (header) {
		text = `${header}\n\n${text}`;
	}

	heads.push(
		<>
			<meta property="og:title" content={title} />
			<meta property="og:description" content={text} />
		</>,
	);

	return heads;
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
