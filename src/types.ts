export interface Env {}

export interface ExecutionContextWithEnv extends ExecutionContext {
	env: Env;
}
