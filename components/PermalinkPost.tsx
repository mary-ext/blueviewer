import type { Records, RefOf } from '@intrnl/bluesky-client/atp-schema';

import PostContent from './PostContent.tsx';
import Embed from './Embed.tsx';

interface PermalinkPostProps {
	thread: RefOf<'app.bsky.feed.defs#threadViewPost'>;
}

const PermalinkPost = (props: PermalinkPostProps) => {
	const { thread } = props;

	const post = thread.post;
	const author = post.author;
	const record = post.record as Records['app.bsky.feed.post'];
	const embed = post.embed;

	return (
		<div class="pl">
			<div class="pl-header">
				{author.avatar ? (
					<img src={author.avatar} class="pl-header__avatar" />
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
				{embed && <Embed embed={embed} />}
			</div>
		</div>
	);
};

export default PermalinkPost;
