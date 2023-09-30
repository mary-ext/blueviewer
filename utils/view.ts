import type { DID, RefOf, UnionOf } from '@intrnl/bluesky-client/atp-schema';

type Thread = RefOf<'app.bsky.feed.defs#threadViewPost'>;

export const filterReplies = (
	replies: Thread['replies'],
	author?: DID,
): UnionOf<'app.bsky.feed.defs#threadViewPost'>[] => {
	if (replies) {
		const _replies = replies as UnionOf<'app.bsky.feed.defs#threadViewPost'>[];

		if (author) {
			_replies.sort((a, b) => {
				const aIsSameAuthor = a.post.author.did === author;
				const bIsSameAuthor = b.post.author.did === author;

				return +bIsSameAuthor - +aIsSameAuthor;
			});
		}

		return _replies;
	}

	return [];
};

export const clsx = (classes: (string | false | 0 | null | undefined)[]) => {
	let result = '';

	let idx = 0;
	let len = classes.length;

	let tmp: any;

	for (; idx < len; idx++) {
		if ((tmp = classes[idx])) {
			result && (result += ' ');
			result += tmp;
		}
	}

	return result;
};
