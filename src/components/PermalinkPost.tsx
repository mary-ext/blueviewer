import type { Records, RefOf } from '@intrnl/bluesky-client/atp-schema';

import { getRecordId, getRepoId } from '../utils/api.ts';

import PostContent from './PostContent.tsx';
import Embed from './Embed.tsx';

interface PermalinkPostProps {
	thread: RefOf<'app.bsky.feed.defs#threadViewPost'>;
	url?: string;
}

const PermalinkPost = (props: PermalinkPostProps) => {
	const { thread, url } = props;

	const post = thread.post;
	const author = post.author;
	const record = post.record as Records['app.bsky.feed.post'];
	const embed = post.embed;

	const reply = record.reply;

	return (
		<div class="pl">
			<div class="pl-header">
				{author.avatar ? (
					<img src={author.avatar} loading="lazy" class="pl-header__avatar" />
				) : (
					<div class="pl-header__avatar"></div>
				)}

				<span class="pl-header__name" dir="auto">
					{author.displayName || ''}
				</span>
				<span class="pl-header__handle">@{author.handle}</span>
				<span class="pl-header__divider">·</span>
				<a href="#" class="pl-header__timestamp">
					{record.createdAt}
				</a>
			</div>

			<div class="pl-body">
				<PostContent record={record} />
				{embed != null && <Embed embed={embed} />}
			</div>

			<div class="pl-footer">
				<a href={getBskyAppUrl(author.did, getRecordId(post.uri))} target="_blank" class="pl-footer__link">
					bsky.app
				</a>

				{url != null && (
					<a
						href={`https://archive.is/?url=${encodeURIComponent(url)}`}
						target="_blank"
						class="pl-footer__link"
					>
						archive.is
					</a>
				)}

				{reply != null && (
					<>
						<a href={getReplyUrl(reply.parent)} class="pl-footer__link">
							parent
						</a>
						<a href={getReplyUrl(reply.root)} class="pl-footer__link">
							root
						</a>
					</>
				)}
			</div>
		</div>
	);
};

export default PermalinkPost;

const getBskyAppUrl = (actor: string, rkey: string) => {
	return `https://bsky.app/profile/${actor}/post/${rkey}`;
};

const getReplyUrl = (ref: RefOf<'com.atproto.repo.strongRef'>) => {
	const uri = ref.uri;

	const actor = getRepoId(uri);
	const rkey = getRecordId(uri);

	return `/view?actor=${encodeURIComponent(actor)}&rkey=${encodeURIComponent(rkey)}`;
};
