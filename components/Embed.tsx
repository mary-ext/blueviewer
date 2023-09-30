import type { RefOf } from '@intrnl/bluesky-client/atp-schema';

import EmbedImage from './EmbedImage.tsx';

type BskyEmbed = NonNullable<RefOf<'app.bsky.feed.defs#postView'>['embed']>;
type EmbeddedImage = RefOf<'app.bsky.embed.images#viewImage'>;
type EmbeddedLink = RefOf<'app.bsky.embed.external#viewExternal'>;
type EmbeddedRecord = RefOf<'app.bsky.embed.record#view'>['record'];

interface EmbedProps {
	embed: BskyEmbed;
}

const Embed = (props: EmbedProps) => {
	const { embed } = props;

	const { images, link, record } = getEmbed(embed);

	return <div class="embed">{images && <EmbedImage images={images} />}</div>;
};

export default Embed;

const getEmbed = (embed: BskyEmbed) => {
	const type = embed.$type;

	let images: EmbeddedImage[] | undefined;
	let link: EmbeddedLink | undefined;
	let record: EmbeddedRecord | undefined;

	if (type === 'app.bsky.embed.external#view') {
		link = embed.external;
	} else if (type === 'app.bsky.embed.images#view') {
		images = embed.images;
	} else if (type === 'app.bsky.embed.record#view') {
		record = embed.record;
	} else if (type === 'app.bsky.embed.recordWithMedia#view') {
		const rec = embed.record.record;

		const media = embed.media;
		const mediatype = media.$type;

		record = rec;

		if (mediatype === 'app.bsky.embed.external#view') {
			link = media.external;
		} else if (mediatype === 'app.bsky.embed.images#view') {
			images = media.images;
		}
	}

	return { images, link, record };
};
