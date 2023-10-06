import { Router, defaultFallbackHandler } from './utils/router.ts';

import externalView from './views/external.tsx';
import indexView from './views/index.tsx';
import viewView from './views/view.tsx';

interface Env {}

interface ExecutionContextWithEnv extends ExecutionContext {
	env: Env;
}

const router = new Router<ExecutionContextWithEnv>({});

const handler: ExportedHandler<Env> = {
	fetch(request, env, context) {
		const ctx: ExecutionContextWithEnv = { ...context, env };
		return router.match(request, ctx);
	},
};

router.add('/external', externalView);
router.add('/view', viewView);
router.add('/', indexView);

export default handler;
