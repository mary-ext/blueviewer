import { Agent } from '@intrnl/bluesky-client/agent';
import type { DID } from '@intrnl/bluesky-client/atp-schema';

// We're connecting directly to the App View service, instead of through a PDS,
// like the premiere bsky.social PDS instance.
export const agent = new Agent({ serviceUri: 'https://api.bsky.app' });

// This allows for public viewing of any data in Bluesky, as AppView endpoints
// are unauthenticated, and it's by design. It's not clear if PDS endpoints are
// planned to be unauthenticated in the long run, but this one works.

export const isDid = (str: string): str is DID => {
	return str.startsWith('did:');
};

export const getRecordId = (uri: string) => {
	const idx = uri.lastIndexOf('/');
	return uri.slice(idx + 1);
};

export const getCollectionId = (uri: string) => {
	const first = uri.indexOf('/', 5);
	const second = uri.indexOf('/', first + 1);

	return uri.slice(first + 1, second);
};

export const getRepoId = (uri: string) => {
	const idx = uri.indexOf('/', 5);
	return uri.slice(5, idx);
};
