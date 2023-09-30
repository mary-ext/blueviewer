import type { RefOf } from '@intrnl/bluesky-client/atp-schema';
import { repeat } from '@intrnl/jsx-to-html';

type EmbeddedImage = RefOf<'app.bsky.embed.images#viewImage'>;

export interface EmbedImageProps {
	images: EmbeddedImage[];
}

const EmbedImage = (props: EmbedImageProps) => {
	const { images } = props;

	return (
		<div class="embed-image">
			{repeat(images, (image) => {
				return (
					<a class="embed-image-item" href={image.fullsize} target="_blank">
						<img
							src={image.thumb}
							height={image.aspectRatio?.height}
							width={image.aspectRatio?.width}
							title={image.alt}
							class="embed-image-item_img"
						/>
					</a>
				);
			})}
		</div>
	);
};

export default EmbedImage;
