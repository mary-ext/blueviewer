import { type JSXNode, render } from '@intrnl/jsx-to-html';

type HeadersRecord = Record<string, string | undefined>;

export interface ExtRequestInit extends Omit<ResponseInit, 'headers'> {
	headers?: HeadersRecord;
}

const HTML_HEADERS = {
	'content-type': 'text/html; charset=utf-8',
};

export const respond = (body?: BodyInit | null | undefined, init?: ResponseInit) => {
	return new Response(body, init);
};

export const html = (node: JSXNode, args?: ExtRequestInit) => {
	const init: ResponseInit = { ...args, headers: { ...HTML_HEADERS, ...args?.headers } };
	const result = '<!doctype html>' + render(node);

	return respond(result, init);
};

export const json = Response.json;
export const redirect = Response.redirect;
