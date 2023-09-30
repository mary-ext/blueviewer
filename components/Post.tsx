import type { Records, RefOf } from '@intrnl/bluesky-client/atp-schema';
import { repeat } from '@intrnl/jsx-to-html';

import { getRecordId } from '~/utils/api.ts';
import { clsx, filterReplies } from '~/utils/view.ts';

import PostContent from './PostContent.tsx';
import Embed from './Embed.tsx';

export interface PostProps {
	thread: RefOf<'app.bsky.feed.defs#threadViewPost'>;
	last?: boolean;
}

const Post = (props: PostProps) => {
	const { thread, last = false } = props;

	const post = thread.post;

	const author = post.author;
	const record = post.record as Records['app.bsky.feed.post'];
	const embed = post.embed;

	const replies = filterReplies(thread.replies, author.did);

	const permalink = getPermalinkUrl(author.did, getRecordId(post.uri));

	return (
		<details open id={post.cid} class={clsx(['post', !last && 'is-lined'])}>
			<summary class="post-header">
				{author.avatar ? (
					<img src={author.avatar} class="post-header__avatar" />
				) : (
					<div class="post-header__avatar"></div>
				)}

				<span class="post-header__name" dir="auto">
					{author.displayName || ''}
				</span>
				<span class="post-header__handle">@{author.handle}</span>
				<span class="post-header__divider">·</span>
				<a href={permalink} class="post-header__timestamp">
					{record.createdAt}
				</a>
				<a href={`#${post.cid}`} class="post-header__anchor">
					#
				</a>
			</summary>

			<div class="post-body">
				<PostContent record={record} />
				{embed && <Embed embed={embed} />}
			</div>

			<div class="post-children">
				{repeat(replies, (reply, idx, array) => (
					<Post thread={reply} last={idx === array.length - 1} />
				))}
			</div>

			{replies.length === 0 && post.replyCount ? (
				<div class="post-footer">
					<a class="show-more" href={permalink}>
						<svg class="show-more__icon" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="m7.825 10l2.9 2.9q.3.3.288.7t-.288.7q-.3.3-.7.313t-.7-.288L4.7 9.7q-.15-.15-.213-.325T4.425 9q0-.2.063-.375T4.7 8.3l4.575-4.575q.3-.3.713-.3t.712.3q.3.3.3.7t-.3.7L7.825 8H17q.825 0 1.413.588T19 10v9q0 .425-.288.713T18 20q-.425 0-.713-.288T17 19v-9H7.825Z"
							/>
						</svg>
						<span class="show-more__text">view reply</span>
					</a>
				</div>
			) : null}
		</details>
	);
};

export default Post;

const getPermalinkUrl = (actor: string, rkey: string) => {
	return `/view?actor=${encodeURIComponent(actor)}&rkey=${encodeURIComponent(rkey)}`;
};
