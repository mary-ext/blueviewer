export type KnownMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';

type Promisable<T> = T | Promise<T>;

export type FallbackHandler<C = unknown> = (request: Request, context: C) => Promisable<Response>;

export type MissingHandler<C = unknown> = (
	known: KnownMethod[],
	request: Request,
	context: C,
) => Promisable<Response>;

export interface RouteHandlerContext<C = unknown> {
	request: Request;
	params: Record<string, string>;
	context: C;
}

export type RouteHandler<C = unknown> = (ctx: RouteHandlerContext<C>) => Promisable<Response>;

export interface RouteMethods<C = unknown> {
	all?: RouteHandler<C>;
	GET?: RouteHandler<C>;
	HEAD?: RouteHandler<C>;
	POST?: RouteHandler<C>;
	PUT?: RouteHandler<C>;
	DELETE?: RouteHandler<C>;
	OPTIONS?: RouteHandler<C>;
	PATCH?: RouteHandler<C>;
}

interface RouteDef<C> {
	path: string;
	pattern: URLPattern;
	handlers: RouteMethods<C>;
	methods: KnownMethod[];
}

export interface RouterOptions<C = unknown> {
	fallback?: FallbackHandler<C>;
	missing?: MissingHandler<C>;
}

export const knownMethods: KnownMethod[] = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];

export const defaultFallbackHandler: FallbackHandler = () => {
	return new Response(null, { status: 404 });
};

export const defaultMissingHandler: MissingHandler = (known: KnownMethod[]) => {
	return new Response(null, { status: 405, headers: { accept: known.join(', ') } });
};

export class Router<C = unknown> {
	private routes: RouteDef<C>[] = [];

	private handleFallback: FallbackHandler;
	private handleMissing: MissingHandler;

	constructor(options: RouterOptions<C> = {}) {
		this.handleFallback = options.fallback ?? (defaultFallbackHandler as any);
		this.handleMissing = options.missing ?? (defaultMissingHandler as any);
	}

	add(path: string, handlers: RouteMethods<C>) {
		this.routes.push({
			path: path,
			pattern: new URLPattern({ pathname: path }),
			handlers,
			methods: handlers.all ? knownMethods : (Object.keys(handlers) as KnownMethod[]),
		});
	}

	match(request: Request, context: C) {
		const url = request.url;
		const method = request.method as KnownMethod;

		const routes = this.routes;

		for (let idx = 0, len = routes.length; idx < len; idx++) {
			const route = routes[idx];
			const match = route.pattern.exec(url);

			if (match) {
				const params = match.pathname.groups;

				const handlers = route.handlers;
				const handler = handlers[method] ?? handlers.all;

				if (handler) {
					return handler({ request, params, context });
				} else {
					return this.handleMissing(route.methods, request, context);
				}
			}
		}

		return this.handleFallback(request, context);
	}
}
