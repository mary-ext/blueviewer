import type { Records } from '@intrnl/bluesky-client/atp-schema';
import { repeat } from '@intrnl/jsx-to-string';

import { isLinkValid, segmentRichText } from '../utils/richtext.ts';

export interface PostContentProps {
	record: Records['app.bsky.feed.post'];
}

const PostContent = (props: PostContentProps) => {
	const { record } = props;

	const text = record.text;
	const facets = record.facets;

	if (facets) {
		const segments = segmentRichText({ text, facets });
		const nodes = repeat(segments, (segment) => {
			const text = segment.text;

			const link = segment.link;
			const mention = segment.mention;
			const tag = segment.tag;

			if (link) {
				const uri = link.uri;
				const valid = isLinkValid(uri, text);

				const to = valid ? uri : `/?url=${encodeURIComponent(uri)}`;

				return (
					<a class="rt-link" href={to} target="_blank" rel="noopener noreferrer nofollow">
						{text}
					</a>
				);
			} else if (mention) {
				const did = mention.did;

				return (
					<span class="rt-mention" data-did={did}>
						{text}
					</span>
				);
			} else if (tag) {
				const hashtag = tag.tag;

				return (
					<span class="rt-hashtag" data-tag={hashtag}>
						{text}
					</span>
				);
			}

			return text;
		});

		return <>{nodes}</>;
	}

	return <>{text}</>;
};

export default PostContent;
